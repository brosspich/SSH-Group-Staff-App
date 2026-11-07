/**
 * Calculates distance between two coordinates in meters using the Haversine formula
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Checks if IP belongs to virtual VPN adapter subnets (TUN/TAP interfaces)
 */
export function isVpnSubnet(ip?: string): boolean {
  if (!ip || typeof ip !== "string") return false;
  const cleanIp = ip.trim();

  // IPv4 Virtual Adapter VPN subnets
  if (
    cleanIp.startsWith("10.8.") ||
    cleanIp.startsWith("10.255.") ||
    cleanIp.startsWith("10.14.") ||
    cleanIp.startsWith("10.6.") ||
    cleanIp.startsWith("10.2.") ||
    cleanIp.startsWith("10.7.") ||
    cleanIp.startsWith("10.9.") ||
    cleanIp.startsWith("198.18.") ||
    cleanIp.startsWith("198.19.")
  ) {
    return true;
  }

  // 172.16.0.0 to 172.31.255.255 range (OpenVPN / WireGuard / Panda VPN)
  const parts = cleanIp.split(".");
  if (parts.length === 4) {
    const p1 = parseInt(parts[0], 10);
    const p2 = parseInt(parts[1], 10);
    if (p1 === 172 && p2 >= 16 && p2 <= 31) return true;
    if (p1 === 100 && p2 >= 64 && p2 <= 127) return true;
  }

  return false;
}

export type Coordinate = { latitude: number; longitude: number };

/**
 * Known pre-resolved coordinates for company Google Maps links and companies.
 * Supports multiple branches/locations per company.
 */
export const PRE_RESOLVED_COORDINATES: Record<string, Coordinate[]> = {
  "https://maps.app.goo.gl/ac74wdd5gt3nnuxa": [
    { latitude: 11.502767, longitude: 104.851539 },
  ],
  "https://maps.app.goo.gl/454nxaqay31nfqpo8": [
    { latitude: 11.5028527, longitude: 104.8515295 },
  ],
  "https://maps.app.goo.gl/6ye7ceewhb91b1tv9": [
    { latitude: 11.536203, longitude: 104.858147 },
  ],
  "system-0001": [{ latitude: 11.502767, longitude: 104.851539 }],
  "system-0002": [
    { latitude: 11.536203, longitude: 104.858147 }, // Branch A (Bpak Developer Office)
    { latitude: 11.502767, longitude: 104.851539 }, // Branch B (SSH Group Office)
  ],
  "system-0003": [{ latitude: 11.556372, longitude: 104.92821 }],
};

const resolvedUrlCache = new Map<string, Coordinate>();

/**
 * Parses coordinates from text, direct string, or Google Maps URL.
 * If multiple coordinates exist for a key, returns the primary (first) coordinate.
 */
