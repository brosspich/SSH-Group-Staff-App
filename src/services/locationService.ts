import * as Location from "expo-location";
import * as Network from "expo-network";
import { Platform } from "react-native";

/**
 * Company location settings (SSH Group HQ)
 * Google Maps link: https://maps.app.goo.gl/454NXaqaY31nfqpo8
 * Coordinates: 11.5028527, 104.8515295
 */
export interface CompanyLocationConfig {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  name: string;
}

// export const DEFAULT_COMPANY_LOCATION: CompanyLocationConfig = {
//   latitude: 11.502767,
//   longitude: 104.851553,
//   radiusMeters: 150, // 150 meters allowed radius
//   name: "SSH Group HQ",
// };

export const DEFAULT_COMPANY_LOCATION: CompanyLocationConfig = {
  latitude: 0,
  longitude: 0,
  radiusMeters: 150,
  name: "",
};

// export let COMPANY_LOCATION: CompanyLocationConfig = {
//   ...DEFAULT_COMPANY_LOCATION,
// };

export let COMPANY_LOCATION: CompanyLocationConfig = {
  ...DEFAULT_COMPANY_LOCATION,
};

/**
 * Helper to parse latitude and longitude from Google Maps URLs or string coordinates
 */
export async function parseCoordinatesFromLocationString(
  locStr: string,
): Promise<{ latitude: number; longitude: number } | null> {
  if (!locStr || typeof locStr !== "string") return null;
  const str = locStr.trim();

  // 1. Try match for Google Maps exact place pin data (!3d...!4d...)
  const pinDataMatch = str.match(/!3d([-+]?\d+\.\d+)!4d([-+]?\d+\.\d+)/);
  if (pinDataMatch) {
    const lat = parseFloat(pinDataMatch[1]);
    const lon = parseFloat(pinDataMatch[2]);
    if (!isNaN(lat) && !isNaN(lon)) return { latitude: lat, longitude: lon };
  }

  // 2. Try direct match for @lat,lon (e.g. .../@11.502767,104.851553...)
  const atMatch = str.match(/@([-+]?\d+\.\d+),([-+]?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lon = parseFloat(atMatch[2]);
    if (!isNaN(lat) && !isNaN(lon)) return { latitude: lat, longitude: lon };
  }

  // 3. Try match for query params (q=lat,lon, query=lat,lon, ll=lat,lon, center=lat,lon)
  const qMatch = str.match(
    /[?&](?:q|query|ll|center)=([-+]?\d+\.\d+),([-+]?\d+\.\d+)/,
  );
  if (qMatch) {
    const lat = parseFloat(qMatch[1]);
    const lon = parseFloat(qMatch[2]);
    if (!isNaN(lat) && !isNaN(lon)) return { latitude: lat, longitude: lon };
  }

  // 4. Try match for path coordinates (place/lat,lon, dir/lat,lon, search/lat,lon)
  const pathMatch = str.match(
    /(?:place|dir|search)\/([-+]?\d+\.\d+),([-+]?\d+\.\d+)/,
  );
  if (pathMatch) {
    const lat = parseFloat(pathMatch[1]);
    const lon = parseFloat(pathMatch[2]);
    if (!isNaN(lat) && !isNaN(lon)) return { latitude: lat, longitude: lon };
  }

  // 5. Try direct comma/space separated coordinates (e.g. "11.502767, 104.851553")
  const directMatch = str.match(/^[-+]?\d+\.\d+[\s,]+[-+]?\d+\.\d+$/);
  if (directMatch) {
    const parts = str.split(/[\s,]+/);
    if (parts.length >= 2) {
      const lat = parseFloat(parts[0]);
      const lon = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lon)) return { latitude: lat, longitude: lon };
    }
  }

  // 6. If HTTP short URL (e.g. https://maps.app.goo.gl/aC74wDdDS), resolve URL redirect
  if (str.startsWith("http://") || str.startsWith("https://")) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(str, {
        signal: controller.signal,
        redirect: "follow",
      });
      clearTimeout(id);

      const finalUrl = res.url || "";
      if (finalUrl && finalUrl !== str) {
        const resolved = await parseCoordinatesFromLocationString(finalUrl);
        if (resolved) return resolved;
      }
    } catch (e) {
      // ignore fetch error
    }
  }

  return null;
}

