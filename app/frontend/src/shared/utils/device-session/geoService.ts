import * as Location from "expo-location";
import { Platform } from "react-native";
import type { GeoLocationInfo } from "./types";

const DEFAULT_GEO: GeoLocationInfo = {
  ip: "124.248.173.5",
  location: "Phnom Penh, Cambodia",
};

let cachedGeo: GeoLocationInfo | null = null;

/**
 * Reverse geocodes GPS coordinates into a full Cambodia / Global address:
 * e.g. "St. 271, Sangkat Boeng Tumpun, Khan Mean Chey, Phnom Penh, Cambodia"
 */
async function reverseGeocodeCoords(lat: number, lon: number): Promise<string> {
  // 1. Query OpenStreetMap Nominatim for detailed Sangkat / Khan / Road hierarchy
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=en,km`,
      {
        headers: { "User-Agent": "SSHGroupStaffApp/1.0" },
        signal: controller.signal,
      },
    );
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      const a = data.address;
      if (a) {
        const parts: string[] = [];

        // 1. Road / Street / Place
        const road = a.road || a.pedestrian || a.street || "";
        if (road) parts.push(road);

        // 2. Village (Phum)
        const village = a.hamlet || "";
        if (village && !parts.includes(village)) parts.push(village);

        // 3. Sangkat / Commune
        const sangkat =
          a.village || a.suburb || a.neighbourhood || a.quarter || "";
        if (sangkat && !parts.includes(sangkat)) parts.push(sangkat);

        // 4. Khan / District
        const khan = a.town || a.city_district || a.district || a.county || "";
        if (khan && !parts.includes(khan)) parts.push(khan);

        // 5. City / Province (Phnom Penh, Siem Reap, etc.)
        const city = a.city || a.state || "";
        if (city && !parts.includes(city)) parts.push(city);

        // 6. Country
        const country = a.country || "Cambodia";
        if (!parts.includes(country)) parts.push(country);

        if (parts.length >= 2) {
          return parts.join(", ");
        }
      }
    }
  } catch {}

  // 2. Fallback to Expo Location Native Geocoder (Google/Apple/HMS)
  try {
    const addresses = await Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: lon,
    });
    if (addresses && addresses.length > 0) {
      const item = addresses[0];
      const parts: string[] = [];

      const street = [item.name, item.streetNumber, item.street]
        .filter(Boolean)
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .join(" ");
      if (street) parts.push(street);

      if (item.subregion && !parts.includes(item.subregion)) {
        parts.push(item.subregion);
      }
      if (item.district && !parts.includes(item.district)) {
        parts.push(item.district);
      }
      if (item.city && !parts.includes(item.city)) {
        parts.push(item.city);
      } else if (item.region && !parts.includes(item.region)) {
        parts.push(item.region);
      }
      if (item.country && !parts.includes(item.country)) {
        parts.push(item.country);
      } else {
        parts.push("Cambodia");
      }

      if (parts.length >= 2) {
        return parts.join(", ");
      }
    }
  } catch {}

  return "";
}

/**
 * Resolves public IP and full street-level location:
 * - Public IP via fast IP lookup
 * - Full detailed address (Street, Village, Sangkat, Khan, Province, Country) via GPS & Reverse Geocoding
 */
export async function fetchGeoLocation(): Promise<GeoLocationInfo> {
  if (cachedGeo && cachedGeo.location !== DEFAULT_GEO.location) {
    return cachedGeo;
  }

  // 1. Resolve Public IP address
  let publicIp = "124.248.173.5";
  let fallbackLocation = "Phnom Penh, Cambodia";

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch("https://ipwho.is/", { signal: controller.signal });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false && data.ip) {
        publicIp = data.ip;
        const city = data.city || "";
        const country = data.country || "";
        if (city && country) {
          fallbackLocation = `${city}, ${country}`;
        }
      }
    }
  } catch {
    try {
      const controller2 = new AbortController();
      const timer2 = setTimeout(() => controller2.abort(), 1500);
      const res2 = await fetch("https://api.ipify.org?format=json", {
        signal: controller2.signal,
      });
      clearTimeout(timer2);
      if (res2.ok) {
        const d2 = await res2.json();
        if (d2 && d2.ip) publicIp = d2.ip;
      }
    } catch {}
  }

  // 2. Resolve Full GPS Street-Level Location
  let fullLocation = "";
  try {
    if (Platform.OS !== "web") {
      let { status } = await Location.getForegroundPermissionsAsync().catch(
        () => ({ status: "undetermined" as any }),
      );

      if (status !== "granted") {
        const req = await Location.requestForegroundPermissionsAsync().catch(
          () => ({ status: "denied" as any }),
        );
        status = req.status;
      }

      if (status === "granted") {
        // Fast: Use Last Known Position if recent (0ms)
        let pos = await Location.getLastKnownPositionAsync().catch(() => null);

        // If no last known or older than 10 mins, get current position with timeout
        if (!pos || Date.now() - pos.timestamp > 10 * 60 * 1000) {
          pos = await Promise.race([
            Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            }),
            new Promise<null>((resolve) =>
              setTimeout(() => resolve(null), 2500),
            ),
          ]);
        }

        if (pos?.coords) {
          fullLocation = await reverseGeocodeCoords(
            pos.coords.latitude,
            pos.coords.longitude,
          );
        }
      }
    }
  } catch (err) {
    console.warn("[GeoService] GPS location error:", err);
  }

  const finalLocation = fullLocation || fallbackLocation;
  cachedGeo = { ip: publicIp, location: finalLocation };
  return cachedGeo;
}
