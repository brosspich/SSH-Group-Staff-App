export type ReportType = "Daily" | "Weekly" | "Monthly" | "Annual";
export type ReportMode = "individual" | "all" | "current";

export interface AttendanceReportSummary {
  totalLogs: number;
  totalStaff: number;
  timeInCount: number;
  timeOutCount: number;
  timeOtherCount: number;
}

export interface RequestReportSummary {
  totalRequests: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

export interface StaffOptionDto {
  id: string;
  name: string;
  username?: string | null;
  position?: string | null;
  role?: string | null;
  company_id?: string | null;
}

export interface AttendanceReportResponse {
  records: any[];
  summary: AttendanceReportSummary;
  staffList: StaffOptionDto[];
  targetStaffId: string | null;
}

export interface RequestReportResponse {
  records: any[];
  summary: RequestReportSummary;
  staffList: StaffOptionDto[];
  targetStaffId: string | null;
}
