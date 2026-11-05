import { prisma } from "../../infrastructure/database/prisma.js";
import {
  AttendanceReportResponse,
  AttendanceReportSummary,
  ReportMode,
  ReportType,
  RequestReportResponse,
  RequestReportSummary,
  StaffOptionDto,
} from "./reports.types.js";

function parseJsonField(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
      return [parsed];
    } catch {
      return [];
    }
  }
  return [];
}

function isLeaveRole(roleStr?: string | null): boolean {
  if (!roleStr) return false;
  const lower = roleStr.toLowerCase();
  return (
    lower.includes("leave") ||
    lower.includes("resigned") ||
    lower.includes("inactive")
  );
}

export class ReportsService {
  /**
   * Generates Attendance Reports with 100% server-side filtering, sorting, and aggregations.
   */
  async getAttendanceReport(params: {
    mode: ReportMode;
    type: ReportType;
    dateStr?: string;
    staffId?: string;
    companyId?: string;
    currentUserId?: string;
  }): Promise<AttendanceReportResponse> {
    const { mode, type, dateStr, staffId, companyId, currentUserId } = params;

    // 1. Fetch all users from DB
    const users = await prisma.user.findMany({
      where: companyId ? { companyId } : undefined,
      include: { attendanceLogs: true },
      orderBy: { id: "asc" },
    });

    const staffList: StaffOptionDto[] = users
      .filter((u) => !isLeaveRole(u.role))
      .map((u) => ({
        id: u.id,
        name: u.name || u.username,
        position: u.position,
        role: u.role,
        company_id: u.companyId,
      }));

    // 2. Determine target staff ID
    let targetStaffId = staffId || null;
    if (mode === "current" && currentUserId) {
      targetStaffId = currentUserId;
    }
    if (!targetStaffId && staffList.length > 0 && mode !== "all") {
      targetStaffId = staffList[0].id;
    }

    // 3. Extract and normalize attendance records
    let allLogs: any[] = [];
    const staffWithLogs = new Set<string>();

    for (const u of users) {
      // Priority 1: DB normalized attendanceLogs
      if (u.attendanceLogs && u.attendanceLogs.length > 0) {
        for (const log of u.attendanceLogs) {
          allLogs.push({
            id: log.id,
            staff_id: u.id,
            system_id: u.companyId || log.companyId,
            name: u.name || u.username,
            date: log.scanDate,
            time: log.scanTime,
            type: log.type.toLowerCase().replace("_", "-"),
            timestamp: log.createdAt.toISOString(),
            qr_data: log.qrData || "",
          });
        }
      } else {
        // Priority 2: JSON attendance column fallback
        const legacyLogs = parseJsonField((u as any).attendance);
        for (const rec of legacyLogs) {
          if (!rec || typeof rec !== "object") continue;
          allLogs.push({
            id: rec.id || "",
            staff_id: rec.staff_id != null ? String(rec.staff_id) : u.id,
            system_id: rec.system_id || u.companyId,
            name: rec.name || u.name || u.username,
            date:
              rec.date ||
              rec.scanDate ||
              (rec.timestamp ? rec.timestamp.split("T")[0] : ""),
            time:
              rec.time ||
              rec.scanTime ||
              (rec.timestamp ? rec.timestamp.split("T")[1]?.slice(0, 8) : ""),
            type: String(rec.type || "time-other").toLowerCase(),
            timestamp: rec.timestamp || "",
            qr_data: rec.qr_data || "",
          });
        }
      }
    }

    // 4. Mode Filtering (Condition: target staff)
    if ((mode === "individual" || mode === "current") && targetStaffId) {
      allLogs = allLogs.filter((r) => r.staff_id === targetStaffId);
    }

    // 5. Date Filtering (Conditions: Daily, Weekly, Monthly, Annual)
    const baseDate = dateStr ? new Date(dateStr) : new Date();
    const y = baseDate.getFullYear();
    const m = String(baseDate.getMonth() + 1).padStart(2, "0");
    const d = String(baseDate.getDate()).padStart(2, "0");

    const dailyYmd = `${y}-${m}-${d}`;
    const monthlyYm = `${y}-${m}`;
    const annualY = `${y}`;

    let filteredLogs: any[] = [];

    if (type === "Daily") {
      filteredLogs = allLogs.filter((r) => r.date === dailyYmd);
    } else if (type === "Weekly") {
      const startTime = new Date(
        y,
        baseDate.getMonth(),
        baseDate.getDate(),
        0,
        0,
        0,
        0,
      ).getTime();
      const endTime = startTime + 7 * 24 * 60 * 60 * 1000;
      filteredLogs = allLogs.filter((r) => {
        if (!r.date) return false;
        const [yr, mo, dy] = r.date.split("-").map(Number);
        const rTime = new Date(yr, mo - 1, dy).getTime();
        return rTime >= startTime && rTime < endTime;
      });
    } else if (type === "Monthly") {
      filteredLogs = allLogs.filter(
        (r) => r.date && r.date.startsWith(monthlyYm),
      );
    } else if (type === "Annual") {
      filteredLogs = allLogs.filter(
        (r) => r.date && r.date.startsWith(annualY),
      );
    }

    // 6. Sort records
    filteredLogs.sort((a, b) => {
      const idA = a.id != null ? String(a.id) : "";
      const idB = b.id != null ? String(b.id) : "";
      if (idA && idB) {
        return idA.localeCompare(idB, undefined, { numeric: true });
      }
      return String(a.timestamp || "").localeCompare(String(b.timestamp || ""));
    });

    filteredLogs.forEach((r) => staffWithLogs.add(r.staff_id));

    // 7. Aggregation Summary (Calculated on server)
    const summary: AttendanceReportSummary = {
      totalLogs: filteredLogs.length,
      totalStaff:
        mode === "individual" ? 1 : staffWithLogs.size || users.length,
      timeInCount: filteredLogs.filter((r) => r.type === "time-in").length,
      timeOutCount: filteredLogs.filter((r) => r.type === "time-out").length,
      timeOtherCount: filteredLogs.filter((r) => r.type === "time-other")
        .length,
    };

    return {
      records: filteredLogs,
      summary,
      staffList,
      targetStaffId,
    };
  }

