import { apiClient } from "@/shared/services/api";
import * as Location from "expo-location";
import * as Network from "expo-network";
import { Platform } from "react-native";

export type SecurityErrorCode =
  | "PERMISSION_DENIED"
  | "MOCK_LOCATION"
  | "OUT_OF_RANGE"
  | "VPN_DETECTED"
  | "INVALID_QR"
  | "USER_NOT_FOUND"
  | "COMPANY_NOT_FOUND"
  | "UNKNOWN_ERROR";

export interface SecurityCheckResult {
  allowed: boolean;
  code?: SecurityErrorCode;
  reason?: string;
  distanceMeters?: number;
  allowedRadiusMeters?: number;
  companyName?: string;
  latitude?: number;
  longitude?: number;
  ipAddress?: string;
}

// 60-second in-memory cache to prevent redundant sensor reads & network requests
let lastSecurityResult: {
  timestamp: number;
  systemId?: string;
  result: SecurityCheckResult;
} | null = null;
const SECURITY_CACHE_TTL_MS = 60 * 1000;

// High-speed in-memory GPS cache (3 minutes) for instant scan verification
let cachedDeviceGps: {
  position: Location.LocationObject;
  timestamp: number;
} | null = null;
const GPS_CACHE_TTL_MS = 3 * 60 * 1000;

// Active in-flight GPS query to prevent redundant parallel hardware access
let inFlightGpsPromise: Promise<Location.LocationObject> | null = null;

// Local IP cache (5 minutes)
let cachedLocalIp: string | undefined = undefined;
let cachedIpTimestamp = 0;

/**
 * Returns currently cached GPS position if fresh, avoiding sensor query latency (0ms).
 */
export function getCachedGpsPosition(): Location.LocationObject | null {
  if (
    cachedDeviceGps &&
    Date.now() - cachedDeviceGps.timestamp < GPS_CACHE_TTL_MS
  ) {
    return cachedDeviceGps.position;
  }
  return null;
}

/**
 * Fast cached Local IP helper (0ms on repeated calls)
 */
export async function getCachedLocalIp(): Promise<string | undefined> {
  if (cachedLocalIp && Date.now() - cachedIpTimestamp < 5 * 60 * 1000) {
    return cachedLocalIp;
  }
  const ip = await Network.getIpAddressAsync().catch(() => undefined);
  if (ip) {
    cachedLocalIp = ip;
    cachedIpTimestamp = Date.now();
  }
  return ip;
}

/**
 * Reads device GPS position with multi-tier fast caching & timeout protection.
 * Tier 1: In-memory cache (< 3 mins) -> 0ms
 * Tier 2: In-flight deduplication -> shares same sensor query
 * Tier 3: OS Last-known GPS fix (< 5 mins, accuracy < 150m) -> 0ms
 * Tier 4: Fresh satellite lock with 1500ms timeout & instant fallback to last known
 */
export async function getDeviceGpsPosition(): Promise<Location.LocationObject> {
  // 1. Fast in-memory cache hit (0ms)
  const memoryCached = getCachedGpsPosition();
  if (memoryCached) {
    return memoryCached;
  }

  // 2. Reuse already running in-flight query
  if (inFlightGpsPromise) {
    return inFlightGpsPromise;
  }

  inFlightGpsPromise = (async () => {
    try {
      // 3. Query OS last known location (instantaneous on Android/iOS, 0ms)
      const lastKnown = await Location.getLastKnownPositionAsync().catch(
        () => null,
      );
      if (
        lastKnown &&
        Date.now() - lastKnown.timestamp < 5 * 60 * 1000 &&
        lastKnown.coords.accuracy !== null &&
        lastKnown.coords.accuracy < 150
      ) {
        cachedDeviceGps = {
          position: lastKnown,
          timestamp: Date.now(),
        };
        return lastKnown;
      }

      // 4. Fallback to active GPS lock with 1500ms timeout and graceful fallback
      const positionPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const timeoutPromise = new Promise<Location.LocationObject>(
        (resolve, reject) =>
          setTimeout(async () => {
            if (lastKnown) {
              resolve(lastKnown);
            } else {
              const fallback = await Location.getLastKnownPositionAsync().catch(
                () => null,
              );
              if (fallback) {
                resolve(fallback);
              } else {
                reject(
                  new Error(
                    "GPS location request timed out. Please ensure GPS/Location is enabled on your device.",
                  ),
                );
              }
            }
          }, 1500),
      );

      const pos = await Promise.race([positionPromise, timeoutPromise]);
      if (pos) {
        cachedDeviceGps = {
          position: pos,
          timestamp: Date.now(),
        };
      }
      return pos;
    } finally {
      inFlightGpsPromise = null;
    }
  })();

  return inFlightGpsPromise;
}

/**
 * Pre-warms device GPS in background (e.g. on HomeScreen mount or camera open)
 * so attendance scans can resolve coordinates in 0ms without delaying the camera.
 */
export async function prewarmDeviceGps(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      await getDeviceGpsPosition();
    }
  } catch {}
}

/**
 * Thin-Client Attendance Security Verification (Frontend 30% / Backend 70%)
 *
 * Responsibilities:
 * - Frontend: Query native device sensors (GPS coordinates, mock flag, local IP)
 * - Backend: Executes all business logic, geofencing distance calculations (A vs B), and security decisions.
 */