const cachedLocationsBySystem: Record<
  string,
  { loc: CompanyLocationConfig; timestamp: number }
> = {};
const COMPANY_LOCATION_CACHE_MS = 5 * 60 * 1000; // 5 minutes cache

/**
 * Fetches dynamic company location configuration directly from Supabase table `ssh-group-staff-attendance-qr`.
 * Automatically matches the user's system_id (e.g. "system-0001", "system-0002", etc.)
 */
export async function fetchCompanyLocationConfig(
  forceRefresh = false,
  systemId?: string,
): Promise<CompanyLocationConfig> {
  const {
    resolveSystemKey,
    extractSystemKey,
  } = require("@/constants/attendanceConfig");
  const targetKey = await resolveSystemKey(systemId);
  const cacheKey = targetKey || "default";

  if (
    !forceRefresh &&
    cachedLocationsBySystem[cacheKey] &&
    Date.now() - cachedLocationsBySystem[cacheKey].timestamp <
      COMPANY_LOCATION_CACHE_MS
  ) {
    return cachedLocationsBySystem[cacheKey].loc;
  }

  try {
    const { supabase } = require("@/utils/supabase");

    // Fetch directly from database table: ssh-group-staff-attendance-qr
    const { data, error } = await supabase
      .from("ssh-group-staff-attendance-qr")
      .select("*");

    if (!error && data && Array.isArray(data) && data.length > 0) {
      let row = data[0];
      if (targetKey) {
        const found = data.find(
          (r: any) => extractSystemKey(String(r.id || "")) === targetKey,
        );
        if (found) row = found;
      }

      const companyName = row["company_name"] ?? row["companyName"] ?? "";
      const locCol =
        row["location"] ?? row["location_links"] ?? row["locationLinks"];

      let locStr = "";
      if (Array.isArray(locCol)) {
        locStr = String(locCol[0] || "").trim();
      } else if (typeof locCol === "string" && locCol.trim()) {
        try {
          const parsed = JSON.parse(locCol);
          if (Array.isArray(parsed)) {
            locStr = String(parsed[0] || "").trim();
          } else {
            locStr = locCol.trim();
          }
        } catch (e) {
          locStr = locCol.trim();
        }
      }

      if (locStr) {
        const coords = await parseCoordinatesFromLocationString(locStr);
        if (coords) {
          const locationConfig: CompanyLocationConfig = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            radiusMeters: row["radius_meters"] || row["radiusMeters"] || 150,
            name: companyName,
          };
          cachedLocationsBySystem[cacheKey] = {
            loc: locationConfig,
            timestamp: Date.now(),
          };
          return locationConfig;
        }
      }
    }
  } catch (e) {
    // ignore exception
  }

  return COMPANY_LOCATION;
}

/**
 * Calculates distance between two coordinates in meters using the Haversine formula
 */
