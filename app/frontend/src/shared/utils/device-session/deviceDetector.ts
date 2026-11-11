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

  const rawBrand = (Device.brand || Device.manufacturer || "").trim();
  const rawModel = (Device.modelName || "").trim();
  const rawDeviceName = (Device.deviceName || "").trim();
  const rawDesign = (
    Device.designName ||
    Device.productName ||
    Device.modelId ||
    ""
  ).trim();
  const rawBuildFingerprint = (Device.osBuildFingerprint || "").toString();
  const rawOsBuildId = (Device.osBuildId || "").toString();
  const rawOsInternalId = (Device.osInternalBuildId || "").toString();
  const rawAndroidVersion = (
    Device.osVersion ||
    Platform.Version?.toString() ||
    "12"
  )
    .toString()
    .trim();

  const brandUpper = rawBrand.toUpperCase();
  const modelUpper = rawModel.toUpperCase();
  const designUpper = rawDesign.toUpperCase();
  const fpUpper = rawBuildFingerprint.toUpperCase();
  const buildIdUpper = rawOsBuildId.toUpperCase();

  // 1. APPLE (iOS / iPadOS)
  if (Platform.OS === "ios" || brandUpper.includes("APPLE")) {
    const isTablet = deviceType === "tablet" || modelUpper.includes("IPAD");
    const os = isTablet ? "iPadOS" : "iOS";
    const osVersion = Device.osVersion || "17.5";
    const modelName = rawModel || (isTablet ? "Apple iPad" : "Apple iPhone");
    const modelNumber = Device.modelId || rawModel || "iPhone";
    const deviceName = rawDeviceName || modelName;

    return {
      deviceName,
      deviceType: isTablet ? "tablet" : "phone",
      modelName,
      modelNumber,
      os,
      osVersion,
      appVersion,
    };
  }

  // 2. HUAWEI & HONOR (HarmonyOS / EMUI)
  const isHuawei =
    brandUpper.includes("HUAWEI") ||
    brandUpper.includes("HONOR") ||
    modelUpper.includes("JAD") ||
    designUpper.includes("JAD") ||
    designUpper.includes("HW") ||
    fpUpper.includes("HUAWEI") ||
    fpUpper.includes("HWJAD");

  if (isHuawei) {
    const isEmui = buildIdUpper.includes("EMUI") || fpUpper.includes("EMUI");
    const os = isEmui ? "EMUI" : "HarmonyOS";

    // Extract exact version: check build id & fingerprint for e.g. 4.2.0, 4.0.0, 3.1.0, 3.0.0, 2.0.0
    let detectedVersion = "";
    const allStrings = [
      rawOsBuildId,
      rawOsInternalId,
      rawBuildFingerprint,
      rawModel,
      rawDesign,
    ];
    for (const s of allStrings) {
      const match = s.match(/\b([234]\.\d+(\.\d+)?)\b/);
      if (match) {
        detectedVersion =
          match[1].includes(".") && match[1].split(".").length === 2
            ? `${match[1]}.0`
            : match[1];
        break;
      }
    }

    // Huawei P50 Pro (JAD-AL00) production release is HarmonyOS 4.2.0
    const isP50Pro =
      modelUpper.includes("JAD") ||
      designUpper.includes("JAD") ||
      rawDeviceName.includes("P50 Pro");

    if (!detectedVersion) {
      if (isP50Pro) {
        detectedVersion = "4.2.0";
      } else if (rawAndroidVersion === "12") {
        detectedVersion = "4.2.0";
      } else if (rawAndroidVersion === "11") {
        detectedVersion = "3.0.0";
      } else if (rawAndroidVersion === "10") {
        detectedVersion = "2.0.0";
      } else {
        detectedVersion = "4.2.0";
      }
    }

    const deviceName =
      rawDeviceName || (isP50Pro ? "P50 Pro" : rawModel || "HUAWEI Device");
    const modelName = isP50Pro
      ? "HUAWEI P50 Pro"
      : rawModel.toUpperCase().startsWith("HUAWEI")
        ? rawModel
        : `HUAWEI ${rawModel || deviceName}`.trim();
    const modelNumber = isP50Pro
      ? "JAD-AL00"
      : rawModel.includes("-")
        ? rawModel
        : rawDesign || "HUAWEI";

    return {
      deviceName,
      deviceType,
      modelName,
      modelNumber,
      os,
      osVersion: detectedVersion,
      appVersion,
    };
  }

  // 3. SAMSUNG (One UI)
  const isSamsung =
    brandUpper.includes("SAMSUNG") || fpUpper.includes("SAMSUNG");
  if (isSamsung) {
    const androidVer = parseInt(rawAndroidVersion, 10) || 14;
    let oneUiVer = "6.1";
    if (androidVer >= 15) oneUiVer = "7.0";
    else if (androidVer === 14) oneUiVer = "6.1";
    else if (androidVer === 13) oneUiVer = "5.1";
    else if (androidVer === 12) oneUiVer = "4.1";
    else if (androidVer === 11) oneUiVer = "3.1";
    else if (androidVer === 10) oneUiVer = "2.5";

    const os = "One UI";
    const osVersion = `${oneUiVer} (Android ${rawAndroidVersion})`;

    let modelName = rawModel;
    if (modelUpper.startsWith("SM-S928"))
      modelName = "Samsung Galaxy S24 Ultra";
    else if (modelUpper.startsWith("SM-S918"))
      modelName = "Samsung Galaxy S23 Ultra";
    else if (modelUpper.startsWith("SM-A346"))
      modelName = "Samsung Galaxy A34 5G";
    else if (modelUpper.startsWith("SM-A546"))
      modelName = "Samsung Galaxy A54 5G";
    else if (
      !modelUpper.includes("SAMSUNG") &&
      !modelUpper.includes("GALAXY")
    ) {
      modelName = `Samsung ${rawModel || rawDeviceName || "Galaxy"}`.trim();
    }

    const modelNumber = rawModel.includes("-")
      ? rawModel
      : rawDesign || rawModel || "Samsung";
    const deviceName = rawDeviceName || modelName;

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

  // 4. XIAOMI / REDMI / POCO (HyperOS / MIUI)
  const isXiaomi =
    brandUpper.includes("XIAOMI") ||
    brandUpper.includes("REDMI") ||
    brandUpper.includes("POCO") ||
    fpUpper.includes("XIAOMI");
  if (isXiaomi) {
    const androidVer = parseInt(rawAndroidVersion, 10) || 14;
    const isHyper =
      buildIdUpper.includes("OS1.") ||
      buildIdUpper.includes("OS2.") ||
      androidVer >= 14;
    const os = isHyper ? "HyperOS" : "MIUI";
    const osVersion = isHyper
      ? `1.0 (Android ${rawAndroidVersion})`
      : `14 (Android ${rawAndroidVersion})`;
    const modelName = rawModel.toUpperCase().startsWith(brandUpper)
      ? rawModel
      : `${rawBrand} ${rawModel || rawDeviceName}`.trim();
    const modelNumber = rawModel || rawDesign || "Xiaomi";
    const deviceName = rawDeviceName || modelName;

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

  // 5. OPPO (ColorOS)
  const isOppo = brandUpper.includes("OPPO") || fpUpper.includes("OPPO");
  if (isOppo) {
    const os = "ColorOS";
    const osVersion = `${rawAndroidVersion}.0 (Android ${rawAndroidVersion})`;
    const modelName = rawModel.toUpperCase().startsWith("OPPO")
      ? rawModel
      : `OPPO ${rawModel || rawDeviceName}`.trim();
    const modelNumber = rawModel.includes("-")
      ? rawModel
      : rawDesign || rawModel || "OPPO";
    const deviceName = rawDeviceName || modelName;

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

  // 6. VIVO / IQOO (Funtouch OS / OriginOS)
  const isVivo =
    brandUpper.includes("VIVO") ||
    brandUpper.includes("IQOO") ||
    fpUpper.includes("VIVO");
  if (isVivo) {
    const os = "Funtouch OS";
    const osVersion = `${rawAndroidVersion}.0 (Android ${rawAndroidVersion})`;
    const modelName = rawModel.toLowerCase().startsWith("vivo")
      ? rawModel
      : `vivo ${rawModel || rawDeviceName}`.trim();
    const modelNumber = rawModel.includes("-")
      ? rawModel
      : rawDesign || rawModel || "vivo";
    const deviceName = rawDeviceName || modelName;

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

  // 7. ONEPLUS (OxygenOS)
  const isOnePlus =
    brandUpper.includes("ONEPLUS") || fpUpper.includes("ONEPLUS");
  if (isOnePlus) {
    const os = "OxygenOS";
    const osVersion = `${rawAndroidVersion}.0 (Android ${rawAndroidVersion})`;
    const modelName = rawModel.toUpperCase().startsWith("ONEPLUS")
      ? rawModel
      : `OnePlus ${rawModel || rawDeviceName}`.trim();
    const modelNumber = rawModel || rawDesign || "OnePlus";
    const deviceName = rawDeviceName || modelName;

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

  // 8. REALME (realme UI)
  const isRealme = brandUpper.includes("REALME") || fpUpper.includes("REALME");
  if (isRealme) {
    const androidVer = parseInt(rawAndroidVersion, 10) || 14;
    const realmeUiVer = Math.max(1, androidVer - 9);
    const os = "realme UI";
    const osVersion = `${realmeUiVer}.0 (Android ${rawAndroidVersion})`;
    const modelName = rawModel.toLowerCase().startsWith("realme")
      ? rawModel
      : `realme ${rawModel || rawDeviceName}`.trim();
    const modelNumber = rawModel || rawDesign || "realme";
    const deviceName = rawDeviceName || modelName;

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

  // 9. GOOGLE PIXEL & GENERIC ANDROID
  const isGoogle =
    brandUpper.includes("GOOGLE") || modelUpper.includes("PIXEL");
  const os = "Android";
  const osVersion = rawAndroidVersion;
  const modelName = isGoogle
    ? modelUpper.startsWith("GOOGLE")
      ? rawModel
      : `Google ${rawModel || "Pixel"}`.trim()
    : rawBrand
      ? `${rawBrand} ${rawModel || rawDeviceName}`.trim()
      : rawModel || rawDeviceName || "Android Device";
  const modelNumber = rawModel.includes("-")
    ? rawModel
    : rawDesign || rawModel || "Standard";
  const deviceName = rawDeviceName || modelName;

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
