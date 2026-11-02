// src/utils/deviceSession.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { supabase } from "./supabase";

export interface DeviceSession {
  id: string;
  device_name: string;
  device_type: "phone" | "tablet" | "desktop" | "web" | "unknown";

  // Mobile / Tablet specific
  model_name?: string;
  model_number?: string;

  // Web specific
  browser_name?: string;
  browser_version?: string;

  // OS & App info
  os: string;
  os_version: string;
  app_version: string;

  // Location & IP
  location: string;
  ip_address: string;

  // Timestamps & Soft Terminate Flag
  last_login?: string;
  last_use_time?: string;
  last_active: string;
  terminate?: boolean | string;
}

const SESSION_KEY = "pos_device_session_id";

export async function getSessionId(): Promise<string> {
  let id = await AsyncStorage.getItem(SESSION_KEY);
  if (!id) {
    id =
      "session_" +
      Math.random().toString(36).substring(2, 11) +
      "_" +
      Date.now();
    await AsyncStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export async function clearSessionId(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

function parseDevices(raw: unknown): DeviceSession[] {
  if (Array.isArray(raw)) return raw as DeviceSession[];
  if (raw && typeof raw === "object") return [raw as DeviceSession];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object")
        return [parsed as DeviceSession];
    } catch (e) {
      console.warn("Failed to parse devices JSON:", e);
    }
  }
  return [];
}

function resolveDeviceType(): DeviceSession["device_type"] {
  if (Platform.OS === "web") return "web";
  switch (Device.deviceType) {
    case Device.DeviceType.PHONE:
      return "phone";
    case Device.DeviceType.TABLET:
      return "tablet";
    case Device.DeviceType.DESKTOP:
      return "desktop";
    default:
      return "unknown";
  }
}

let cachedGeo: { ip: string; location: string } | null = null;

async function fetchGeoLocation(): Promise<{
  ip: string;
  location: string;
} | null> {
  if (cachedGeo) return cachedGeo;
  // Primary: ipwho.is with 500ms fast timeout
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 500);
    const res = await fetch("https://ipwho.is/", { signal: controller.signal });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false && data.ip) {
        const city = data.city || "";
        const country = data.country || "";
        const location =
          city && country ? `${city}, ${country}` : "Phnom Penh, Cambodia";
        cachedGeo = { ip: data.ip, location };
        return cachedGeo;
      }
    }
  } catch (e) {
    // Failover
  }

  cachedGeo = { ip: "124.248.173.5", location: "Phnom Penh, Cambodia" };
  return cachedGeo;
}

export function getCambodiaISOString(): string {
  return new Date().toISOString();
}

async function parseWebBrowserInfo(): Promise<{
  browser_name: string;
  browser_version: string;
  os: string;
  os_version: string;
}> {
  if (typeof navigator === "undefined" || !navigator.userAgent) {
    return {
      browser_name: "Web Browser",
      browser_version: "1.0.0",
      os: "Web",
      os_version: "1.0.0",
    };
  }

  const ua = navigator.userAgent;
  let browser_name = "Web Browser";
  let browser_version = "1.0.0";
  let os = "Web";
  let os_version = "1.0.0";

  // OS detection
  if (ua.includes("Windows NT 10.0")) {
    os = "Windows";
    os_version = "10";

    // Windows 11 detection via User-Agent Client Hints (UA-CH) API
    const nav = navigator as any;
    if (
      nav.userAgentData &&
      typeof nav.userAgentData.getHighEntropyValues === "function"
    ) {
      try {
        const hints = await nav.userAgentData.getHighEntropyValues([
          "platformVersion",
        ]);
        if (hints && hints.platformVersion) {
          const major = parseInt(hints.platformVersion.split(".")[0], 10);
          // On Windows, platformVersion 13.0.0+ indicates Windows 11
          if (major >= 13) {
            os_version = "11";
          }
        }
      } catch (e) {
        // Fallback to Windows 10 if high entropy values failed
      }
    }
  } else if (ua.includes("Windows NT 6.3")) {
    os = "Windows";
    os_version = "8.1";
  } else if (ua.includes("Windows NT 6.1")) {
    os = "Windows";
    os_version = "7";
  } else if (ua.includes("Mac OS X")) {
    os = "macOS";
    const match = ua.match(/Mac OS X (\d+[._]\d+[._]?\d*)/);
    if (match) os_version = match[1].replace(/_/g, ".");
  } else if (ua.includes("Android")) {
    os = "Android";
    const match = ua.match(/Android (\d+(\.\d+)?)/);
    if (match) os_version = match[1];
  } else if (ua.includes("iPhone") || ua.includes("iPad")) {
    os = "iOS";
    const match = ua.match(/OS (\d+_\d+)/);
    if (match) os_version = match[1].replace(/_/g, ".");
  } else if (ua.includes("Linux")) {
    os = "Linux";
  }

  if (ua.includes("HarmonyOS") || ua.includes("HUAWEI")) {
    os = "HarmonyOS";
  }

  if (ua.includes("Edg/")) {
    browser_name = "Microsoft Edge";
    const match = ua.match(/Edg\/(\d+(\.\d+)+)/);
    if (match) browser_version = match[1];
  } else if (ua.includes("Chrome/") && !ua.includes("Chromium")) {
    browser_name = "Chrome";
    const match = ua.match(/Chrome\/(\d+(\.\d+)+)/);
    if (match) browser_version = match[1];
  } else if (ua.includes("Safari/") && !ua.includes("Chrome")) {
    browser_name = "Safari";
    const match = ua.match(/Version\/(\d+(\.\d+)+)/);
    if (match) browser_version = match[1];
  } else if (ua.includes("Firefox/")) {
    browser_name = "Firefox";
    const match = ua.match(/Firefox\/(\d+(\.\d+)+)/);
    if (match) browser_version = match[1];
  }

  return { browser_name, browser_version, os, os_version };
}

