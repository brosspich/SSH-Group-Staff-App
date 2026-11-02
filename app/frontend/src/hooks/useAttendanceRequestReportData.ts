import { formatDateYMD } from "@/app/(tabs)/attendance";
import { apiClient } from "@/services/api";
import { AttendanceRequestRuleItem } from "@/services/attendanceRequestService";
import { StaffUser, userService } from "@/services/userService";
import { isLeaveRole } from "@/utils/roleUtils";
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
      // 1. Fetch current local user
      const currentUser = await userService.get();

      // 2. Fetch all staff users from Backend API
      const dbUsers = await apiClient
        .get<StaffUser[]>("/users-query")
        .catch(() => []);

      let users: StaffUser[] = dbUsers || [];
      if (users.length === 0 && currentUser) {
        users = [currentUser];
      }

      users.sort((a, b) =>
        (a.id || "").localeCompare(b.id || "", undefined, { numeric: true }),
      );

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
      if (targetId !== activeStaffId) {
        setActiveStaffId(targetId || null);
      }

      // 3. Extract request_attendance_rules
      let allRequests: AttendanceRequestRuleItem[] = [];

      users.forEach((u) => {
        let userRules: AttendanceRequestRuleItem[] = [];
        if (Array.isArray(u.request_attendance_rules)) {
          userRules = u.request_attendance_rules;
        } else if (typeof u.request_attendance_rules === "string") {
          try {
            userRules = JSON.parse(u.request_attendance_rules);
          } catch {}
        }

        userRules.forEach((rule) => {
          if (!rule || typeof rule !== "object") return;
          const ruleStaffId =
            rule.staff_id != null ? String(rule.staff_id) : String(u.id || "");
          const ruleStaffName =
            rule.name != null ? String(rule.name) : String(u.name || "Unknown");
          const rulePosition =
            rule.position != null
              ? String(rule.position)
              : String(u.position || "Staff");

          allRequests.push({
            ...rule,
            staff_id: ruleStaffId,
            name: ruleStaffName,
            position: rulePosition,
            status: rule.status || "pending",
          });
        });
      });

      // Filter by reportMode
      if (
        (reportMode === "individual" || reportMode === "current") &&
        targetId
      ) {
        allRequests = allRequests.filter((r) => r.staff_id === targetId);
      }

      // 4. Date filtering based on reportType
      let filteredRequests: AttendanceRequestRuleItem[] = [];
      const startYMD = formatDateYMD(curDate);
      const startYear = curDate.getFullYear();
      const startMonthStr = `${startYear}-${String(curDate.getMonth() + 1).padStart(2, "0")}`;

      if (reportType === "Daily") {
        filteredRequests = allRequests.filter((r) => {
          const reqDate = r.date || r.from_date;
          if (reqDate === startYMD) return true;
          if (r.from_date && r.to_date) {
            return r.from_date <= startYMD && r.to_date >= startYMD;
          }
          return false;
        });
      } else if (reportType === "Weekly") {
        const startTime = new Date(
          curDate.getFullYear(),
          curDate.getMonth(),
          curDate.getDate(),
          0,
          0,
          0,
        ).getTime();
        const endTime = startTime + 7 * 24 * 60 * 60 * 1000;

        filteredRequests = allRequests.filter((r) => {
          const reqDate = r.date || r.from_date;
          if (!reqDate) return false;
          const [yr, mo, dy] = reqDate.split("-").map(Number);
          const rTime = new Date(yr, mo - 1, dy).getTime();
          return rTime >= startTime && rTime < endTime;
        });
      } else if (reportType === "Monthly") {
        filteredRequests = allRequests.filter((r) => {
          const reqDate = r.date || r.from_date;
          return reqDate && reqDate.startsWith(startMonthStr);
        });
      } else if (reportType === "Annual") {
        filteredRequests = allRequests.filter((r) => {
          const reqDate = r.date || r.from_date;
          return reqDate && reqDate.startsWith(`${startYear}`);
        });
      }

      // Sort by request id ascending (REQ-0000-0000-0001 -> REQ-...)
      filteredRequests.sort((a, b) => {
        const idA = a.id != null ? String(a.id) : "";
        const idB = b.id != null ? String(b.id) : "";
        if (idA && idB) {
          return idA.localeCompare(idB, undefined, { numeric: true });
        }
        if (idA) return -1;
        if (idB) return 1;
        const timeA = a.created_at || a.date;
        const timeB = b.created_at || b.date;
        return String(timeA).localeCompare(String(timeB));
      });

      // 5. Summary calculations
      let pendingCount = 0;
      let approvedCount = 0;
      let rejectedCount = 0;

      filteredRequests.forEach((r) => {
        const st = (r.status || "pending").toLowerCase();
        if (st === "approved") approvedCount++;
        else if (st === "rejected") rejectedCount++;
        else pendingCount++;
      });

      setRecords(filteredRequests);
      setSummary({
        totalRequests: filteredRequests.length,
        pendingCount,
        approvedCount,
        rejectedCount,
      });
    } catch (err) {
      console.warn("Error fetching attendance request report data:", err);
      setRecords([]);
      setSummary({
        totalRequests: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [reportMode, reportType, selectedDateMs, selectedStaffId, activeStaffId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectedStaff =
    staffList.find((s) => s.id === activeStaffId) ||
    staffList.find((s) => s.id === selectedStaffId) ||
    null;

  return {
    loading,
    summary,
    records,
    staffList,
    selectedStaff,
    activeStaffId,
    setActiveStaffId,
    refetch: fetchData,
  };
}
