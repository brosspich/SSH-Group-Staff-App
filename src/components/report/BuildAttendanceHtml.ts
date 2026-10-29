import { AttendanceRecord } from "@/app/(tabs)/attendance";
import {
  AttendanceSummary,
  ReportMode,
  ReportType,
} from "@/hooks/useAttendanceReportData";
import { StaffUser } from "@/services/userService";
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
