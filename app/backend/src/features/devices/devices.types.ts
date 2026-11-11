export type InactivePeriod =
  | "1 day"
  | "1 week"
  | "3 months"
  | "6 months"
  | "1 year";

export interface DeviceSessionDto {
  id: string;
  userId: string;
  deviceName: string;
  device_name: string;
  modelName: string;
  model_name: string;
  modelNumber?: string;
  model_number?: string;
  deviceType?: string;
  device_type?: string;
  browserName?: string;
  browser_name?: string;
  browserVersion?: string;
  browser_version?: string;
  os: string;
  osVersion: string;
  os_version: string;
  appVersion: string;
  app_version: string;
  ipAddress: string;
  ip_address: string;
  location?: string | null;
  isTerminated: boolean;
  terminate: boolean | string;
  loginTimed: string;
  login_timed: string;
  lastActive: string;
  last_active: string;
  lastLogin: string;
  last_login: string;
}

export interface SyncDevicePayload {
  sessionId?: string;
  userId: string;
  deviceName: string;
  modelName?: string;
  modelNumber?: string;
  deviceType?: string;
  browserName?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  appVersion?: string;
  ipAddress?: string;
  location?: string;
  isExplicitLogin?: boolean;
}
