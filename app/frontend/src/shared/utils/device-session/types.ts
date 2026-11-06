export type DeviceType = "phone" | "tablet" | "desktop" | "web" | "unknown";

export interface DeviceSession {
  id: string;
  device_name: string;
  device_type: DeviceType;

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

export type InactivePeriod =
  | "1 day"
  | "1 week"
  | "3 months"
  | "6 months"
  | "1 year";

export interface GeoLocationInfo {
  ip: string;
  location: string;
}

export interface DeviceMetadata {
  deviceName: string;
  deviceType: DeviceType;
  modelName: string;
  modelNumber: string;
  os: string;
  osVersion: string;
  browserName?: string;
  browserVersion?: string;
  appVersion: string;
}
