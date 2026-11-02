// src/features/attendance/index.ts
// Public Feature API

export { attendanceApi } from "./api/attendanceApi";
export { useAttendance } from "./hooks/useAttendance";
export { useAttendanceStore } from "./store/useAttendanceStore";
export type {
  AttendanceRecord,
  AttendanceSummary,
  CheckInDTO,
} from "./types/attendance.types";
