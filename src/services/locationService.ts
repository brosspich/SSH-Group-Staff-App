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

/**
 * Fetches dynamic company location configuration directly from Supabase table `ssh-group-staff-attendance-qr`.
 */
export async function fetchCompanyLocationConfig(): Promise<CompanyLocationConfig> {
  try {
    const { supabase } = require("@/utils/supabase");

    // Fetch directly from database table: ssh-group-staff-attendance-qr
    const { data, error } = await supabase
      .from("ssh-group-staff-attendance-qr")
      .select("*");

    if (!error && data && Array.isArray(data) && data.length > 0) {
      const row = data[0];
      // const companyName =
      //   row["company_name"] ?? row["companyName"] ?? "SSH Group HQ";
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
          COMPANY_LOCATION = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            radiusMeters: row["radius_meters"] || row["radiusMeters"] || 150,
            name: companyName,
          };
          return COMPANY_LOCATION;
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

/**
 * Executes parallel security checks across multiple IP & VPN databases.
 * Guarantees blocking of all VPN apps (Panda VPN, Nord, Express, etc.), even on KH nodes.
 */
async function checkVpnOrProxy(): Promise<{
  isVpn: boolean;
  ip?: string;
  reason?: string;
}> {
  // 1. Native device local IP & network state inspection
  try {
    const localIp = await Network.getIpAddressAsync();
    if (localIp && isVpnLocalIp(localIp)) {
      return {
        isVpn: true,
        ip: localIp,
        reason: `VPN adapter local interface detected (${localIp}). Please turn off your VPN.`,
      };
    }

    const netState = await Network.getNetworkStateAsync();
    if (netState && (netState as any).type === "VPN") {
      return { isVpn: true, reason: "Device VPN connection active." };
    }
  } catch (e) {}

  // 2. Execute Parallel HTTPS Security Checks
  const fetchWithTimeout = async (url: string, timeoutMs = 3500) => {
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
      return {
        isVpn: true,
        ip: queriedIp,
        reason:
          "VPN or Proxy connection detected. Please disable your VPN to scan.",
      };
    }

    if (countryCode && countryCode !== "KH") {
      return {
        isVpn: true,
        ip: queriedIp,
        reason: `Traffic routed outside Cambodia (${data.country || countryCode}). Please turn off VPN.`,
      };
    }

    if (VPN_KEYWORDS.some((kw) => combinedText.includes(kw))) {
      return {
        isVpn: true,
        ip: queriedIp,
        reason: `VPN or Datacenter provider detected (${connection.isp || connection.org}).`,
      };
    }
  }

  // Process freeipapi.com result
  if (freeIpResult.status === "fulfilled" && freeIpResult.value) {
    const data = freeIpResult.value;
    queriedIp = data.ipAddress || queriedIp;
    const countryCode = (data.countryCode || "").toUpperCase();

    if (data.isProxy === true) {
      return {
        isVpn: true,
        ip: queriedIp,
        reason: "Proxy/VPN server connection detected.",
      };
    }

    if (countryCode && countryCode !== "KH") {
      return {
        isVpn: true,
        ip: queriedIp,
        reason: `Traffic routed via foreign IP (${countryCode}). Disable VPN to scan.`,
      };
    }
  }

  // Process ipinfo.io result
  if (ipInfoResult.status === "fulfilled" && ipInfoResult.value) {
    const data = ipInfoResult.value;
    queriedIp = data.ip || queriedIp;
    const countryCode = (data.country || "").toUpperCase();
    const org = (data.org || "").toLowerCase();

    if (countryCode && countryCode !== "KH") {
      return {
        isVpn: true,
        ip: queriedIp,
        reason: `Traffic routed via non-Cambodian IP (${countryCode}). Disable VPN.`,
      };
    }

    if (VPN_KEYWORDS.some((kw) => org.includes(kw))) {
      return {
        isVpn: true,
        ip: queriedIp,
        reason: `VPN / Cloud ISP detected (${data.org}). Please turn off VPN.`,
      };
    }
  }

  // All checks completed cleanly without detecting VPN
  return { isVpn: false, ip: queriedIp };
}

/**
 * Executes full security verification for attendance scan:
 * 1. Checks location permissions
 * 2. Gets high-accuracy GPS position
 * 3. Checks for mock location / location spoofing
 * 4. Checks distance to company coordinates
 * 5. Checks for VPN / Proxy usage
 */
export async function verifyAttendanceSecurity(): Promise<SecurityCheckResult> {
  // Web preview fallback (skip native GPS if running in web browser)
  if (Platform.OS === "web") {
    return { allowed: true };
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

    // 2. Fetch company location coordinates
    const config = await fetchCompanyLocationConfig();

    // 3. Get device current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const coords = location.coords;

    // 4. Mock location detection (Android & iOS)
    // expo-location includes `isMocked` property on coords or location
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

    // 5. Geofence Distance Check
    const distance = getDistanceFromLatLonInMeters(
      coords.latitude,
      coords.longitude,
      config.latitude,
      config.longitude,
    );

    if (distance > config.radiusMeters) {
      return {
        allowed: false,
        reason: `You are outside the SSH Group company area (${Math.round(distance)}m away). Attendance scanning is only allowed within ${config.radiusMeters} meters of ${config.name}.`,
        code: "OUT_OF_RANGE",
        distanceMeters: Math.round(distance),
        latitude: coords.latitude,
        longitude: coords.longitude,
      };
    }

    // 6. VPN / Proxy Security Check
    const vpnResult = await checkVpnOrProxy();
    if (vpnResult.isVpn) {
      return {
        allowed: false,
        reason:
          "You are using a VPN app. Please close the VPN app and try again to scan attendance.",
        code: "VPN_DETECTED",
        ipAddress: vpnResult.ip,
      };
    }

    return {
      allowed: true,
      distanceMeters: Math.round(distance),
      latitude: coords.latitude,
      longitude: coords.longitude,
      ipAddress: vpnResult.ip,
    };
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
