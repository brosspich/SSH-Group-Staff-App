import { AttendanceRecord } from "@/features/attendance/_types/attendance.types";
import {
  AttendanceSummary,
  ReportMode,
  ReportType,
} from "@/shared/hooks/useAttendanceReportData";
import { StaffUser } from "@/shared/services/userService";
import { buildTotalAttendanceHtml } from "./BuildTotalAttendanceHtml";

export { buildTotalAttendanceHtml } from "./BuildTotalAttendanceHtml";

export function buildAttendanceHtml(
  periodLabel: string,
  summary: AttendanceSummary,
  records: AttendanceRecord[],
  reportType: ReportType,
  reportMode: ReportMode,
  targetStaff?: StaffUser | null,
): string {
  return buildTotalAttendanceHtml(
    periodLabel,
    summary,
    records,
    reportType,
    reportMode,
    targetStaff,
  );
}
