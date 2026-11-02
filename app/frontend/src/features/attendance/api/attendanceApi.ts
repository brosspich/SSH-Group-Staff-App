import { apiClient } from "@/services/api";
import {
  AttendanceRecord,
  AttendanceSummary,
  CheckInDTO,
} from "../types/attendance.types";

export const attendanceApi = {
  async getRecords(
    userId: string,
    month?: string,
  ): Promise<AttendanceRecord[]> {
    return await apiClient.get<AttendanceRecord[]>("/attendance/records", {
      params: { userId, month },
    });
  },

  async checkIn(data: CheckInDTO): Promise<AttendanceRecord> {
    return await apiClient.post<AttendanceRecord>("/attendance/check-in", data);
  },

  async checkOut(data: CheckInDTO): Promise<AttendanceRecord> {
    return await apiClient.post<AttendanceRecord>(
      "/attendance/check-out",
      data,
    );
  },

  async getSummary(userId: string): Promise<AttendanceSummary> {
    return await apiClient.get<AttendanceSummary>("/attendance/summary", {
      params: { userId },
    });
  },
};
