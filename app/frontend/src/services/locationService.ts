import { apiClient } from "@/services/api";
import * as Location from "expo-location";
import * as Network from "expo-network";
import { Platform } from "react-native";

export interface CompanyLocationConfig {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  name: string;
}

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

/**
 * Reads device GPS position with timeout protection (Thin Client Sensor Layer)
 */
async function getDeviceGpsPosition(): Promise<Location.LocationObject> {
  // Try fast last known position first (0ms)
  const lastKnown = await Location.getLastKnownPositionAsync().catch(
    () => null,
  );
  if (
    lastKnown &&
    Date.now() - lastKnown.timestamp < 30 * 1000 &&
    lastKnown.coords.accuracy !== null &&
    lastKnown.coords.accuracy < 100
  ) {
    return lastKnown;
  }

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
      6000,
    ),
  );

  return await Promise.race([positionPromise, timeoutPromise]);
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
  };
  distanceMeters?: number;
}

/**
 * Executes End-to-End Attendance Scan (Frontend 30% Sensors/UI -> Backend 70% Conditions/DB)
 */
export async function scanAttendanceWithSecurity(payload: {
  userId: string;
  systemId?: string;
  qrData: string;
}): Promise<ProcessScanResult> {
  try {
    let coords = { latitude: 0, longitude: 0 };
    let isMocked = false;
    let localIp: string | undefined;

    if (Platform.OS !== "web") {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const [pos, ip] = await Promise.all([
          getDeviceGpsPosition().catch(() => null),
          Network.getIpAddressAsync().catch(() => undefined),
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

    // Call Backend 70%: Backend evaluates ALL conditions (A vs B, QR validity, Time window) & saves to DB!
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
