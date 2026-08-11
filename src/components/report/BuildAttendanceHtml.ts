import { AttendanceRecord } from "@/app/(tabs)/attendance";
import { COMPANY_NAME } from "@/constants/attendanceConfig";
import {
  AttendanceSummary,
  ReportMode,
  ReportType,
} from "@/hooks/useAttendanceReportData";
import { StaffUser } from "@/services/userService";

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

export function buildAttendanceHtml(
  periodLabel: string,
  summary: AttendanceSummary,
  records: AttendanceRecord[],
  reportType: ReportType,
  reportMode: ReportMode,
  targetStaff?: StaffUser | null,
): string {
  const companyName = COMPANY_NAME || "SSH Group";

  const rows = records
    .map((r, index) => {
      const typeBadgeBg =
        r.type === "time-in"
          ? "#dcfce7"
          : r.type === "time-out"
            ? "#dbeafe"
            : "#f3e8ff";
      const typeBadgeColor =
        r.type === "time-in"
          ? "#15803d"
          : r.type === "time-out"
            ? "#1d4ed8"
            : "#7e22ce";

      return `
    <tr>
      <td style="text-align: center; font-weight: 600;">${index + 1}</td>
      <td style="white-space: nowrap; font-weight: 600;">${r.staff_id}</td>
      <td style="font-weight: bold;">${r.name || "-"}</td>
      <td style="text-align: center; white-space: nowrap;">${r.date}</td>
      <td style="text-align: center; white-space: nowrap;">${r.time}</td>
      <td style="text-align: center;">
        <span style="background-color: ${typeBadgeBg}; color: ${typeBadgeColor}; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; text-transform: uppercase;">
          ${r.type}
        </span>
      </td>
      <td style="font-size: 10px; color: #555;">${r.qr_data || "-"}</td>
    </tr>`;
    })
    .join("");

  const reportTitle =
    reportMode === "individual"
      ? `Staff Attendance Report — ${targetStaff?.name || "Staff"}`
      : reportMode === "current"
        ? `Current Staff Attendance Report — ${targetStaff?.name || "Current Staff"}`
        : `All Staff Attendance Report`;

  const staffDetailInfo =
    (reportMode === "individual" || reportMode === "current") && targetStaff
      ? `<div style="margin-bottom: 15px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 6px; font-size: 11px;">
          <strong>Staff Name:</strong> ${targetStaff.name || "-"} &nbsp;|&nbsp; 
          <strong>Staff ID:</strong> ${targetStaff.id || "-"} &nbsp;|&nbsp; 
          <strong>Position:</strong> ${targetStaff.position || "Staff Member"} &nbsp;|&nbsp;
          <strong>Username:</strong> ${targetStaff.username || "-"}
        </div>`
      : "";

  const modeLabel =
    reportMode === "individual"
      ? `Staff: ${targetStaff?.name || "Individual Staff"}`
      : reportMode === "current"
        ? `Staff: ${targetStaff?.name || "Current Staff"}`
        : "All Staff";

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
      margin: 0;
    }
    @media print {
      @page {
        margin: 0;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, Arial, sans-serif; 
      font-size: 12px; 
      color: #1a1a1a; 
      background-color: #ffffff;
      margin: 0;
      padding: 12mm 10mm;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ── Header ── */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
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
      margin-bottom: 2px;
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

    .divider { border: none; border-top: 1.5px solid #e2e8f0; margin-bottom: 16px; }

    /* Summary cards */
    .summary-grid { 
      display: grid; 
      grid-template-columns: repeat(4, 1fr); 
      gap: 10px; 
      margin-bottom: 16px; 
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .summary-card { 
      border: 1px solid #cbd5e1; 
      border-radius: 6px; 
      padding: 10px 12px; 
      background-color: #f8fafc;
    }
    .summary-card .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 4px; font-weight: 600; }
    .summary-card .value { font-size: 16px; font-weight: 700; color: #0f172a; }

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
    tfoot td { padding: 8px 10px; font-weight: 700; border-top: 2px solid #94a3b8; background: #f8fafc !important; }

    .footer { margin-top: 24px; font-size: 10px; color: #94a3b8; text-align: center; page-break-inside: avoid; break-inside: avoid; }
  </style>
</head>
<body>

  <div class="header">
    <div class="header-left">
      <div class="header-titles">
        <h1>${companyName} — ${reportType} Attendance Report</h1>
        <div class="subtitle">Period: ${periodLabel} (${modeLabel})</div>
      </div>
    </div>
    <div class="header-right">
      Generated at ${formatGeneratedAt(new Date())}
    </div>
  </div>

  <hr class="divider" />

  ${staffDetailInfo}

  <div class="summary-grid">
    <div class="summary-card">
      <div class="label">Total Logs</div>
      <div class="value">${summary.totalLogs}</div>
    </div>
    <div class="summary-card">
      <div class="label">Time-In</div>
      <div class="value" style="color: #15803d;">${summary.timeInCount}</div>
    </div>
    <div class="summary-card">
      <div class="label">Time-Out</div>
      <div class="value" style="color: #1d4ed8;">${summary.timeOutCount}</div>
    </div>
    <div class="summary-card">
      <div class="label">Other</div>
      <div class="value" style="color: #7e22ce;">${summary.timeOtherCount}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 5%;">#</th>
        <th style="width: 12%;">Staff ID</th>
        <th>Staff Name</th>
        <th style="width: 14%;">Date</th>
        <th style="width: 14%;">Time</th>
        <th style="width: 14%;">Type</th>
        <th style="width: 25%;">QR Data / Location</th>
      </tr>
    </thead>
    <tbody>
      ${rows || `<tr><td colspan="7" style="text-align:center;padding:20px;color:#94a3b8;">No attendance records found for this period.</td></tr>`}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="5">Total Attendance Records</td>
        <td colspan="2" style="text-align: right; color: #0f172a;">${summary.totalLogs} Record(s)</td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">${companyName} Staff Management System · ${periodLabel}</div>

</body>
</html>`;
}
