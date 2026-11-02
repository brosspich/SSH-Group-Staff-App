export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: "present" | "absent" | "late" | "leave";
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface CheckInDTO {
  userId: string;
  latitude: number;
  longitude: number;
  qrCode?: string;
}

export interface AttendanceSummary {
  presentDays: number;
  lateDays: number;
  absentDays: number;
  totalWorkingDays: number;
}
