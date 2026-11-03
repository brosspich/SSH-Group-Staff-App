import { Request, Response } from "express";
import { prisma } from "../../infrastructure/database/prisma.js";

function parseJsonField(val: any): any {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
      return [parsed];
    } catch {
      return [val];
    }
  }
  return [val];
}

function parseCoordinatesFromText(
  str: string,
): { latitude: number; longitude: number } | null {
  if (!str || typeof str !== "string") return null;
  const trimmed = str.trim();

  // 1. Direct coordinates e.g. "11.536042, 104.858154" or "11.536042,104.858154"
  const directMatch = trimmed.match(/^[-+]?\d+\.\d+[\s,]+[-+]?\d+\.\d+$/);
  if (directMatch) {
    const parts = trimmed.split(/[\s,]+/);
    const lat = parseFloat(parts[0]);
    const lon = parseFloat(parts[1]);
    if (!isNaN(lat) && !isNaN(lon)) {
      return { latitude: lat, longitude: lon };
    }
  }

  // 2. Query param e.g. ?q=11.536042,104.858154
  const qMatch = trimmed.match(
    /[?&](?:q|query|ll|center)=([-+]?\d+\.\d+),([-+]?\d+\.\d+)/,
  );
  if (qMatch) {
    const lat = parseFloat(qMatch[1]);
    const lon = parseFloat(qMatch[2]);
    if (!isNaN(lat) && !isNaN(lon)) {
      return { latitude: lat, longitude: lon };
    }
  }

  // 3. Search path e.g. maps/search/11.502767,+104.851539
  const searchMatch = trimmed.match(
    /search\/([-+]?\d+\.\d+)[,\s\+]+([-+]?\d+\.\d+)/,
  );
  if (searchMatch) {
    const lat = parseFloat(searchMatch[1]);
    const lon = parseFloat(searchMatch[2]);
    if (!isNaN(lat) && !isNaN(lon)) {
      return { latitude: lat, longitude: lon };
    }
  }

  // 4. At match e.g. /@11.536042,104.858154
  const atMatch = trimmed.match(/@([-+]?\d+\.\d+),([-+]?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lon = parseFloat(atMatch[2]);
    if (!isNaN(lat) && !isNaN(lon)) {
      return { latitude: lat, longitude: lon };
    }
  }

  // 5. Pin data !3d11.536042!4d104.858154
  const pinMatch = trimmed.match(/!3d([-+]?\d+\.\d+)!4d([-+]?\d+\.\d+)/);
  if (pinMatch) {
    const lat = parseFloat(pinMatch[1]);
    const lon = parseFloat(pinMatch[2]);
    if (!isNaN(lat) && !isNaN(lon)) {
      return { latitude: lat, longitude: lon };
    }
  }

  return null;
}

// In-memory cache for resolved short URLs from database to avoid repeated network requests
const urlCoordinateCache = new Map<
  string,
  { latitude: number; longitude: number } | null
>();

async function resolveCoordinatesFromLocationArray(
  locationArray: string[],
): Promise<{ latitude: number; longitude: number; radiusMeters: number }> {
  for (const loc of locationArray) {
    if (!loc || typeof loc !== "string") continue;
    const str = loc.trim();
    if (!str) continue;

    // First try direct text parsing (fastest, 0ms, no network)
    const directCoords = parseCoordinatesFromText(str);
    if (directCoords) {
      return {
        latitude: directCoords.latitude,
        longitude: directCoords.longitude,
        radiusMeters: 150,
      };
    }

    // If cached previously, return cached result
    if (urlCoordinateCache.has(str)) {
      const cached = urlCoordinateCache.get(str);
      if (cached) {
        return {
          latitude: cached.latitude,
          longitude: cached.longitude,
          radiusMeters: 150,
        };
      }
      continue;
    }

    // If it's an HTTP URL (shortlink), attempt to follow redirects dynamically
    if (str.startsWith("http://") || str.startsWith("https://")) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1200);
        const res = await fetch(str, {
          redirect: "follow",
          signal: controller.signal,
        });
        clearTimeout(timeout);

        const finalUrl = res.url || "";
        if (finalUrl && finalUrl !== str) {
          const resolved = parseCoordinatesFromText(finalUrl);
          if (resolved) {
            urlCoordinateCache.set(str, resolved);
            return {
              latitude: resolved.latitude,
              longitude: resolved.longitude,
              radiusMeters: 150,
            };
          }
        }
      } catch (err) {
        // network or redirect timeout
      }
      urlCoordinateCache.set(str, null);
    }
  }

  // Strictly return 0 when database has no valid location configured (no hardcoded fallback)
  return { latitude: 0, longitude: 0, radiusMeters: 0 };
}

async function normalizeCompanyAsync(c: any) {
  if (!c) return c;
  const qr = parseJsonField(c.qrCodes);
  const loc = parseJsonField(c.location);
  const name = c.name || "";
  const coords = await resolveCoordinatesFromLocationArray(loc);

  return {
    id: c.id,
    name: name,
    companyName: name,
    company_name: name,
    qrCodes: qr,
    qrCode: qr,
    "qr-code": qr,
    location: loc,
    locationLinks: loc,
    location_links: loc,
    latitude: coords.latitude,
    longitude: coords.longitude,
    radiusMeters: coords.radiusMeters,
    radius_meters: coords.radiusMeters,
    telegramBotToken: c.telegramBotToken || "",
    telegram_bot_token: c.telegramBotToken || "",
    telegramChatId: c.telegramChatId || "",
    telegram_chat_id: c.telegramChatId || "",
    timeIn: c.timeIn || "08:00:00",
    "time-in": c.timeIn || "08:00:00",
    timeOut: c.timeOut || "17:00:00",
    "time-out": c.timeOut || "17:00:00",
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export class CompanyController {
  async getCompanies(req: Request, res: Response) {
    try {
      const { id, systemId } = req.query;
      const targetId = id || systemId ? String(id || systemId) : undefined;

      const companies = await prisma.company.findMany({
        where: targetId ? { id: targetId } : undefined,
        orderBy: { id: "asc" },
      });

      const normalized = await Promise.all(
        companies.map((c) => normalizeCompanyAsync(c)),
      );

      return res.status(200).json({
        success: true,
        data: normalized,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || "Failed to fetch companies" },
      });
    }
  }

  async getCompanyById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const company = await prisma.company.findUnique({
        where: { id: String(id) },
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          error: { message: "Company not found" },
        });
      }

      const normalized = await normalizeCompanyAsync(company);
      return res.status(200).json({
        success: true,
        data: normalized,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || "Failed to fetch company" },
      });
    }
  }
}

export const companyController = new CompanyController();