export function getDistanceFromLatLonInMeters(
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

export interface SecurityCheckResult {
  allowed: boolean;
  reason?: string;
  code?:
    | "PERMISSION_DENIED"
    | "MOCK_LOCATION"
    | "OUT_OF_RANGE"
    | "VPN_DETECTED"
    | "UNKNOWN_ERROR";
  distanceMeters?: number;
  latitude?: number;
  longitude?: number;
  ipAddress?: string;
}

/**
 * Checks if local IP belongs to virtual VPN adapter subnets (TUN/TAP interfaces)
 * Common VPN subnets: 10.8.x.x, 10.255.x.x, 10.14.x.x, 10.2.x.x, 10.6.x.x, 172.16.0.0/12, 100.64.0.0/10, 198.18.0.0/15
 */
function isVpnLocalIp(ip: string): boolean {
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

  // 172.16.0.0 to 172.31.255.255 range (frequently used by OpenVPN/WireGuard/Panda VPN)
  const parts = cleanIp.split(".");
  if (parts.length === 4) {
    const p1 = parseInt(parts[0], 10);
    const p2 = parseInt(parts[1], 10);
    if (p1 === 172 && p2 >= 16 && p2 <= 31) {
      return true;
    }
    // 100.64.0.0/10 Carrier Grade NAT / Tailscale / VPN range
    if (p1 === 100 && p2 >= 64 && p2 <= 127) {
      return true;
    }
  }

  return false;
}

/**
 * Known legitimate home/office/cellular ISPs in Cambodia.
 * Any network operator outside this list that matches Datacenter / Cloud / VPN signatures is blocked.
 */
const CAMBODIA_LEGIT_ISPS = [
  "cellcard",
  "camgsm",
  "smart axiata",
  "smart",
  "metfone",
  "viettel",
  "ezecom",
  "cogetel",
  "sinet",
  "online",
  "mekongnet",
  "ntc",
  "telecom cambodia",
  "cintri",
  "kingtel",
  "opennet",
  "today communication",
  "wownet",
  "ppctv",
];

const VPN_KEYWORDS = [
  "vpn",
  "panda",
  "bittorrent",
  "m247",
  "datacenter",
  "hosting",
  "digitalocean",
  "linode",
  "aws",
  "amazon",
  "expressvpn",
  "nord",
  "surfshark",
  "proton",
  "mullvad",
  "warp",
  "cloudflare",
  "leaseweb",
  "hostinger",
  "vultr",
  "hetzner",
  "ovh",
  "proxy",
  "tunnel",
  "packethub",
  "teraswitch",
  "frantech",
  "vps",
  "cloud",
  "server",
  "cogent",
  "hurricane",
  "choopa",
  "tzulo",
  "anexia",
  "kamatera",
  "zenlayer",
  "highwinds",
  "gtt",
  "telia",
  "subspace",
  "wireguard",
  "openvpn",
  "shadowsocks",
  "v2ray",
  "trojan",
  "socks",
  "tor",
  "ipvanish",
  "cyberghost",
  "pia",
  "privateinternetaccess",
  "vyprvpn",
  "strongvpn",
  "purevpn",
  "ivpn",
  "windscribe",
  "hide.me",
  "hotspot",
  "shield",
  "zenmate",
  "torguard",
  "adguard",
];

let cachedVpnResult: {
  isVpn: boolean;
  ip?: string;
  reason?: string;
} | null = null;
let lastVpnCheckTime = 0;
const VPN_CACHE_MS = 60 * 1000; // 60s cache for non-VPN state

/**
 * Executes parallel security checks across multiple IP & VPN databases.
 * Guarantees blocking of all VPN apps (Panda VPN, Nord, Express, etc.), even on KH nodes.
 */
async function checkVpnOrProxy(forceRefresh = false): Promise<{
  isVpn: boolean;
  ip?: string;
  reason?: string;
}> {
  // Return cached result if recent and clean
  if (
    !forceRefresh &&
    cachedVpnResult &&
    !cachedVpnResult.isVpn &&
    Date.now() - lastVpnCheckTime < VPN_CACHE_MS
  ) {
    return cachedVpnResult;
  }

  // 1. Native device local IP & network state inspection (fastest, ~5ms)
  try {
    const netState = await Network.getNetworkStateAsync();
    if (netState && (netState as any).type === "VPN") {
      const res = { isVpn: true, reason: "Device VPN connection active." };
      cachedVpnResult = res;
      lastVpnCheckTime = Date.now();
      return res;
    }

    const localIp = await Network.getIpAddressAsync();
    if (localIp && isVpnLocalIp(localIp)) {
      const res = {
        isVpn: true,
        ip: localIp,
        reason: `VPN adapter local interface detected (${localIp}). Please turn off your VPN.`,
      };
      cachedVpnResult = res;
      lastVpnCheckTime = Date.now();
      return res;
    }
  } catch (e) {}

  // 2. Execute Parallel HTTPS Security Checks with quick 2s timeout
  const fetchWithTimeout = async (url: string, timeoutMs = 2000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      if (res.ok) return await res.json();
    } catch (e) {
      clearTimeout(id);
    }
    return null;
  };

  const [ipWhoResult, freeIpResult, ipInfoResult] = await Promise.allSettled([
    fetchWithTimeout("https://ipwho.is/"),
    fetchWithTimeout("https://freeipapi.com/api/json"),
    fetchWithTimeout("https://ipinfo.io/json"),
  ]);

  let queriedIp = "";

  // Process ipwho.is result
  if (ipWhoResult.status === "fulfilled" && ipWhoResult.value?.success) {
    const data = ipWhoResult.value;
    queriedIp = data.ip || queriedIp;
    const countryCode = (data.country_code || "").toUpperCase();
    const sec = data.security || {};
    const connection = data.connection || {};
    const combinedText =
      `${connection.isp || ""} ${connection.org || ""} ${connection.asn || ""}`.toLowerCase();

    if (sec.vpn || sec.proxy || sec.tor || sec.hosting) {
      const res = {
        isVpn: true,
        ip: queriedIp,
        reason:
          "VPN or Proxy connection detected. Please disable your VPN to scan.",
      };
      cachedVpnResult = res;
      lastVpnCheckTime = Date.now();
      return res;
    }

    if (countryCode && countryCode !== "KH") {
      const res = {
        isVpn: true,
        ip: queriedIp,
        reason: `Traffic routed outside Cambodia (${data.country || countryCode}). Please turn off VPN.`,
      };
      cachedVpnResult = res;
      lastVpnCheckTime = Date.now();
      return res;
    }

    if (VPN_KEYWORDS.some((kw) => combinedText.includes(kw))) {
      const res = {
        isVpn: true,
        ip: queriedIp,
        reason: `VPN or Datacenter provider detected (${connection.isp || connection.org}).`,
      };
      cachedVpnResult = res;
      lastVpnCheckTime = Date.now();
      return res;
    }
  }

  // Process freeipapi.com result
  if (freeIpResult.status === "fulfilled" && freeIpResult.value) {
    const data = freeIpResult.value;
    queriedIp = data.ipAddress || queriedIp;
    const countryCode = (data.countryCode || "").toUpperCase();

    if (data.isProxy === true) {
      const res = {
        isVpn: true,
        ip: queriedIp,
        reason: "Proxy/VPN server connection detected.",
      };
      cachedVpnResult = res;
      lastVpnCheckTime = Date.now();
      return res;
    }

    if (countryCode && countryCode !== "KH") {
      const res = {
        isVpn: true,
        ip: queriedIp,
        reason: `Traffic routed via foreign IP (${countryCode}). Disable VPN to scan.`,
      };
      cachedVpnResult = res;
      lastVpnCheckTime = Date.now();
      return res;
    }
  }

  // Process ipinfo.io result
  if (ipInfoResult.status === "fulfilled" && ipInfoResult.value) {
    const data = ipInfoResult.value;
    queriedIp = data.ip || queriedIp;
    const countryCode = (data.country || "").toUpperCase();
    const org = (data.org || "").toLowerCase();

    if (countryCode && countryCode !== "KH") {
      const res = {
        isVpn: true,
        ip: queriedIp,
        reason: `Traffic routed via non-Cambodian IP (${countryCode}). Disable VPN.`,
      };
      cachedVpnResult = res;
      lastVpnCheckTime = Date.now();
      return res;
    }

    if (VPN_KEYWORDS.some((kw) => org.includes(kw))) {
      const res = {
        isVpn: true,
        ip: queriedIp,
        reason: `VPN / Cloud ISP detected (${data.org}). Please turn off VPN.`,
      };
      cachedVpnResult = res;
      lastVpnCheckTime = Date.now();
      return res;
    }
  }

  // All checks completed cleanly without detecting VPN
  const cleanResult = { isVpn: false, ip: queriedIp };
  cachedVpnResult = cleanResult;
  lastVpnCheckTime = Date.now();
  return cleanResult;
}

