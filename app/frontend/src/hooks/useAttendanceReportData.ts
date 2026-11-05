import { AttendanceRecord, formatDateYMD } from "@/app/(tabs)/attendance";
import { apiClient } from "@/services/api";
import { StaffUser, userService } from "@/services/userService";
import { useCallback, useEffect, useState } from "react";

export type ReportType = "Daily" | "Weekly" | "Monthly" | "Annual";
export type ReportMode = "individual" | "all" | "current";

export interface AttendanceSummary {
  totalLogs: number;
  totalStaff: number;
  timeInCount: number;
  timeOutCount: number;
  timeOtherCount: number;
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
 * Attendance Report Data Hook (Thin Client 30% UI -> Backend 70% Conditions & Calculations)
 */
export function useAttendanceReportData(
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
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary>({
    totalLogs: 0,
    totalStaff: 0,
    timeInCount: 0,
    timeOutCount: 0,
    timeOtherCount: 0,
  });

  const selectedDateMs = selectedDate ? selectedDate.getTime() : 0;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const curDate = new Date(selectedDateMs);
    try {
      const currentUser = await userService.get();
      const targetId =
        activeStaffId ||
        selectedStaffId ||
        (reportMode === "current" ? currentUser?.id : "");
      const dateParam = formatDateYMD(curDate);

      // Backend 70%: Performs all date filtering, aggregations, and summaries on the server!
      const res = await apiClient.get<{
        records: AttendanceRecord[];
        summary: AttendanceSummary;
        staffList: StaffUser[];
        targetStaffId: string | null;
      }>(
        `/reports/attendance?mode=${reportMode}&type=${reportType}&date=${dateParam}&staffId=${targetId || ""}&currentUserId=${currentUser?.id || ""}`,
      );

      if (res) {
        setRecords(res.records || []);
        setSummary(
          res.summary || {
            totalLogs: 0,
            totalStaff: 0,
            timeInCount: 0,
            timeOutCount: 0,
            timeOtherCount: 0,
          },
        );
        setStaffList(res.staffList || []);
        if (res.targetStaffId && res.targetStaffId !== activeStaffId) {
          setActiveStaffId(res.targetStaffId);
        }
      }
    } catch (err) {
      console.error("Error fetching attendance report from backend:", err);
    } finally {
      setLoading(false);
    }
  }, [reportMode, reportType, selectedDateMs, activeStaffId, selectedStaffId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectedStaff = staffList.find((s) => s.id === activeStaffId) || null;

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
