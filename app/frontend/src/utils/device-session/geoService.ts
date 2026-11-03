import type { GeoLocationInfo } from "./types";

const DEFAULT_GEO: GeoLocationInfo = {
  ip: "124.248.173.5",
  location: "Phnom Penh, Cambodia",
};

let cachedGeo: GeoLocationInfo | null = null;

/**
 * Resolves public IP and approximate location via fast external lookup,
 * with in-memory caching and fallback.
 */
export async function fetchGeoLocation(): Promise<GeoLocationInfo> {
  if (cachedGeo) return cachedGeo;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 600);
    const res = await fetch("https://ipwho.is/", { signal: controller.signal });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false && data.ip) {
        const city = data.city || "";
        const country = data.country || "";
        const location =
          city && country ? `${city}, ${country}` : DEFAULT_GEO.location;
        cachedGeo = { ip: data.ip, location };
        return cachedGeo;
      }
    }
  } catch {
    // Non-blocking failover
  }

  cachedGeo = { ...DEFAULT_GEO };
  return cachedGeo;
}