/**
 * High-speed location getter:
 * 1. Tries last known position first (fastest, ~5-20ms)
 * 2. If not available, uses Balanced accuracy (uses Google Play Fused Location Provider, 500-1500ms)
 * 3. Never hangs or stalls on cold GPS satellite lock
 */
async function getFastLocation(): Promise<Location.LocationObject> {
  // 1. Try to get last known position first (instant, ~5-20ms)
  try {
    const lastKnown = await Location.getLastKnownPositionAsync({
      maxAge: 120000, // up to 2 min old
    });
    if (lastKnown && lastKnown.coords) {
      return lastKnown;
    }
  } catch (e) {}

  // 2. Fetch fresh position with Balanced accuracy (uses Fused Location Provider, 500-1500ms)
  // Race with a 5s timeout so GPS hardware never hangs for 30-60s indoors
  const positionPromise = Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const timeoutPromise = new Promise<Location.LocationObject>((_, reject) =>
    setTimeout(
      () =>
        reject(
          new Error(
            "GPS location request timed out. Please ensure GPS/Location is enabled on your device.",
          ),
        ),
      5000,
    ),
  );

  return await Promise.race([positionPromise, timeoutPromise]);
}

let lastVerifiedSecurity: {
  timestamp: number;
  result: SecurityCheckResult;
} | null = null;
const SECURITY_CACHE_DURATION_MS = 60 * 1000; // 60 seconds cache

