import { apiClient } from "@/shared/services/api";
import { queryKeys } from "@/shared/services/api/queryKeys";
import { AttendanceRequestRuleItem } from "@/shared/services/attendanceRequestService";
import { StaffUser, userService } from "@/shared/services/userService";
import { formatDateYMD } from "@/shared/utils/formatters";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

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
 * Attendance Request Report Data Hook (TanStack Query Server Caching + Backend 70% Aggregations)
 */
export function useAttendanceRequestReportData(
  reportMode: ReportMode,
  reportType: ReportType,
  selectedDate: Date,
  selectedStaffId?: string | null,
) {
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);
  const [activeStaffId, setActiveStaffId] = useState<string | null>(
    selectedStaffId || null,
  );

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

  const dateParam = useMemo(() => formatDateYMD(selectedDate), [selectedDate]);
  const targetId = activeStaffId || selectedStaffId || currentUser?.id || "";

  const query = useQuery({
    queryKey: queryKeys.reports.list({
      kind: "requests",
      mode: reportMode,
      type: reportType,
      date: dateParam,
      staffId: targetId,
    }),
    queryFn: async () => {
      const u = await userService.get();
      const userSys =
        u?.details?.company_id ||
        u?.details?.companyId ||
        u?.company_id ||
        u?.companyId ||
        u?.system_id ||
        u?.systemId ||
        "";
      const matchComp = userSys.match(/^(system-\d+)/i);
      const companyParam = matchComp ? matchComp[1].toLowerCase() : "";

      const res = await apiClient.get<{
        records: AttendanceRequestRuleItem[];
        summary: RequestSummary;
        staffList: StaffUser[];
        targetStaffId: string | null;
      }>(
        `/reports/requests?mode=${reportMode}&type=${reportType}&date=${dateParam}&staffId=${targetId}&currentUserId=${u?.system_id || u?.id || ""}&companyId=${companyParam}`,
      );

      return res || null;
    },
    staleTime: 1000 * 60 * 3, // 3 minutes fresh cache
    gcTime: 1000 * 60 * 30, // 30 minutes in memory
  });

  const records = query.data?.records || [];
  const summary = query.data?.summary || {
    totalRequests: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
  };
  const staffList = query.data?.staffList || [];

  const selectedStaff = useMemo(() => {
    return (
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
      null
    );
  }, [staffList, activeStaffId, currentUser, reportMode]);

  return {
    loading: query.isLoading && !query.data,
    records,
    summary,
    staffList,
    selectedStaff,
    activeStaffId,
    setActiveStaffId,
    refetch: query.refetch,
  };
}