export function parseCoordinates(str: string): Coordinate | null {
  if (!str || typeof str !== "string") return null;
  const trimmed = str.trim();
  const lower = trimmed.toLowerCase();

  // 0. Check pre-resolved map & cache
  if (PRE_RESOLVED_COORDINATES[lower]) {
    const list = PRE_RESOLVED_COORDINATES[lower];
    return list.length > 0 ? list[0] : null;
  }
  if (resolvedUrlCache.has(lower)) {
    return resolvedUrlCache.get(lower)!;
  }

  // 1. Direct coordinates e.g. "11.502767, 104.851539" or "11.502767 104.851539"
  const directMatch = trimmed.match(/^[-+]?\d+\.\d+[\s,]+[-+]?\d+\.\d+$/);
  if (directMatch) {
    const parts = trimmed.split(/[\s,]+/);
    const lat = parseFloat(parts[0]);
    const lon = parseFloat(parts[1]);
    if (!isNaN(lat) && !isNaN(lon)) {
      return { latitude: lat, longitude: lon };
    }
  }

  // 2. Google Maps exact pin data !3d11.536203!4d104.858147
  const pinMatch = trimmed.match(/!3d([-+]?\d+\.\d+)!4d([-+]?\d+\.\d+)/);
  if (pinMatch) {
    const lat = parseFloat(pinMatch[1]);
    const lon = parseFloat(pinMatch[2]);
    if (!isNaN(lat) && !isNaN(lon)) return { latitude: lat, longitude: lon };
  }

  // 3. Direct match for @lat,lon (e.g. .../@11.502767,104.851553...)
  const atMatch = trimmed.match(/@([-+]?\d+\.\d+),([-+]?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lon = parseFloat(atMatch[2]);
    if (!isNaN(lat) && !isNaN(lon)) return { latitude: lat, longitude: lon };
  }

  // 4. Google Maps query param e.g. ?q=11.502767,104.851539
  const qMatch = trimmed.match(
    /[?&](?:q|query|ll|center)=([-+]?\d+\.\d+),([-+]?\d+\.\d+)/,
  );
  if (qMatch) {
    const lat = parseFloat(qMatch[1]);
    const lon = parseFloat(qMatch[2]);
    if (!isNaN(lat) && !isNaN(lon)) return { latitude: lat, longitude: lon };
  }

  // 5. Search path e.g. search/11.502767,+104.851539 or place/11.502767,104.851539
  const searchMatch = trimmed.match(
    /(?:search|place|dir)\/([-+]?\d+\.\d+)[,\s\+]+([-+]?\d+\.\d+)/,
  );
  if (searchMatch) {
    const lat = parseFloat(searchMatch[1]);
    const lon = parseFloat(searchMatch[2]);
    if (!isNaN(lat) && !isNaN(lon)) return { latitude: lat, longitude: lon };
  }

  return null;
}

/**
 * Returns all coordinates configured for a key (e.g. company id or url).
 * Supports multi-location companies with multiple branches (e.g. system-0002).
 */
export function getCoordinatesList(key?: string): Coordinate[] {
  if (!key || typeof key !== "string") return [];
  const lower = key.trim().toLowerCase();
  if (PRE_RESOLVED_COORDINATES[lower]) {
    return [...PRE_RESOLVED_COORDINATES[lower]];
  }
  const single = parseCoordinates(key);
  return single ? [single] : [];
}

/**
 * Resolves coordinates asynchronously (handles HTTP redirect for shortened Google Maps URLs)
 */
export async function resolveCoordinatesAsync(
  str: string,
): Promise<Coordinate | null> {
  const syncResult = parseCoordinates(str);
  if (syncResult) return syncResult;

  if (
    typeof str === "string" &&
    (str.startsWith("http://") || str.startsWith("https://"))
  ) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(str, {
        signal: controller.signal,
        redirect: "follow",
      });
      clearTimeout(timeout);

      const finalUrl = res.url || "";
      if (finalUrl && finalUrl !== str) {
        const resolved = parseCoordinates(finalUrl);
        if (resolved) {
          resolvedUrlCache.set(str.trim().toLowerCase(), resolved);
          return resolved;
        }
      }
    } catch {
      // Fallback if network lookup timed out
    }
  }

  return null;
}

/**
 * Parses time string like "08:00:00" or "17:00" into total minutes of the day
 */
function parseTimeToMinutes(timeStr?: string, defaultMinutes = 480): number {
  if (!timeStr || typeof timeStr !== "string") return defaultMinutes;
  const parts = timeStr.trim().split(":");
  if (parts.length < 2) return defaultMinutes;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return defaultMinutes;
  return h * 60 + m;
}

/**
 * Calculates attendance type ("time-in" | "time-out" | "time-other") based on official server time
 * Condition:
 * Time-In window:  [timeIn - 60min, timeIn + 60min]
 * Time-Out window: [timeOut - 60min, timeOut + 60min]
 */
export function evaluateAttendanceType(
  now = new Date(),
  timeInStr = "08:00:00",
  timeOutStr = "17:00:00",
): "time-in" | "time-out" | "time-other" {
  // Convert now to Cambodia UTC+7 time
  const utcOffsetMs = 7 * 60 * 60 * 1000;
  const cambodiaDate = new Date(
    now.getTime() + utcOffsetMs + now.getTimezoneOffset() * 60000,
  );
  const hours = cambodiaDate.getHours();
  const minutes = cambodiaDate.getMinutes();
  const currentTotalMinutes = hours * 60 + minutes;

  const inTarget = parseTimeToMinutes(timeInStr, 480); // 8:00 AM
  const inStart = inTarget - 60;
  const inEnd = inTarget + 60;

  const outTarget = parseTimeToMinutes(timeOutStr, 1020); // 5:00 PM
  const outStart = outTarget - 60;
  const outEnd = outTarget + 60;

  // Condition 1: Time-In Window
  if (currentTotalMinutes >= inStart && currentTotalMinutes <= inEnd) {
    return "time-in";
  }

  // Condition 2: Time-Out Window
  if (currentTotalMinutes >= outStart && currentTotalMinutes <= outEnd) {
    return "time-out";
  }

  // Condition 3: Otherwise Time-Other
  return "time-other";
}

