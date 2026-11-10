import { apiClient } from "@/shared/services/api";
import { AttendanceRequestRuleItem } from "@/shared/services/attendanceRequestService";
import { StaffUser, userService } from "@/shared/services/userService";
import { formatDateYMD } from "@/shared/utils/formatters";
import { useCallback, useEffect, useState } from "react";

export type ReportType = "Daily" | "Weekly" | "Monthly" | "Annual";
export type ReportMode = "individual" | "all" | "current";

export interface RequestSummary {
  totalRequests: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

export function getTodayPP(): Date {
  return new Date();
}

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = MONTHS_SHORT[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export function getWeekRange(offsetWeeks: number = 0): {
  start: Date;
  end: Date;
} {
  const now = new Date();
  const y = now.getFullYear();
  const mo = now.getMonth();
  const d = now.getDate() + offsetWeeks * 7;
  const dow = now.getDay();
  const start = new Date(y, mo, d - dow, 0, 0, 0, 0);
  const end = new Date(y, mo, d - dow + 7, 0, 0, 0, 0);
  return { start, end };
}

export function formatDateLabel(date: Date, reportType: ReportType): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  if (reportType === "Daily") {
    return `${y}-${m}-${d}`;
  } else if (reportType === "Weekly") {
    const endDate = new Date(date.getTime() + 6 * 24 * 60 * 60 * 1000);
    const ey = endDate.getFullYear();
    const em = String(endDate.getMonth() + 1).padStart(2, "0");
    const ed = String(endDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d} to ${ey}-${em}-${ed}`;
  } else if (reportType === "Monthly") {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${monthNames[date.getMonth()]} ${y}`;
  } else {
    return `${y}`;
  }
}

/**
 * Attendance Request Report Data Hook (Thin Client 30% UI -> Backend 70% Conditions & Calculations)
 */
export function useAttendanceRequestReportData(
  reportMode: ReportMode,
  reportType: ReportType,
  selectedDate: Date,
  selectedStaffId?: string | null,
) {
  const [loading, setLoading] = useState<boolean>(true);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [activeStaffId, setActiveStaffId] = useState<string | null>(
    selectedStaffId || null,
  );

  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);

  useEffect(() => {
    userService.get().then((u) => {
      if (u) {
        setCurrentUser(u);
        if (!selectedStaffId) {
          setActiveStaffId((prev) => prev || u.id);
        }
      }
    });
  }, [selectedStaffId]);
  const [records, setRecords] = useState<AttendanceRequestRuleItem[]>([]);
  const [summary, setSummary] = useState<RequestSummary>({
    totalRequests: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
  });

  const selectedDateMs = selectedDate ? selectedDate.getTime() : 0;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const curDate = new Date(selectedDateMs);
    try {
      const currentUser = await userService.get();
      const userSys =
        currentUser?.details?.company_id ||
        currentUser?.details?.companyId ||
        currentUser?.company_id ||
        currentUser?.companyId ||
        currentUser?.system_id ||
        currentUser?.systemId ||
        "";
      const matchComp = userSys.match(/^(system-\d+)/i);
      const companyParam = matchComp ? matchComp[1].toLowerCase() : "";

      const targetId =
        activeStaffId || selectedStaffId || currentUser?.id || "";
      const dateParam = formatDateYMD(curDate);

      // Backend 70%: Performs all date filtering, request status aggregations, and summaries on the server!
      const res = await apiClient.get<{
        records: AttendanceRequestRuleItem[];
        summary: RequestSummary;
        staffList: StaffUser[];
        targetStaffId: string | null;
      }>(
        `/reports/requests?mode=${reportMode}&type=${reportType}&date=${dateParam}&staffId=${targetId || ""}&currentUserId=${currentUser?.system_id || currentUser?.id || ""}&companyId=${companyParam}`,
      );

      if (res) {
        setRecords(res.records || []);
        setSummary(
          res.summary || {
            totalRequests: 0,
            pendingCount: 0,
            approvedCount: 0,
            rejectedCount: 0,
          },
        );
        setStaffList(res.staffList || []);
        if (res.targetStaffId && res.targetStaffId !== activeStaffId) {
          setActiveStaffId(res.targetStaffId);
        }
      }
    } catch (err) {
      console.error("Error fetching request report from backend:", err);
    } finally {
      setLoading(false);
    }
  }, [reportMode, reportType, selectedDateMs, activeStaffId, selectedStaffId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectedStaff =
    staffList.find(
      (s) =>
        s.id === activeStaffId ||
        (s as any).system_id === activeStaffId ||
        (s as any).systemId === activeStaffId,
    ) ||
    staffList.find(
      (s) =>
        s.id === currentUser?.id ||
        (s as any).system_id === currentUser?.system_id,
    ) ||
    (reportMode === "current" ? currentUser : null) ||
    staffList[0] ||
    null;

  return {
    loading,
    records,
    summary,
    staffList,
    selectedStaff,
    activeStaffId,
    setActiveStaffId,
    refetch: fetchData,
  };
}