export async function verifyAttendanceSecurity(
  forceRefresh = false,
  systemId?: string,
): Promise<SecurityCheckResult> {
  // Web preview fallback (skip native GPS if running in web browser)
  if (Platform.OS === "web") {
    return { allowed: true };
  }

  // Fast cache hit (0ms)
  if (
    !forceRefresh &&
    lastSecurityResult &&
    lastSecurityResult.systemId === systemId &&
    lastSecurityResult.result.allowed &&
    Date.now() - lastSecurityResult.timestamp < SECURITY_CACHE_TTL_MS
  ) {
    return lastSecurityResult.result;
  }

  try {
    // 1. Request native location permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return {
        allowed: false,
        code: "PERMISSION_DENIED",
        reason:
          "Location permission is required to verify company attendance location.",
      };
    }

    // 2. Read native sensors in parallel (GPS & Network IP)
    const [position, localIp] = await Promise.all([
      getDeviceGpsPosition(),
      Network.getIpAddressAsync().catch(() => undefined),
    ]);

    const coords = position.coords;
    const isMocked = Boolean(
      (coords as any).isMocked || (position as any).mocked,
    );

    // 3. Delegate ALL business logic, geofence distance calculation, and condition checks to Backend (70%)
    const verifiedResult = await apiClient.post<SecurityCheckResult>(
      "/attendance-security/verify",
      {
        systemId,
        latitude: coords.latitude,
        longitude: coords.longitude,
        isMocked,
        ipAddress: localIp,
      },
    );

    if (verifiedResult.allowed) {
      lastSecurityResult = {
        timestamp: Date.now(),
        systemId,
        result: verifiedResult,
      };
    }

    return verifiedResult;
  } catch (err: any) {
    console.warn("Security check network/sensor exception:", err);
    return {
      allowed: false,
      code: "UNKNOWN_ERROR",
      reason:
        err?.message ||
        "Could not verify device location and network security status with backend.",
    };
  }
}

export interface ProcessScanResult {
  allowed: boolean;
  code?: SecurityErrorCode;
  reason?: string;
  record?: {
    id: string;
    staff_id: string;
    system_id?: string;
    name: string;
    date: string;
    time: string;
    type: "time-in" | "time-out" | "time-other";
    timestamp: string;
    qr_data: string;
    remark?: string;
    image?: string;
  };
  distanceMeters?: number;
}

/**
 * Executes Attendance Scan Verification (Frontend 30% Sensors/UI -> Backend 70% Conditions/Validation).
 * By default previewOnly = true, so DB insert and Telegram alert occur ONLY when user taps Submit!
 */
export async function scanAttendanceWithSecurity(payload: {
  userId: string;
  systemId?: string;
  qrData: string;
  previewOnly?: boolean;
}): Promise<ProcessScanResult> {
  try {
    let coords = { latitude: 0, longitude: 0 };
    let isMocked = false;
    let localIp: string | undefined;

    if (Platform.OS !== "web") {
      // Fast path: use memory cached GPS fix (0ms)
      const cached = getCachedGpsPosition();
      if (cached) {
        coords = cached.coords;
        isMocked = Boolean(
          (cached.coords as any).isMocked || (cached as any).mocked,
        );
        localIp = await getCachedLocalIp();
      } else {
        const { status } =
          await Location.requestForegroundPermissionsAsync().catch(() => ({
            status: "denied",
          }));
        if (status === "granted") {
          const [pos, ip] = await Promise.all([
            getDeviceGpsPosition().catch(() => null),
            getCachedLocalIp(),
          ]);
          if (pos) {
            coords = pos.coords;
            isMocked = Boolean(
              (pos.coords as any).isMocked || (pos as any).mocked,
            );
          }
          localIp = ip;
        }
      }
    }

    // Call Backend 70%: Validates conditions (Geofence, QR validity, Time window).
    // previewOnly: true ensures NO DB insert and NO Telegram message until user taps Submit!
    const result = await apiClient.post<ProcessScanResult>(
      "/attendance-security/scan",
      {
        userId: payload.userId,
        systemId: payload.systemId,
        qrData: payload.qrData,
        latitude: coords.latitude || undefined,
        longitude: coords.longitude || undefined,
        isMocked,
        ipAddress: localIp,
        previewOnly: payload.previewOnly ?? true,
      },
    );

    return result;
  } catch (err: any) {
    return {
      allowed: false,
      code: "UNKNOWN_ERROR",
      reason: err?.message || "Failed to process attendance scan with server.",
    };
  }
}

/**
 * Commits Attendance to Database & Dispatches Telegram Alert (Backend 70%).
 * Called when the user taps "Submit" on the Confirm Attendance modal.
 */
export async function submitAttendanceRecord(payload: {
  userId: string;
  systemId?: string;
  qrData: string;
  date: string;
  time: string;
  type: "time-in" | "time-out" | "time-other";
  timestamp?: string;
  name?: string;
  remark?: string;
  image?: string;
}): Promise<{
  success: boolean;
  record: NonNullable<ProcessScanResult["record"]>;
}> {
  return await apiClient.post<{
    success: boolean;
    record: NonNullable<ProcessScanResult["record"]>;
  }>("/attendance-security/confirm", payload, {
    timeout: 45000,
  });
}
