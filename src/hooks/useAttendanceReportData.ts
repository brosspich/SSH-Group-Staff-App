import { AttendanceRecord, formatDateYMD } from "@/app/(tabs)/attendance";
import { StaffUser, userService } from "@/services/userService";
import { supabase } from "@/utils/supabase";
import { useCallback, useEffect, useState } from "react";

export type ReportType = "Daily" | "Weekly" | "Monthly" | "Annual";
export type ReportMode = "individual" | "all";

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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch current local user as default if activeStaffId is null
      const currentUser = await userService.get();

      // 2. Fetch all staff users from Supabase
      const { data: dbUsers, error } = await supabase
        .from("ssh_group_staff_users")
        .select("*");

      let users: StaffUser[] = dbUsers || [];
      if (users.length === 0 && currentUser) {
        users = [currentUser];
      }
      setStaffList(users);

      // Determine target staff ID for individual mode
      let targetId = activeStaffId || selectedStaffId;
      if (!targetId && currentUser?.id) {
        targetId = currentUser.id;
      }
      if (!targetId && users.length > 0) {
        targetId = users[0].id;
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
          // Normalize record staff_id if missing
          const recordStaffId = rec.staff_id || u.id;
          const recordStaffName = rec.name || u.name || "Unknown";
          const fullRecord: AttendanceRecord = {
            ...rec,
            staff_id: recordStaffId,
            name: recordStaffName,
          };
          allLogs.push(fullRecord);
        });
      });

      // Filter by reportMode (Individual vs All)
      if (reportMode === "individual" && targetId) {
        allLogs = allLogs.filter((r) => r.staff_id === targetId);
      }

      // 4. Date filtering based on reportType
      let filteredLogs: AttendanceRecord[] = [];

      const startYMD = formatDateYMD(selectedDate);
      const startYear = selectedDate.getFullYear();
      const startMonthStr = `${startYear}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}`;

      if (reportType === "Daily") {
        filteredLogs = allLogs.filter((r) => r.date === startYMD);
      } else if (reportType === "Weekly") {
        const startTime = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
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

      // Sort newest first
      filteredLogs.sort((a, b) => {
        const timeA = a.timestamp || `${a.date} ${a.time}`;
        const timeB = b.timestamp || `${b.date} ${b.time}`;
        return timeB.localeCompare(timeA);
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
  }, [reportMode, reportType, selectedDate, activeStaffId, selectedStaffId]);

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
