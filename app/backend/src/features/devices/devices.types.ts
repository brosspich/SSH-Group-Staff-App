export interface DeviceSessionDto {
  id: string;
  userId: string;
  deviceName: string;
  modelName: string;
  os: string;
  osVersion: string;
  appVersion: string;
  ipAddress: string;
  location?: string | null;
  isTerminated: boolean;
  lastActive: string;
  lastLogin: string;
}

export interface SyncDevicePayload {
  sessionId?: string;
  userId: string;
  deviceName: string;
  modelName?: string;
  os?: string;
  osVersion?: string;
  appVersion?: string;
  ipAddress?: string;
  location?: string;
}
