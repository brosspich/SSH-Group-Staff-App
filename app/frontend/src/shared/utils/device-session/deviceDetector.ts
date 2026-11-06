import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";
import type { DeviceMetadata, DeviceType } from "./types";

/**
 * Resolves high-level device category.
 */
export function resolveDeviceType(): DeviceType {
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

/**
 * Resolves browser & OS information in web runtime environments.
 */
export async function parseWebBrowserInfo(): Promise<{
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

  // Operating System Detection
  if (ua.includes("Windows NT 10.0")) {
    os = "Windows";
    os_version = "10";

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
          if (major >= 13) {
            os_version = "11";
          }
        }
      } catch {
        // Fallback to Windows 10
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

  // Browser Engine Detection
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
 * Resolves current device hardware, OS, and application metadata.
 */
export async function resolveDeviceMetadata(): Promise<DeviceMetadata> {
  const deviceType = resolveDeviceType();
  const expoConfig =
    Constants.expoConfig ||
    (Constants as any).manifest2?.extra?.expoClient ||
    (Constants as any).manifest;
  const baseAppVersion = expoConfig?.version || "1.0.1";
  const appVersionCode =
    (Platform.OS === "ios"
      ? expoConfig?.ios?.buildNumber
      : expoConfig?.android?.versionCode) || "10311";
  const appVersion = `${baseAppVersion}.${appVersionCode}`;

  if (Platform.OS === "web") {
    const webInfo = await parseWebBrowserInfo();
    return {
      deviceName: "Web Browser",
      deviceType: "web",
      modelName: `${webInfo.browser_name} Browser`,
      modelNumber: `${webInfo.browser_name} ${webInfo.browser_version}`,
      os: webInfo.os,
      osVersion: webInfo.os_version,
      browserName: webInfo.browser_name,
      browserVersion: webInfo.browser_version,
      appVersion,
    };
  }

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
    return {
      deviceName: rawDeviceName || "P50 Pro",
      deviceType,
      modelName: "HUAWEI P50 Pro",
      modelNumber: "JAD-AL00",
      os: "HarmonyOS",
      osVersion: Device.osVersion || "4.2.0",
      appVersion,
    };
  }

  const os = Device.osName || (Platform.OS === "ios" ? "iOS" : "Android");
  const osVersion = Device.osVersion || Platform.Version?.toString() || "1.0";
  const deviceName = rawDeviceName || rawModel || "Mobile Device";
  const modelName = rawBrand ? `${rawBrand} ${deviceName}`.trim() : deviceName;
  const modelNumber = rawModel.includes("-")
    ? rawModel
    : rawDesign || "Standard";

  return {
    deviceName,
    deviceType,
    modelName,
    modelNumber,
    os,
    osVersion,
    appVersion,
  };
}
