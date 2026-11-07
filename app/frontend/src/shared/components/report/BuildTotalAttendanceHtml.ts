import { AttendanceRecord } from "@/features/attendance/_types/attendance.types";
import { getCompanyName } from "@/shared/constants/attendanceConfig";
import {
  AttendanceSummary,
  ReportMode,
  ReportType,
} from "@/shared/hooks/useAttendanceReportData";
import { StaffUser } from "@/shared/services/userService";

function formatGeneratedAt(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;
  const hh = String(hours).padStart(2, "0");

  return `${dd}/${mm}/${yyyy} ${hh}:${minutes}:${seconds} ${ampm}`;
}

function parseRecordDateTime(rec: AttendanceRecord): Date | null {
  if (rec.timestamp) {
    const d = new Date(rec.timestamp);
    if (!isNaN(d.getTime())) return d;
  }
  if (rec.date && rec.time) {
    const d = new Date(`${rec.date} ${rec.time}`);
    if (!isNaN(d.getTime())) return d;
  }
  if (rec.time) {
    const match = rec.time.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const seconds = match[3] ? parseInt(match[3], 10) : 0;
      const ampm = match[4]?.toUpperCase();
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;

      const baseDate = rec.date ? new Date(`${rec.date}T00:00:00`) : new Date();
      if (!isNaN(baseDate.getTime())) {
        baseDate.setHours(hours, minutes, seconds, 0);
        return baseDate;
      }
    }
  }
  return null;
}

function formatDisplayTime(rec?: AttendanceRecord | null): string {
  if (!rec) return "-";
  const dt = parseRecordDateTime(rec);
  if (dt) {
    let hours = dt.getHours();
    const minutes = String(dt.getMinutes()).padStart(2, "0");
    const seconds = String(dt.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const hh = String(hours).padStart(2, "0");
    return `${hh}:${minutes}:${seconds} ${ampm}`;
  }
  if (rec.time) {
    const match = rec.time.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const mm = match[2];
      const ss = match[3] ? match[3].padStart(2, "0") : "00";
      const ampm = match[4]
        ? match[4].toUpperCase()
        : hours >= 12
          ? "PM"
          : "AM";
      hours = hours % 12 || 12;
      return `${String(hours).padStart(2, "0")}:${mm}:${ss} ${ampm}`;
    }
    return rec.time;
  }
  return "-";
}

interface DayAttendanceGroup {
  staffId: string;
  staffName: string;
  date: string;
  timeIn: string;
  timeOut: string;
  totalTime: string;
  diffSeconds: number;
  remark: string;
}