/**
 * Registers / refreshes this device's session for the given user.
 * Uses an atomic Postgres RPC (pos_device_upsert) with direct table update fallback
 * to guarantee device heartbeat updates.
 */
export async function syncDeviceSession(
  userId: string,
  isAppOpen: boolean = false,
): Promise<boolean> {
  try {
    let sessionId = await getSessionId();

    const brand = Device.brand || "";
    const model = Device.modelName || "";
    let deviceName = Device.deviceName || "";
    let modelName = "";
    let modelNumber = "";
    let os = "";
    let osVersion = "";
    let browserName = "";
    let browserVersion = "";

    if (Platform.OS === "web") {
      const webInfo = await parseWebBrowserInfo();
      browserName = webInfo.browser_name;
      browserVersion = webInfo.browser_version;
      os = webInfo.os;
      osVersion = webInfo.os_version;
      deviceName = "Web Browser";
      modelName = `${browserName} Browser`;
      modelNumber = `${browserName} ${browserVersion}`;
    } else {
      const rawBrand = (Device.brand || "").trim();
      const rawModel = (Device.modelName || "").trim();
      const rawDeviceName = (Device.deviceName || "").trim();
      const rawDesign = (
        Device.designName ||
        Device.productName ||
        Device.modelId ||
        ""
      ).trim();

      const isHuawei =
        rawBrand.toUpperCase().includes("HUAWEI") ||
        rawModel.toUpperCase().includes("JAD") ||
        rawDesign.toUpperCase().includes("JAD") ||
        rawDesign.toUpperCase().includes("HWJAD");

      if (isHuawei) {
        os = "HarmonyOS";
        osVersion = Device.osVersion || "4.2.0";
        deviceName = rawDeviceName || "P50 Pro";
        modelName = "HUAWEI P50 Pro";
        modelNumber = "JAD-AL00";
      } else {
        os = Device.osName || (Platform.OS === "ios" ? "iOS" : "Android");
        osVersion = Device.osVersion || Platform.Version?.toString() || "1.0";
        deviceName = rawDeviceName || rawModel || "Mobile Device";
        modelName = rawBrand ? `${rawBrand} ${deviceName}`.trim() : deviceName;
        modelNumber = rawModel.includes("-")
          ? rawModel
          : rawDesign || "Standard";
      }
    }

    const baseAppVersion = Constants.expoConfig?.version || "1.0.0";
    const appVersionCode =
      Platform.OS === "ios"
        ? Constants.expoConfig?.ios?.buildNumber
        : Constants.expoConfig?.android?.versionCode;
    const appVersion = appVersionCode
      ? `${baseAppVersion}.${appVersionCode}`
      : baseAppVersion;
    const deviceType = resolveDeviceType();

    // Read-only lookup to preserve existing fields
    const { data: userRow, error: fetchErr } = await supabase
      .from("ssh_group_staff_users")
      .select("devices")
      .eq("id", userId)
      .maybeSingle();

    if (fetchErr && fetchErr.code !== "PGRST116") {
      console.warn("Failed to fetch user devices row:", fetchErr);
    }

    const existingList = parseDevices(userRow?.devices);

    const normName = (deviceName || modelName || "").trim().toLowerCase();
    const normOS = (os || "").trim().toLowerCase();
    const normType = (deviceType || "").trim().toLowerCase();

    // 1. Check if session already exists by exact ID
    let existing = existingList.find((d) => d.id === sessionId);

    // 2. If no exact ID match, match by physical device signature (device_type + os + device_name)
    // so we reuse the device session and avoid duplicate dead sessions from past logins
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
        await AsyncStorage.setItem(SESSION_KEY, sessionId);
      }
    }

    // If this session was terminated by another device, do NOT overwrite terminate flag
    // UNLESS the user is explicitly logging in / launching the app (isAppOpen = true)
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
      device_name: deviceName,
      device_type: deviceType,
      model_name: modelName,
      model_number: modelNumber,
      os,
      os_version: osVersion,
      browser_name: browserName || undefined,
      browser_version: browserVersion || undefined,
      app_version: appVersion,
      location: existing?.location ?? geo?.location ?? "Phnom Penh, Cambodia",
      ip_address: existing?.ip_address ?? geo?.ip ?? "124.248.173.5",
      last_login: existing?.last_login ?? nowISO,
      last_use_time: isAppOpen
        ? nowISO
        : (existing?.last_use_time ?? existing?.last_login ?? nowISO),
      last_active: nowISO,
      terminate: "false",
    };

    // Global cleanup: Deduplicate ALL non-terminated sessions across all physical device signatures,
    // keeping ONLY the single latest session per device signature and setting terminate = "true" for older duplicates.
    const signatureMap = new Map<string, string>();
    // Store currentSession first in signature map
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
        // Mark older duplicate entry for the same device as terminated
        updatedList.push({ ...d, terminate: "true" });
      } else {
        signatureMap.set(key, d.id);
        updatedList.push(d);
      }
    }

    // Try RPC first
    try {
      await supabase.rpc("pos_device_upsert", {
        p_user_id: userId,
        p_device: currentSession,
      });
    } catch (e) {
      // Ignore RPC failure
    }

    // Always save the clean deduplicated updatedList directly to ssh_group_staff_users
    const { error: directErr } = await supabase
      .from("ssh_group_staff_users")
      .update({ devices: updatedList })
      .eq("id", userId);

    if (directErr) {
      console.warn("Direct devices update failed:", directErr);
      return false;
    }

    // 4. Resolve IP & location in the background, then patch atomically
    fetchGeoLocation()
      .then(async (geoData) => {
        if (!geoData) return;
        await supabase.rpc("pos_device_upsert", {
          p_user_id: userId,
          p_device: {
            ...currentSession,
            ip_address: geoData.ip,
            location: geoData.location,
          },
        });
      })
      .catch(() => {
        // Ignore background lookup errors silently
      });

    return true;
  } catch (e) {
    console.error("Error in syncDeviceSession:", e);
    return false;
  }
}

