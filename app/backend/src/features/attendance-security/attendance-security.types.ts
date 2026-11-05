export type SecurityErrorCode =
  | "PERMISSION_DENIED"
  | "MOCK_LOCATION"
  | "OUT_OF_RANGE"
  | "VPN_DETECTED"
  | "INVALID_QR"
  | "USER_NOT_FOUND"
  | "COMPANY_NOT_FOUND"
  | "UNKNOWN_ERROR";

export interface VerifySecurityPayload {
  systemId?: string;
  companyId?: string;
  latitude: number;
  longitude: number;
  isMocked?: boolean;
  ipAddress?: string;
}

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

export interface ProcessScanPayload {
  userId: string;
  systemId?: string;
  companyId?: string;
  qrData: string;
  latitude?: number;
  longitude?: number;
  isMocked?: boolean;
  ipAddress?: string;
  previewOnly?: boolean;
}

export interface ConfirmAttendancePayload {
  userId: string;
  systemId?: string;
  qrData: string;
  date: string;
  time: string;
  type: "time-in" | "time-out" | "time-other";
  timestamp?: string;
  name?: string;
  latitude?: number;
  longitude?: number;
  ipAddress?: string;
}

export interface ConfirmAttendanceResult {
  success: boolean;
  record: AttendanceRecordDto;
}

export interface AttendanceRecordDto {
  id: string;
  staff_id: string;
  system_id?: string;
  name: string;
  date: string;
  time: string;
  type: "time-in" | "time-out" | "time-other";
  timestamp: string;
  qr_data: string;
}

export interface ProcessScanResult {
  allowed: boolean;
  code?: SecurityErrorCode;
  reason?: string;
  record?: AttendanceRecordDto;
  distanceMeters?: number;
}
