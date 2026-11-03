import { apiClient } from "@/services/api";
import { resolveDeviceMetadata } from "./deviceDetector";
import { fetchGeoLocation } from "./geoService";
import { getSessionId, setSessionId } from "./sessionStorage";
import type { DeviceSession, InactivePeriod } from "./types";

/**
 * Normalizes an unknown devices payload into a clean array of DeviceSession objects,
 * mapping both camelCase and snake_case properties consistently.
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
    app_version: d.app_version || d.appVersion || "1.0.0",
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
      d.isTerminated === "true"
        ? "true"
        : "false",
  }));
}

export function getCambodiaISOString(): string {
  return new Date().toISOString();
}

/**
 * Calculates milliseconds corresponding to the given inactive period duration.
 */
export function getInactiveThresholdMs(period: InactivePeriod): number {
  switch (period) {
    case "1 day":
      return 1 * 24 * 60 * 60 * 1000;
    case "1 week":
      return 7 * 24 * 60 * 60 * 1000;
    case "3 months":
      return 90 * 24 * 60 * 60 * 1000;
    case "6 months":
      return 180 * 24 * 60 * 60 * 1000;
    case "1 year":
      return 365 * 24 * 60 * 60 * 1000;
    default:
      return 180 * 24 * 60 * 60 * 1000;
  }
}

/**
 * Registers or refreshes this device's heartbeat session for the given user.
 * Reuses existing session IDs by matching physical device signatures to prevent dead phantom sessions.
 */
export async function syncDeviceSession(
  userId: string,
  isAppOpen: boolean = false,
): Promise<boolean> {
  try {
    let sessionId = await getSessionId();
    const meta = await resolveDeviceMetadata();

    // 1. Fetch current device list for user
    const userRow = await apiClient
      .get<any>(`/users-query/${userId}`)
      .catch(() => null);

    const existingList = parseDevices(
      userRow?.devices || userRow?.deviceSessions,
    );

    const normName = (meta.deviceName || meta.modelName || "")
      .trim()
      .toLowerCase();
    const normOS = (meta.os || "").trim().toLowerCase();
    const normType = (meta.deviceType || "").trim().toLowerCase();

    // 2. Exact session ID check
    let existing = existingList.find((d) => d.id === sessionId);

    // 3. Fallback signature match (device_type + os + name)
    if (!existing) {
      existing = existingList.find((d) => {
        const dName = (d.device_name || d.model_name || "")
          .trim()
          .toLowerCase();
        const dOS = (d.os || "").trim().toLowerCase();
        const dType = (d.device_type || "").trim().toLowerCase();
        return (
          dType === normType &&
          dOS === normOS &&
          (dName === normName ||
            dName.includes(normName) ||
            normName.includes(dName))
        );
      });
      if (existing) {
        sessionId = existing.id;
        await setSessionId(sessionId);
      }
    }

    // 4. Terminated session handling
    if (
      existing &&
      (existing.terminate === true || existing.terminate === "true")
    ) {
      if (!isAppOpen) {
        return false;
      }
    }

    const geo = await fetchGeoLocation();
    const nowISO = new Date().toISOString();

    const currentSession: DeviceSession = {
      id: sessionId,
      device_name: meta.deviceName,
      device_type: meta.deviceType,
      model_name: meta.modelName,
      model_number: meta.modelNumber,
      os: meta.os,
      os_version: meta.osVersion,
      browser_name: meta.browserName,
      browser_version: meta.browserVersion,
      app_version: meta.appVersion,
      location: existing?.location ?? geo.location,
      ip_address: existing?.ip_address ?? geo.ip,
      last_login: existing?.last_login ?? nowISO,
      last_use_time: isAppOpen
        ? nowISO
        : (existing?.last_use_time ?? existing?.last_login ?? nowISO),
      last_active: nowISO,
      terminate: "false",
    };

    // 5. Deduplicate sessions by physical device signature
    const signatureMap = new Map<string, string>();
    const currentKey = `${normType}_${normOS}_${normName}`;
    signatureMap.set(currentKey, currentSession.id);

    const updatedList: DeviceSession[] = [];
    const processList = [
      currentSession,
      ...existingList.filter((d) => d.id !== currentSession.id),
    ];

    for (const d of processList) {
      const isTerminated = d.terminate === true || d.terminate === "true";
      if (isTerminated) {
        updatedList.push(d);
        continue;
      }

      const dName = (d.device_name || d.model_name || "").trim().toLowerCase();
      const dOS = (d.os || "").trim().toLowerCase();
      const dType = (d.device_type || "").trim().toLowerCase();
      const key = `${dType}_${dOS}_${dName}`;

      if (signatureMap.has(key) && signatureMap.get(key) !== d.id) {
        updatedList.push({ ...d, terminate: "true" });
      } else {
        signatureMap.set(key, d.id);
        updatedList.push(d);
      }
    }

    // 6. Persist to Backend API
    await apiClient.put(`/users-query/${userId}`, { devices: updatedList });
    return true;
  } catch (e) {
    console.warn("syncDeviceSession error:", e);
    return false;
  }
}