export function buildTotalAttendanceHtml(
  periodLabel: string,
  summary: AttendanceSummary,
  records: AttendanceRecord[],
  reportType: ReportType,
  reportMode: ReportMode,
  targetStaff?: StaffUser | null,
): string {
  const staffSystemId =
    targetStaff?.system_id ||
    targetStaff?.id ||
    (records.length > 0
      ? records[0].system_id || records[0].staff_id
      : undefined);
  const companyName = getCompanyName(staffSystemId);

  // Group records by staff_id and date
  const groups = new Map<string, AttendanceRecord[]>();

  for (const r of records) {
    const staffId = r.staff_id != null ? String(r.staff_id) : "-";
    const date = r.date || "-";
    const key = `${staffId}___${date}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(r);
  }

  const dayRows: DayAttendanceGroup[] = [];

  groups.forEach((groupRecords, key) => {
    const [staffId, date] = key.split("___");
    const staffName = groupRecords[0]?.name || targetStaff?.name || "-";

    // Sort chronologically within the day
    const sortedGroup = [...groupRecords].sort((a, b) => {
      const dtA = parseRecordDateTime(a)?.getTime() ?? 0;
      const dtB = parseRecordDateTime(b)?.getTime() ?? 0;
      return dtA - dtB;
    });

    // Find time-in (prefer type === 'time-in', else earliest)
    let inRec = sortedGroup.find((r) => r.type === "time-in");
    // Find time-out (prefer type === 'time-out', else latest)
    let outRec = [...sortedGroup].reverse().find((r) => r.type === "time-out");

    // Fallbacks if type is not specifically tagged
    if (!inRec && sortedGroup.length > 0) {
      if (sortedGroup[0].type !== "time-out") {
        inRec = sortedGroup[0];
      }
    }
    if (!outRec && sortedGroup.length > 1) {
      const last = sortedGroup[sortedGroup.length - 1];
      if (last !== inRec && last.type !== "time-in") {
        outRec = last;
      }
    }

    const timeInStr = inRec ? formatDisplayTime(inRec) : "-";
    const timeOutStr = outRec ? formatDisplayTime(outRec) : "-";

    let diffSeconds = 0;
    let totalTimeStr = "-";

    if (inRec && outRec && inRec !== outRec) {
      const inDate = parseRecordDateTime(inRec);
      const outDate = parseRecordDateTime(outRec);
      if (inDate && outDate) {
        const diffMs = outDate.getTime() - inDate.getTime();
        if (diffMs > 0) {
          diffSeconds = Math.round(diffMs / 1000);
          const h = Math.floor(diffSeconds / 3600);
          const m = Math.floor((diffSeconds % 3600) / 60);
          const s = diffSeconds % 60;
          totalTimeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        }
      }
    }

    const remark =
      inRec?.remark ||
      outRec?.remark ||
      groupRecords.find((r) => r.remark)?.remark ||
      "-";

    dayRows.push({
      staffId,
      staffName,
      date,
      timeIn: timeInStr,
      timeOut: timeOutStr,
      totalTime: totalTimeStr,
      diffSeconds,
      remark,
    });
  });

  // Sort dayRows by date ascending, then staffId
  dayRows.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.staffId.localeCompare(b.staffId, undefined, { numeric: true });
  });

  // Calculate grand total time work attendance: cumulative hours (e.g. 05H 14M 29S or 250H 30M 45S)
  const grandTotalSeconds = dayRows.reduce((sum, r) => sum + r.diffSeconds, 0);
  const totalHours = Math.floor(grandTotalSeconds / 3600);
  const remSeconds = grandTotalSeconds % 3600;
  const minutes = Math.floor(remSeconds / 60);
  const seconds = remSeconds % 60;

  const grandHoursStr = String(totalHours).padStart(2, "0");
  const grandMinsStr = String(minutes).padStart(2, "0");
  const grandSecsStr = String(seconds).padStart(2, "0");
  const grandTotalFormatted = `${grandHoursStr}H ${grandMinsStr}M ${grandSecsStr}S`;

  const isAllStaff = reportMode === "all";

  const rowsHtml = dayRows
    .map((row, index) => {
      if (!isAllStaff) {
        return `
    <tr>
      <td style="text-align: center; font-weight: 600;">${index + 1}</td>
      <td style="text-align: center; white-space: nowrap;">${row.date}</td>
      <td style="text-align: center; white-space: nowrap; font-weight: 600; color: #0022ff;">${row.timeIn}</td>
      <td style="text-align: center; white-space: nowrap; font-weight: 600; color: #ff0000;">${row.timeOut}</td>
      <td style="text-align: center; font-weight: 700; white-space: nowrap;">${row.totalTime}</td>
      <td style="text-align: center;">${row.remark || "-"}</td>
    </tr>`;
      }
      return `
    <tr>
      <td style="text-align: center; font-weight: 600;">${index + 1}</td>
      <td style="text-align: center; font-weight: 600; white-space: nowrap;">${row.staffId}</td>
      <td style="font-weight: 700;">${row.staffName}</td>
      <td style="text-align: center; white-space: nowrap;">${row.date}</td>
      <td style="text-align: center; white-space: nowrap; font-weight: 600; color: #0022ff;">${row.timeIn}</td>
      <td style="text-align: center; white-space: nowrap; font-weight: 600; color: #ff0000;">${row.timeOut}</td>
      <td style="text-align: center; font-weight: 700; white-space: nowrap;">${row.totalTime}</td>
      <td style="text-align: center;">${row.remark || "-"}</td>
    </tr>`;
    })
    .join("");

  const titlePrefix = reportType ? `${reportType} ` : "";
  const reportTitle = `${companyName} — ${titlePrefix}Attendance Total Report`;

  // Staff info block (only shown for current / individual staff reports)
  const staffId =
    targetStaff?.id ||
    targetStaff?.staff_id ||
    (records.length > 0 ? records[0].staff_id : "-");
  const staffName =
    targetStaff?.name || (records.length > 0 ? records[0].name : "-");
  const position = targetStaff?.position || "Staff Member";
  const username =
    targetStaff?.username ||
    (records.length > 0 ? (records[0] as any).username : "") ||
    (staffId !== "-" ? staffId : "-");

  const staffDetailInfo = !isAllStaff
    ? `
  <div style="margin-bottom: 16px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 14px; border-radius: 6px; font-size: 11px; color: #1e293b;">
    <strong>Staff id :</strong> ${staffId} &nbsp;&nbsp;|&nbsp;&nbsp; 
    <strong>Staff Name :</strong> ${staffName} &nbsp;&nbsp;|&nbsp;&nbsp; 
    <strong>Position :</strong> ${position} &nbsp;&nbsp;|&nbsp;&nbsp; 
    <strong>Username :</strong> ${username}
  </div>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${reportTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm;
    }
    @media print {
      html, body {
        width: 100%;
        margin: 0;
        padding: 0;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, Arial, sans-serif; 
      font-size: 12px; 
      color: #1a1a1a; 
      background-color: #ffffff;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ── Header ── */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .header-titles h1 {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 3px;
    }
    .header-titles .subtitle {
      font-size: 12px;
      color: #64748b;
    }
    .header-right {
      text-align: right;
      font-size: 11px;
      color: #94a3b8;
    }

    .divider { border: none; border-top: 1.5px solid #e2e8f0; margin-bottom: 14px; }

    /* Table */
    table { 
      width: 100%; 
      border-collapse: collapse; 
      border: 1px solid #cbd5e1; 
      page-break-inside: auto;
    }
    tr { 
      page-break-inside: avoid; 
      break-inside: avoid; 
    }
    th, td { border: 1px solid #e2e8f0; padding: 7px 9px; font-size: 11px; }
    thead { display: table-header-group; }
    thead th { 
      background: #f1f5f9 !important; 
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      text-align: center !important; 
      font-weight: bold; 
      color: #334155; 
      border: 1px solid #cbd5e1; 
    }
    tbody td { border: 1px solid #e2e8f0; font-size: 11px; }
    tfoot { display: table-row-group; page-break-inside: avoid; break-inside: avoid; }
    tfoot td { 
      padding: 9px 11px; 
      font-weight: 700; 
      border-top: 2px solid #94a3b8; 
      background: #f8fafc !important; 
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .footer { margin-top: 24px; font-size: 10px; color: #94a3b8; text-align: center; page-break-inside: avoid; break-inside: avoid; }
  </style>
</head>
<body>

  <div class="header">
    <div class="header-left">
      <div class="header-titles">
        <h1>${reportTitle}</h1>
        <div class="subtitle">Period: ${periodLabel}</div>
      </div>
    </div>
    <div class="header-right">
      Generated at ${formatGeneratedAt(new Date())}
    </div>
  </div>

  <hr class="divider" />

  ${staffDetailInfo}

  <table>
    <thead>
      ${
        !isAllStaff
          ? `
      <tr>
        <th style="width: 6%;">#</th>
        <th style="width: 17%;">Date</th>
        <th style="width: 17%;">Time In</th>
        <th style="width: 17%;">Time Out</th>
        <th style="width: 18%;">Total Time</th>
        <th style="width: 25%;">Remark</th>
      </tr>`
          : `
      <tr>
        <th style="width: 5%;">#</th>
        <th style="width: 11%;">Staff ID</th>
        <th>Staff Name</th>
        <th style="width: 13%;">Date</th>
        <th style="width: 15%;">Time In</th>
        <th style="width: 15%;">Time Out</th>
        <th style="width: 13%;">Total Time</th>
        <th style="width: 12%;">Remark</th>
      </tr>`
      }
    </thead>
    <tbody>
      ${
        rowsHtml ||
        `<tr><td colspan="${!isAllStaff ? 6 : 8}" style="text-align:center;padding:20px;color:#94a3b8;">No attendance records found for this period.</td></tr>`
      }
    </tbody>
    <tfoot>
      <tr>
        <td colspan="${!isAllStaff ? 4 : 6}" style="text-align: left; font-weight: 700; font-size: 12px; color: #0f172a;">
          Total Time Work Attendance
        </td>
        <td style="text-align: center; font-weight: 700; font-size: 12px; color: #0f172a; white-space: nowrap;">
          ${grandTotalFormatted}
        </td>
        <td style="text-align: center; color: #94a3b8;">-</td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">${companyName} Staff Management System · ${periodLabel}</div>

</body>
</html>`;
}