  /**
   * Generates Attendance Request Reports with 100% server-side filtering, sorting, and aggregations.
   */
  async getRequestReport(params: {
    mode: ReportMode;
    type: ReportType;
    dateStr?: string;
    staffId?: string;
    companyId?: string;
    currentUserId?: string;
  }): Promise<RequestReportResponse> {
    const { mode, type, dateStr, staffId, companyId, currentUserId } = params;

    const users = await prisma.user.findMany({
      where: companyId ? { companyId } : undefined,
      include: { attendanceRequests: true },
      orderBy: { id: "asc" },
    });

    const staffList: StaffOptionDto[] = users
      .filter((u) => !isLeaveRole(u.role))
      .map((u) => ({
        id: u.id,
        name: u.name || u.username,
        position: u.position,
        role: u.role,
        company_id: u.companyId,
      }));

    let targetStaffId = staffId || null;
    if (mode === "current" && currentUserId) {
      targetStaffId = currentUserId;
    }
    if (!targetStaffId && staffList.length > 0 && mode !== "all") {
      targetStaffId = staffList[0].id;
    }

    let allRequests: any[] = [];

    for (const u of users) {
      if (u.attendanceRequests && u.attendanceRequests.length > 0) {
        for (const req of u.attendanceRequests) {
          const fromDate =
            req.fromDate || req.createdAt.toISOString().split("T")[0];
          const toDate = req.toDate || fromDate;
          allRequests.push({
            id: req.id,
            staff_id: u.id,
            name: u.name || u.username,
            position: u.position || "Staff",
            date: fromDate,
            time: req.fromTime || "08:00 AM",
            from_date: fromDate,
            from_time: req.fromTime || "08:00 AM",
            to_date: toDate,
            to_time: req.toTime || "05:00 PM",
            subject: req.subject,
            remark: req.remark || "",
            status: req.status.toLowerCase(),
            created_at: req.createdAt.toISOString(),
          });
        }
      } else {
        const legacyReqs = parseJsonField((u as any).request_attendance_rules);
        for (const r of legacyReqs) {
          if (!r || typeof r !== "object") continue;
          allRequests.push({
            id: r.id || "",
            staff_id: r.staff_id != null ? String(r.staff_id) : u.id,
            name: r.name || u.name || u.username,
            position: r.position || u.position || "Staff",
            date: r.date || r.from_date || "",
            time: r.time || r.from_time || "",
            from_date: r.from_date || r.date || "",
            from_time: r.from_time || r.time || "",
            to_date: r.to_date || r.from_date || "",
            to_time: r.to_time || r.from_time || "",
            subject: r.subject || "",
            remark: r.remark || "",
            status: String(r.status || "pending").toLowerCase(),
            created_at: r.created_at || "",
          });
        }
      }
    }

    if ((mode === "individual" || mode === "current") && targetStaffId) {
      allRequests = allRequests.filter((r) => r.staff_id === targetStaffId);
    }

    const baseDate = dateStr ? new Date(dateStr) : new Date();
    const y = baseDate.getFullYear();
    const m = String(baseDate.getMonth() + 1).padStart(2, "0");
    const d = String(baseDate.getDate()).padStart(2, "0");

    const dailyYmd = `${y}-${m}-${d}`;
    const monthlyYm = `${y}-${m}`;
    const annualY = `${y}`;

    let filteredRequests: any[] = [];

    if (type === "Daily") {
      filteredRequests = allRequests.filter(
        (r) => r.date === dailyYmd || r.from_date === dailyYmd,
      );
    } else if (type === "Weekly") {
      const startTime = new Date(
        y,
        baseDate.getMonth(),
        baseDate.getDate(),
        0,
        0,
        0,
        0,
      ).getTime();
      const endTime = startTime + 7 * 24 * 60 * 60 * 1000;
      filteredRequests = allRequests.filter((r) => {
        const dateToCheck = r.date || r.from_date;
        if (!dateToCheck) return false;
        const [yr, mo, dy] = dateToCheck.split("-").map(Number);
        const rTime = new Date(yr, mo - 1, dy).getTime();
        return rTime >= startTime && rTime < endTime;
      });
    } else if (type === "Monthly") {
      filteredRequests = allRequests.filter(
        (r) =>
          (r.date && r.date.startsWith(monthlyYm)) ||
          (r.from_date && r.from_date.startsWith(monthlyYm)),
      );
    } else if (type === "Annual") {
      filteredRequests = allRequests.filter(
        (r) =>
          (r.date && r.date.startsWith(annualY)) ||
          (r.from_date && r.from_date.startsWith(annualY)),
      );
    }

    filteredRequests.sort((a, b) => {
      const idA = a.id != null ? String(a.id) : "";
      const idB = b.id != null ? String(b.id) : "";
      return idA.localeCompare(idB, undefined, { numeric: true });
    });

    const summary: RequestReportSummary = {
      totalRequests: filteredRequests.length,
      pendingCount: filteredRequests.filter((r) => r.status === "pending")
        .length,
      approvedCount: filteredRequests.filter((r) => r.status === "approved")
        .length,
      rejectedCount: filteredRequests.filter((r) => r.status === "rejected")
        .length,
    };

    return {
      records: filteredRequests,
      summary,
      staffList,
      targetStaffId,
    };
  }
}

export const reportsService = new ReportsService();