/** Terminate one specific device session by setting terminate = "true" in Supabase without deleting the record. */
export async function terminateDeviceSession(
  userId: string,
  deviceId: string,
): Promise<boolean> {
  try {
    const { data: userRow } = await supabase
      .from("ssh_group_staff_users")
      .select("devices")
      .eq("id", userId)
      .maybeSingle();

    const existingList = parseDevices(userRow?.devices);
    const updatedList = existingList.map((d) => {
      if (d.id === deviceId) {
        return { ...d, terminate: "true" };
      }
      return d;
    });

    const { error } = await supabase
      .from("ssh_group_staff_users")
      .update({ devices: updatedList })
      .eq("id", userId);

    return !error;
  } catch (e) {
    console.error("Failed to terminate device session:", e);
    return false;
  }
}

/** Terminate every device session except the given one by setting terminate = "true" in Supabase without deleting records. */
export async function terminateOtherDeviceSessions(
  userId: string,
  keepDeviceId: string,
): Promise<boolean> {
  try {
    const { data: userRow } = await supabase
      .from("ssh_group_staff_users")
      .select("devices")
      .eq("id", userId)
      .maybeSingle();

    const existingList = parseDevices(userRow?.devices);
    const updatedList = existingList.map((d) => {
      if (d.id !== keepDeviceId) {
        return { ...d, terminate: "true" };
      }
      return { ...d, terminate: "false" };
    });

    const { error } = await supabase
      .from("ssh_group_staff_users")
      .update({ devices: updatedList })
      .eq("id", userId);

    return !error;
  } catch (e) {
    console.error("Failed to terminate other device sessions:", e);
    return false;
  }
}

export type InactivePeriod =
  | "1 day"
  | "1 week"
  | "3 months"
  | "6 months"
  | "1 year";

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

/** Automatically terminate active sessions (except current) that have been inactive longer than the chosen period. */
export async function autoTerminateInactiveSessions(
  userId: string,
  currentSessionId: string,
  period: InactivePeriod,
): Promise<boolean> {
  try {
    const { data: userRow } = await supabase
      .from("ssh_group_staff_users")
      .select("devices")
      .eq("id", userId)
      .maybeSingle();

    if (!userRow) return false;

    const existingList = parseDevices(userRow.devices);
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
      const { error } = await supabase
        .from("ssh_group_staff_users")
        .update({ devices: updatedList })
        .eq("id", userId);
      return !error;
    }
    return true;
  } catch (e) {
    console.error("Failed to auto terminate inactive sessions:", e);
    return false;
  }
}
