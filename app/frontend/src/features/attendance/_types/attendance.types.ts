export type AttendanceType = "time-in" | "time-out" | "time-other";

export interface AttendanceRecord {
  id: string;
  staff_id: string;
  system_id?: string;
  name: string;
  username?: string;
  date: string; // YYYY-MM-DD
  time: string; // hh:mm:ss AM/PM
  type: AttendanceType;
  timestamp: string; // ISO string
  qr_data?: string;
  remark?: string | null;
}

export type AttendanceFilterType = "all" | "today" | "month";
