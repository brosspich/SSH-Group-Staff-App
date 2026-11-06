import { apiClient } from "@/shared/services/api";
import { resolveDeviceMetadata } from "./deviceDetector";
import { fetchGeoLocation } from "./geoService";
import { getSessionId, setSessionId } from "./sessionStorage";
import type { DeviceSession, InactivePeriod } from "./types";

/**
 * Normalizes device sessions returned from backend or user data.
 */
export function parseDevices(raw: unknown): DeviceSession[] {
  let list: any[] = [];

  if (Array.isArray(raw)) {
    list = raw;
  } else if (raw && typeof raw === "object") {
    list = [raw];
  } else if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) list = parsed;
      else if (parsed && typeof parsed === "object") list = [parsed];
    } catch {
      return [];
    }
  }

  return list.map((d: any) => ({
    id: String(d.id),
    device_name: d.device_name || d.deviceName || "Unknown Device",
    device_type: d.device_type || d.deviceType || "phone",
    model_name: d.model_name || d.modelName,
    model_number: d.model_number || d.modelNumber,
    browser_name: d.browser_name || d.browserName,
    browser_version: d.browser_version || d.browserVersion,
    os: d.os || "Unknown OS",
    os_version: d.os_version || d.osVersion || "1.0",
    app_version: d.app_version || d.appVersion || "1.0.1.10311",
    location:
      typeof d.location === "object"
        ? JSON.stringify(d.location)
        : d.location || "Phnom Penh, Cambodia",
    ip_address: d.ip_address || d.ipAddress || d.ip || "124.248.173.5",
    last_login: d.last_login || d.lastLogin,
    last_use_time:
      d.last_use_time || d.lastUseTime || d.last_active || d.lastActive,
    last_active: d.last_active || d.lastActive || new Date().toISOString(),
    terminate:
      d.terminate === true ||
      d.terminate === "true" ||
      d.isTerminated === 1 ||
      d.isTerminated === true ||
      d.isTerminated === "true"
        ? "true"
        : "false",
  }));
}

export function getCambodiaISOString(): string {
  return new Date().toISOString();
}

/**
 * Directly fetches active device sessions for the user from backend (Backend 70%).
 */
export async function fetchUserDeviceSessions(
  userId: string,
): Promise<DeviceSession[]> {
  try {
    const res = await apiClient.get<any>(
      `/devices?userId=${encodeURIComponent(userId)}`,
      {
        timeout: 8000,
      },
    );
    return parseDevices(res);
  } catch (e) {
    console.warn("fetchUserDeviceSessions error:", e);
    return [];
  }
}

/**
 * Syncs device session with backend (Backend 70% handles deduplication, limits, persistence).
 */
export async function syncDeviceSession(
  userId: string,
  isAppOpen: boolean = false,
  isExplicitLogin: boolean = false,
): Promise<boolean> {
  try {
    let sessionId = await getSessionId();
    const meta = await resolveDeviceMetadata();
    const geo = await fetchGeoLocation();

    const response = await apiClient.post<any>("/devices/sync", {
      userId,
      sessionId,
      deviceName: meta.deviceName,
      modelName: meta.modelName,
      modelNumber: meta.modelNumber,
      deviceType: meta.deviceType,
      browserName: meta.browserName,
      browserVersion: meta.browserVersion,
      os: meta.os,
      osVersion: meta.osVersion,
      appVersion: meta.appVersion,
      ipAddress: geo.ip,
      location: geo.location,
      isExplicitLogin,
    });

    if (response?.id && response.id !== sessionId) {
      await setSessionId(response.id);
    }

    if (response?.isTerminated) {
      return false; // Terminated by server policy
    }

    return true;
  } catch (e) {
    console.warn("syncDeviceSession error:", e);
    return false;
  }
}

/**
 * Terminates a specific device session via Backend API (Backend 70%).
 */
export async function terminateDeviceSession(
  userId: string,
  deviceId: string,
): Promise<boolean> {
  try {
    await apiClient.post(`/devices/${deviceId}/terminate`, { userId });
    return true;
  } catch (e) {
    console.error("Failed to terminate device session:", e);
    return false;
  }
}

/**
 * Terminates all other active sessions for the user via Backend API (Backend 70%).
 */
export async function terminateOtherDeviceSessions(
  userId: string,
  keepDeviceId: string,
): Promise<boolean> {
  try {
    await apiClient.post("/devices/terminate-others", {
      userId,
      currentSessionId: keepDeviceId,
    });
    return true;
  } catch (e) {
    console.error("Failed to terminate other device sessions:", e);
    return false;
  }
}

/**
 * Automatically terminates sessions that have exceeded the inactive threshold via Backend API.
 */
export async function autoTerminateInactiveSessions(
  userId: string,
  currentSessionId: string,
  period: InactivePeriod,
): Promise<boolean> {
  try {
    await apiClient.post("/devices/auto-terminate-inactive", {
      userId,
      currentSessionId,
      period,
    });
    return true;
  } catch (e) {
    console.warn("Failed to auto-terminate inactive sessions:", e);
    return false;
  }
}
