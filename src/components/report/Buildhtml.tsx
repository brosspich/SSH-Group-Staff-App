import {
  formatCurrency,
  formatOrderId,
  type OrderRow,
  type Summary,
} from "@/hooks/useReportData";

import { type ReportPaperSettings } from "@/app/create/custom_report_paper";

function formatGeneratedAt(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";

  hours = hours % 12;
  hours = hours ? hours : 12;
  const hh = String(hours).padStart(2, "0");

  return `${dd}/${mm}/${yyyy} ${hh}:${minutes}:${seconds} ${ampm}`;
}

export function buildHtml(
  periodLabel: string,
  summary: Summary,
  orders: OrderRow[],
  title: string,
  settings?: ReportPaperSettings,
) {
  const companyName = settings?.companyName ?? "SSH Group";
  const logoUri = settings?.logoUri ?? null;

  const rows = orders
    .map((o) => {
      const isRiel = o.currency === "riel";
      const usdCell = isRiel ? "-" : formatCurrency(o.total_amount);
      const khrCell = isRiel ? `${o.total_amount.toLocaleString()} ៛` : "-";

      return `
    <tr>
      <td style="white-space: nowrap;">${formatOrderId(o.id)}</td>
      <td>${o.product_names.join(", ") || "-"}</td>
      <td style="text-align: center;">${o.item_count}</td>
      <td style="text-align: center;">${o.payment === "cash" ? "Cash" : "KHQR"}</td>
      <td style="text-align: right;">${usdCell}</td>
      <td style="text-align: right;">${khrCell}</td>
    </tr>`;
    })
    .join("");

  const logoHtml = logoUri
    ? `<img src="${logoUri}" style="width:48px;height:48px;object-fit:contain;border-radius:6px;background-color:#ffffff;" />`
    : `<div></div>`;

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
  @page {
    size: auto;
    margin: 12mm 10mm 12mm 10mm;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { 
    font-family: Arial, sans-serif; 
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
    margin-bottom: 20px;
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .header-titles h1 {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 2px;
  }
  .header-titles .subtitle {
    font-size: 12px;
    color: #666;
  }
  .header-right {
    text-align: right;
    font-size: 11px;
    color: #aaa;
  }

  .divider { border: none; border-top: 1.5px solid #e8e8e8; margin-bottom: 20px; }

  .summary-grid { 
    display: grid; 
    grid-template-columns: repeat(4, 1fr); 
    gap: 12px; 
    margin-bottom: 24px; 
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .summary-card { border: 1px solid #e0e0e0; border-radius: 6px; padding: 12px; }
  .summary-card .label { font-size: 11px; color: #888; margin-bottom: 4px; }
  .summary-card .value { font-size: 14px; font-weight: 700; }
  .summary-card .sub { font-size: 14px; font-weight: 700; margin-top: 2px; }

  table { 
    width: 100%; 
    border-collapse: collapse; 
    border: 1px solid #c0c0c0; 
    page-break-inside: auto;
  }
  tr { 
    page-break-inside: avoid; 
    break-inside: avoid; 
  }
  th, td { border: 1px solid #d4d4d4; padding: 8px 10px; font-size: 11px; }
  thead { display: table-header-group; }
  thead th { 
    background: #f2f2f2 !important; 
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    text-align: center !important; 
    font-weight: bold; 
    color: #333; 
    border: 1px solid #c0c0c0; 
  }
  tbody td { padding: 8px 10px; border: 1px solid #d4d4d4; font-size: 11px; }
  tfoot { display: table-row-group; page-break-inside: avoid; break-inside: avoid; }
  tfoot td { padding: 10px; font-weight: 700; border-top: 2px solid #a0a0a0; border-bottom: 1px solid #c0c0c0; background: #f9f9f9 !important; white-space: nowrap; }
  .footer { margin-top: 32px; font-size: 10px; color: #aaa; text-align: center; page-break-inside: avoid; break-inside: avoid; }
</style></head>
<body>

  <div class="header">
    <div class="header-left">
      ${logoHtml}
      <div class="header-titles">
        <h1>${companyName} — ${title} Sales Report</h1>
        <div class="subtitle">Period: ${periodLabel}</div>
      </div>
    </div>
    <div class="header-right">
      Generated at ${formatGeneratedAt(new Date())}
    </div>
  </div>

  <hr class="divider" />

  <div class="summary-grid">
    <div class="summary-card"><div class="label">Total orders</div><div class="value">${summary.totalOrders}</div></div>
    <div class="summary-card"><div class="label">Total Revenue</div><div class="value">${formatCurrency(summary.totalUSD)}</div><div class="sub">${summary.totalKHR.toLocaleString()} ៛</div></div>
    <div class="summary-card"><div class="label">Cash</div><div class="value">${formatCurrency(summary.cashUSD)}</div><div class="sub">${summary.cashKHR.toLocaleString()} ៛</div></div>
    <div class="summary-card"><div class="label">KHQR</div><div class="value">${formatCurrency(summary.khqrUSD)}</div><div class="sub">${summary.khqrKHR.toLocaleString()} ៛</div></div>
  </div>

  <table>
    <thead><tr><th style="width: 15%;">Order ID</th><th>Products</th><th style="width: 8%;">Items</th><th style="width: 12%;">Payment</th><th style="width: 12%;">USD</th><th style="width: 12%;">KHR</th></tr></thead>
    <tbody>${rows || `<tr><td colspan="6" style="text-align:center;padding:24px;color:#aaa;">No orders in this period</td></tr>`}</tbody>
<tfoot><tr><td colspan="4">Total</td><td style="text-align:right">${formatCurrency(summary.totalUSD)}</td><td style="text-align:right">${summary.totalKHR.toLocaleString()} ៛</td></tr></tfoot>  </table>

  <div class="footer">${companyName} POS · ${periodLabel}</div>

</body></html>`;
}