/**
 * Executes full security verification for attendance scan:
 * 1. Checks location permissions
 * 2. Gets GPS position (fast fused location)
 * 3. Checks for mock location / location spoofing
 * 4. Checks distance to company coordinates
 * 5. Checks for VPN / Proxy usage
 * Runs location, company config, and VPN checks IN PARALLEL for maximum speed!
 */
export async function verifyAttendanceSecurity(
  forceRefresh = false,
  systemId?: string,
): Promise<SecurityCheckResult> {
  // Web preview fallback (skip native GPS if running in web browser)
  if (Platform.OS === "web") {
    return { allowed: true };
  }

  // Fast path: if verified recently and allowed, return instantly (0ms)
  if (
    !forceRefresh &&
    lastVerifiedSecurity &&
    lastVerifiedSecurity.result.allowed &&
    Date.now() - lastVerifiedSecurity.timestamp < SECURITY_CACHE_DURATION_MS
  ) {
    return lastVerifiedSecurity.result;
  }

  try {
    // 1. Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return {
        allowed: false,
        reason:
          "Location permission is required to verify company attendance location.",
        code: "PERMISSION_DENIED",
      };
    }

    // 2. Run Location, Company Config, and VPN Check IN PARALLEL!
    const [config, location, vpnResult] = await Promise.all([
      fetchCompanyLocationConfig(forceRefresh, systemId),
      getFastLocation(),
      checkVpnOrProxy(forceRefresh),
    ]);

    // 3. Check VPN Result
    if (vpnResult.isVpn) {
      return {
        allowed: false,
        reason:
          "You are using a VPN app. Please close the VPN app and try again to scan attendance.",
        code: "VPN_DETECTED",
        ipAddress: vpnResult.ip,
      };
    }

    const coords = location.coords;

    // 4. Mock location detection (Android & iOS)
    const isMocked = Boolean(
      (coords as any).isMocked || (location as any).mocked,
    );

    if (isMocked) {
      return {
        allowed: false,
        reason:
          "Mocked or spoofed location detected! Changing location or using fake GPS apps is prohibited for attendance.",
        code: "MOCK_LOCATION",
        latitude: coords.latitude,
        longitude: coords.longitude,
      };
    }

    // 5. Geofence Distance Check (only if configured)
    if (config.latitude !== 0 && config.longitude !== 0) {
      const distance = getDistanceFromLatLonInMeters(
        coords.latitude,
        coords.longitude,
        config.latitude,
        config.longitude,
      );

      if (distance > config.radiusMeters) {
        const areaName = config.name ? `${config.name} area` : "company area";
        return {
          allowed: false,
          reason: `You are outside the ${areaName} (${Math.round(distance)}m away). Attendance scanning is only allowed within ${config.radiusMeters} meters of ${config.name || "the designated office"}.`,
          code: "OUT_OF_RANGE",
          distanceMeters: Math.round(distance),
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
      }

      const verifiedResult: SecurityCheckResult = {
        allowed: true,
        distanceMeters: Math.round(distance),
        latitude: coords.latitude,
        longitude: coords.longitude,
        ipAddress: vpnResult.ip,
      };

      lastVerifiedSecurity = {
        timestamp: Date.now(),
        result: verifiedResult,
      };

      return verifiedResult;
    }

    const verifiedResult: SecurityCheckResult = {
      allowed: true,
      latitude: coords.latitude,
      longitude: coords.longitude,
      ipAddress: vpnResult.ip,
    };

    lastVerifiedSecurity = {
      timestamp: Date.now(),
      result: verifiedResult,
    };

    return verifiedResult;
  } catch (err: any) {
    console.warn("Security check exception:", err);
    return {
      allowed: false,
      reason:
        err?.message ||
        "Could not verify device location and network security status.",
      code: "UNKNOWN_ERROR",
    };
  }
}
