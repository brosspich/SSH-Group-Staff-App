import { getCompanyName } from "@/constants/attendanceConfig";
import {
  ReportMode,
  ReportType,
  RequestSummary,
} from "@/hooks/useAttendanceRequestReportData";
import { AttendanceRequestRuleItem } from "@/services/attendanceRequestService";
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

export function buildTotalRequestHtml(
  periodLabel: string,
  summary: RequestSummary,
  records: AttendanceRequestRuleItem[],
  reportType: ReportType,
  reportMode: ReportMode,
  targetStaff?: StaffUser | null,
): string {
  const staffSystemId =
    targetStaff?.system_id ||
    targetStaff?.id ||
    (records.length > 0
      ? (records[0] as any).systemId ||
        (records[0] as any).system_id ||
        records[0].staff_id
      : undefined);
  const companyName = getCompanyName(staffSystemId);

  // Sort records by date/from_date ascending, then id
  const sortedRecords = [...records].sort((a, b) => {
    const dateA = a.from_date || a.date || "";
    const dateB = b.from_date || b.date || "";
    if (dateA && dateB && dateA !== dateB) {
      return dateA.localeCompare(dateB);
    }
    const idA = a.id != null ? String(a.id) : "";
    const idB = b.id != null ? String(b.id) : "";
    if (idA && idB) {
      return idA.localeCompare(idB, undefined, { numeric: true });
    }
    const timeA = a.created_at || a.date || "";
    const timeB = b.created_at || b.date || "";
    return String(timeA).localeCompare(String(timeB));
  });

  const rowsHtml = sortedRecords
    .map((r, index) => {
      const status = (r.status || "pending").toLowerCase();
      const isApproved = status === "approved";
      const isRejected = status === "rejected";

      const badgeBg = isApproved
        ? "#dcfce7"
        : isRejected
          ? "#fedbdb"
          : "#fef3c7";
      const badgeColor = isApproved
        ? "#16a34a"
        : isRejected
          ? "#ff0000"
          : "#d97706";

      const subject = r.subject || "-";
      const remark = r.remark || "-";

      let dateLine = "-";
      let timeLine = "";

      if (r.from_date && r.to_date) {
        if (r.from_date === r.to_date) {
          dateLine = r.from_date;
        } else {
          dateLine = `${r.from_date} to ${r.to_date}`;
        }
      } else if (r.date) {
        dateLine = r.date;
      }

      if (r.from_time && r.to_time) {
        timeLine = `${r.from_time} to ${r.to_time}`;
      } else if (r.from_time) {
        timeLine = r.from_time;
      } else if (r.time) {
        timeLine = r.time;
      }

      return `
    <tr>
      <td style="text-align: center; font-weight: 600;">${index + 1}</td>
      <td style="font-weight: 600; color: #0f172a; word-break: break-word;">${subject}</td>
      <td style="text-align: center; white-space: nowrap;">
        <div style="font-weight: 600; color: #0f172a;">${dateLine}</div>
        ${timeLine ? `<div style="font-size: 10px; color: #64748b; margin-top: 2px;">${timeLine}</div>` : ""}
      </td>
      <td style="color: #334155; word-break: break-word;">${remark}</td>
      <td style="text-align: center;">
        <span style="background-color: ${badgeBg}; color: ${badgeColor}; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; text-transform: uppercase;">
          ${status.toUpperCase()}
        </span>
      </td>
    </tr>`;
    })
    .join("");

  const titlePrefix = reportType ? `${reportType} ` : "";
  const reportTitle = `${companyName} — ${titlePrefix}Request Total Report`;

  // Staff info block
  const staffId =
    targetStaff?.id ||
    targetStaff?.staff_id ||
    (records.length > 0 ? records[0].staff_id : "-");
  const staffName =
    targetStaff?.name || (records.length > 0 ? records[0].name : "-");
  const position =
    targetStaff?.position ||
    (records.length > 0 ? records[0].position : "Staff Member") ||
    "Staff Member";
  const username = targetStaff?.username || "-";

  const uniqueStaff = new Set(
    records.map((r) => r.staff_id).filter((id) => id && id !== "-"),
  );

  const staffDetailInfo =
    reportMode === "all" && !targetStaff && uniqueStaff.size > 1
      ? `<div style="margin-bottom: 16px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 14px; border-radius: 6px; font-size: 11px; color: #1e293b;">
          <strong>Report Scope :</strong> All Staff (${uniqueStaff.size} Staff Members)
        </div>`
      : `<div style="margin-bottom: 16px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 14px; border-radius: 6px; font-size: 11px; color: #1e293b;">
          <strong>Staff id :</strong> ${staffId} &nbsp;&nbsp;|&nbsp;&nbsp; 
          <strong>Staff Name :</strong> ${staffName} &nbsp;&nbsp;|&nbsp;&nbsp; 
          <strong>Position :</strong> ${position} &nbsp;&nbsp;|&nbsp;&nbsp; 
          <strong>Username :</strong> ${username}
        </div>`;

  const totalCount = summary?.totalRequests ?? records.length;

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
      <tr>
        <th style="width: 6%;">#</th>
        <th style="width: 28%;">Subject</th>
        <th style="width: 28%;">Date</th>
        <th>Remark</th>
        <th style="width: 12%;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${
        rowsHtml ||
        `<tr><td colspan="5" style="text-align:center;padding:20px;color:#94a3b8;">No request records found for this period.</td></tr>`
      }
    </tbody>
    <tfoot>
      <tr>
        <td colspan="4" style="text-align: left; font-weight: 700; font-size: 12px; color: #0f172a;">
          Total Attendance Request
        </td>
        <td style="text-align: center; font-weight: 700; font-size: 12px; color: #0f172a; white-space: nowrap;">
          ${totalCount} Request
        </td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">${companyName} Staff Management System · ${periodLabel}</div>

</body>
</html>`;
}
