import { AttendanceRecord, formatDateYMD } from "@/app/(tabs)/attendance";
import { apiClient } from "@/services/api";
import { StaffUser, userService } from "@/services/userService";
import { isLeaveRole } from "@/utils/roleUtils";
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
    // 7-day range starting from date
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
    // Annual
    return `${y}`;
  }
}

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
      // 1. Fetch current local user as default
      const currentUser = await userService.get();

      // 2. Fetch all staff users from Backend API
      const dbUsers = await apiClient
        .get<StaffUser[]>("/users-query")
        .catch(() => []);

      let users: StaffUser[] = dbUsers || [];
      if (users.length === 0 && currentUser) {
        users = [currentUser];
      }
      // Sort staff by id ascending (e.g. 0001, 0002, 0003...)
      users.sort((a, b) =>
        (a.id || "").localeCompare(b.id || "", undefined, { numeric: true }),
      );
      // Filter out staff on leave from selectable staff list
      const activeStaffUsers = users.filter((u) => !isLeaveRole(u.role));
      setStaffList(activeStaffUsers);

      // Determine target staff ID for individual / current mode
      let targetId = activeStaffId || selectedStaffId;
      if (reportMode === "current" && currentUser?.id) {
        targetId = currentUser.id;
      }
      if (!targetId && currentUser?.id && !isLeaveRole(currentUser.role)) {
        targetId = currentUser.id;
      }
      if (!targetId && activeStaffUsers.length > 0) {
        targetId = activeStaffUsers[0].id;
      }
      if (
        reportMode === "individual" &&
        targetId &&
        activeStaffUsers.length > 0 &&
        !activeStaffUsers.some((u) => u.id === targetId)
      ) {
        targetId = activeStaffUsers[0].id;
      }
      if (targetId !== activeStaffId) {
        setActiveStaffId(targetId || null);
      }

      // 3. Extract attendance records
      let allLogs: AttendanceRecord[] = [];
      const staffWithLogs = new Set<string>();

      users.forEach((u) => {
        let userLogs: AttendanceRecord[] = [];
        if (Array.isArray(u.attendance)) {
          userLogs = u.attendance;
        } else if (typeof u.attendance === "string") {
          try {
            userLogs = JSON.parse(u.attendance);
          } catch (e) {}
        }

        userLogs.forEach((rec) => {
          if (!rec || typeof rec !== "object") return;
          // Normalize record fields with full fallbacks
          const recordStaffId =
            rec.staff_id != null
              ? String(rec.staff_id)
              : String((rec as any).userId || u.id || "");
          const recordStaffName =
            rec.name != null ? String(rec.name) : String(u.name || "Unknown");
          const recordDate =
            rec.date ||
            (rec as any).scanDate ||
            (rec.timestamp ? rec.timestamp.split("T")[0] : "");
          const recordTime =
            rec.time ||
            (rec as any).scanTime ||
            (rec.timestamp ? rec.timestamp.split("T")[1]?.slice(0, 8) : "");

          const fullRecord: AttendanceRecord = {
            ...rec,
            date: recordDate,
            time: recordTime,
            staff_id: recordStaffId,
            name: recordStaffName,
          };
          allLogs.push(fullRecord);
        });
      });

      // Filter by reportMode (Individual vs Current vs All)
      if (
        (reportMode === "individual" || reportMode === "current") &&
        targetId
      ) {
        allLogs = allLogs.filter((r) => r.staff_id === targetId);
      }

      // 4. Date filtering based on reportType
      let filteredLogs: AttendanceRecord[] = [];

      const startYMD = formatDateYMD(curDate);
      const startYear = curDate.getFullYear();
      const startMonthStr = `${startYear}-${String(curDate.getMonth() + 1).padStart(2, "0")}`;

      if (reportType === "Daily") {
        filteredLogs = allLogs.filter((r) => r.date === startYMD);
      } else if (reportType === "Weekly") {
        const startTime = new Date(
          curDate.getFullYear(),
          curDate.getMonth(),
          curDate.getDate(),
          0,
          0,
          0,
        ).getTime();
        const endTime = startTime + 7 * 24 * 60 * 60 * 1000; // 7 days

        filteredLogs = allLogs.filter((r) => {
          if (!r.date) return false;
          const [yr, mo, dy] = r.date.split("-").map(Number);
          const rTime = new Date(yr, mo - 1, dy).getTime();
          return rTime >= startTime && rTime < endTime;
        });
      } else if (reportType === "Monthly") {
        filteredLogs = allLogs.filter(
          (r) => r.date && r.date.startsWith(startMonthStr),
        );
      } else if (reportType === "Annual") {
        filteredLogs = allLogs.filter(
          (r) => r.date && r.date.startsWith(`${startYear}`),
        );
      }

      // Sort follow by id ascending (att-0000-0000-0001 -> att-0000-0000-0062)
      filteredLogs.sort((a, b) => {
        const idA = a.id != null ? String(a.id) : "";
        const idB = b.id != null ? String(b.id) : "";
        if (idA && idB) {
          return idA.localeCompare(idB, undefined, { numeric: true });
        }
        if (idA) return -1;
        if (idB) return 1;
        const timeA = a.timestamp || `${a.date} ${a.time}`;
        const timeB = b.timestamp || `${b.date} ${b.time}`;
        return String(timeA).localeCompare(String(timeB));
      });

      setRecords(filteredLogs);

      filteredLogs.forEach((r) => staffWithLogs.add(r.staff_id));

      const timeInCount = filteredLogs.filter(
        (r) => r.type === "time-in",
      ).length;
      const timeOutCount = filteredLogs.filter(
        (r) => r.type === "time-out",
      ).length;
      const timeOtherCount = filteredLogs.filter(
        (r) => r.type === "time-other",
      ).length;

      setSummary({
        totalLogs: filteredLogs.length,
        totalStaff:
          reportMode === "individual" ? 1 : staffWithLogs.size || users.length,
        timeInCount,
        timeOutCount,
        timeOtherCount,
      });
    } catch (err) {
      console.error("Error fetching attendance report data:", err);
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
    staffList,
    selectedStaff,
    activeStaffId,
    setActiveStaffId,
    records,
    summary,
    refetch: fetchData,
  };
}