/**
 * Validates scanned QR code against allowed QR codes from database
 */
export function validateQrCode(
  scannedData: string,
  allowedQrCodes: string[],
): boolean {
  if (!scannedData || typeof scannedData !== "string") return false;
  if (!allowedQrCodes || allowedQrCodes.length === 0) return false;

  const cleanScan = scannedData.trim().toLowerCase();
  let decodedScan = cleanScan;
  try {
    decodedScan = decodeURIComponent(scannedData).trim().toLowerCase();
  } catch {}

  return allowedQrCodes.some((code) => {
    if (!code || typeof code !== "string") return false;
    const cleanCode = code.trim().toLowerCase();
    let decodedCode = cleanCode;
    try {
      decodedCode = decodeURIComponent(code).trim().toLowerCase();
    } catch {}

    return (
      cleanScan === cleanCode ||
      decodedScan === decodedCode ||
      cleanScan === decodedCode ||
      decodedScan === cleanCode
    );
  });
}

/**
 * Formats date as YYYY-MM-DD in UTC+7
 */
export function formatServerDateYMD(date = new Date()): string {
  const utcOffsetMs = 7 * 60 * 60 * 1000;
  const cambodiaDate = new Date(
    date.getTime() + utcOffsetMs + date.getTimezoneOffset() * 60000,
  );
  const y = cambodiaDate.getFullYear();
  const m = String(cambodiaDate.getMonth() + 1).padStart(2, "0");
  const d = String(cambodiaDate.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Formats time as 12-hour format e.g. "8:05:20 AM" in UTC+7
 */
export function formatServerTime12h(date = new Date()): string {
  const utcOffsetMs = 7 * 60 * 60 * 1000;
  const cambodiaDate = new Date(
    date.getTime() + utcOffsetMs + date.getTimezoneOffset() * 60000,
  );
  let h = cambodiaDate.getHours();
  const m = String(cambodiaDate.getMinutes()).padStart(2, "0");
  const s = String(cambodiaDate.getSeconds()).padStart(2, "0");
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m}:${s} ${period}`;
}

/**
 * Generates the next sequential Attendance ID formatted per user:
 * e.g. "system-0001-0022-ATT-0000-0001", "system-0002-0001-ATT-0000-0001"
 */
export function generateNextAttendanceId(
  systemId: string = "system-0001-0000",
  existingList: any[] = [],
  existingDbRecords: any[] = [],
): string {
  const cleanSystemId = (systemId || "system-0001-0000").trim();
  let maxSeq = 0;
  const allRecords = [...existingList, ...existingDbRecords];

  for (const item of allRecords) {
    if (item?.userId && String(item.userId).trim() !== cleanSystemId) {
      continue;
    }

    const rawId = String(item?.id || "").trim();
    if (!rawId) continue;

    // Skip records that clearly belong to another user's prefix
    if (rawId.startsWith("system-") && !rawId.startsWith(cleanSystemId)) {
      continue;
    }

    // 1. Standard format: system-0001-0022-ATT-0000-0001 or ATT-0000-0001
    const matchNew = rawId.match(/ATT-(\d{4})-(\d{4})(?:$|[^\d])/i);
    if (matchNew) {
      const num = parseInt(matchNew[1] + matchNew[2], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
        continue;
      }
    }

    // 2. Legacy triple-block format: att-0000-0000-0022 or 0022_att-0000-0000-0022
    const matchOldTriple = rawId.match(/att-(\d{4})-(\d{4})-(\d{4})/i);
    if (matchOldTriple) {
      const num = parseInt(
        matchOldTriple[1] + matchOldTriple[2] + matchOldTriple[3],
        10,
      );
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
        continue;
      }
    }

    // 3. Fallback for any other ATT-(\d+) pattern
    const matchGeneral = rawId.match(/ATT-?(\d+)/i);
    if (matchGeneral) {
      const num = parseInt(matchGeneral[1], 10);
      if (!isNaN(num) && num > maxSeq && num < 100000000) {
        maxSeq = num;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  const seqStr = String(nextSeq).padStart(8, "0");
  const block1 = seqStr.substring(0, 4);
  const block2 = seqStr.substring(4, 8);

  return `${cleanSystemId}-ATT-${block1}-${block2}`;
}
