import {
  ReportMode,
  ReportType,
  RequestSummary,
} from "@/shared/hooks/useAttendanceRequestReportData";
import { AttendanceRequestRuleItem } from "@/shared/services/attendanceRequestService";
import { StaffUser } from "@/shared/services/userService";
import { buildTotalRequestHtml } from "./BuildTotalRequestHtml";

export { buildTotalRequestHtml } from "./BuildTotalRequestHtml";

export function buildRequestHtml(
  periodLabel: string,
  summary: RequestSummary,
  records: AttendanceRequestRuleItem[],
  reportType: ReportType,
  reportMode: ReportMode,
  targetStaff?: StaffUser | null,
): string {
  return buildTotalRequestHtml(
    periodLabel,
    summary,
    records,
    reportType,
    reportMode,
    targetStaff,
  );
}