/**
 * Terminates a specific device session without deleting history.
 */
export async function terminateDeviceSession(
  userId: string,
  deviceId: string,
): Promise<boolean> {
  try {
    const userRow = await apiClient
      .get<any>(`/users-query/${userId}`)
      .catch(() => null);

    const existingList = parseDevices(
      userRow?.devices || userRow?.deviceSessions,
    );
    const updatedList = existingList.map((d) =>
      d.id === deviceId ? { ...d, terminate: "true" } : d,
    );

    await apiClient.put(`/users-query/${userId}`, { devices: updatedList });
    return true;
  } catch (e) {
    console.error("Failed to terminate device session:", e);
    return false;
  }
}

/**
 * Terminates all other active sessions for the user, keeping the current device active.
 */
export async function terminateOtherDeviceSessions(
  userId: string,
  keepDeviceId: string,
): Promise<boolean> {
  try {
    const userRow = await apiClient
      .get<any>(`/users-query/${userId}`)
      .catch(() => null);

    const existingList = parseDevices(
      userRow?.devices || userRow?.deviceSessions,
    );
    const updatedList = existingList.map((d) => ({
      ...d,
      terminate: d.id === keepDeviceId ? "false" : "true",
    }));

    await apiClient.put(`/users-query/${userId}`, { devices: updatedList });
    return true;
  } catch (e) {
    console.error("Failed to terminate other device sessions:", e);
    return false;
  }
}

/**
 * Automatically terminates sessions (excluding current) that have exceeded the inactive threshold.
 */
export async function autoTerminateInactiveSessions(
  userId: string,
  currentSessionId: string,
  period: InactivePeriod,
): Promise<boolean> {
  try {
    const userRow = await apiClient
      .get<any>(`/users-query/${userId}`)
      .catch(() => null);

    if (!userRow) return false;

    const existingList = parseDevices(
      userRow?.devices || userRow?.deviceSessions,
    );
    const thresholdMs = getInactiveThresholdMs(period);
    const now = Date.now();
    let hasChanges = false;

    const updatedList = existingList.map((d) => {
      if (d.id === currentSessionId) return d;
      if (d.terminate === true || d.terminate === "true") return d;

      const lastActiveTime = new Date(d.last_active).getTime();
      if (!isNaN(lastActiveTime) && now - lastActiveTime > thresholdMs) {
        hasChanges = true;
        return { ...d, terminate: "true" };
      }
      return d;
    });

    if (hasChanges) {
      await apiClient.put(`/users-query/${userId}`, { devices: updatedList });
    }
    return true;
  } catch (e) {
    console.error("Failed to auto terminate inactive sessions:", e);
    return false;
  }
}
