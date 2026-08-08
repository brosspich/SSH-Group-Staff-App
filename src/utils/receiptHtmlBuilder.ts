import { ReceiptSettings } from "@/app/create/custom_receipt";
import { OrderData } from "@/components/sale/types";
import { Platform } from "react-native";

const KHR_RATE = 4100;
const fmtKHR = (usd: number) =>
  Math.round(usd * KHR_RATE).toLocaleString("en-US") + " KHR";

const readImageAsBase64 = async (
  uri: string | null,
): Promise<string | null> => {
  if (!uri) return null;
  if (uri.startsWith("data:")) return uri;

  if (Platform.OS === "web") {
    try {
      const res = await fetch(uri);
      const blob = await res.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn("[receiptHtmlBuilder] Web base64 fetch failed:", e);
      return uri;
    }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const FileSystem = require("expo-file-system/legacy");
    const raw = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const ext = uri.split(".").pop()?.toLowerCase() || "png";
    const mime = ext === "png" ? "image/png" : "image/jpeg";
    return `data:${mime};base64,${raw}`;
  } catch (e) {
    console.warn("[receiptHtmlBuilder] Failed to read image as base64:", e);
    return uri; // Fallback
  }
};

// Escapes text that gets interpolated into HTML so stray < > & in a product
// name, customer name, etc. can't break the markup.
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Pads a field label with non-breaking spaces so the colons line up in a
// monospace column, matching "Tel     :", "Email   :", "Address :" etc.
const padLabel = (label: string, width: number) =>
  label + "&nbsp;".repeat(Math.max(0, width - label.length));

export async function buildReceiptHtml(
  order: OrderData,
  settings: ReceiptSettings,
  pageHeight?: number,
  // When true, always use the native px/dot-based sizing (same numbers the
  // mobile app renders with) even if Platform.OS === "web". Used by
  // hooks/webPrint.ts, which rasterizes this HTML into a flat PNG before
  // printing — it wants the native layout to rasterize, not the mm-based
  // layout meant for direct (unrasterized) browser printing.
  forcePixelUnits?: boolean,
): Promise<string> {
  const paperSize = settings.paperSize;
  const is57 = paperSize === "57mm";
  const isAndroid = Platform.OS === "android";
  const isWeb = Platform.OS === "web" && !forcePixelUnits;

  // The base dot values below (11, 18, 15, 24, ...) are calibrated against
  // the 203dpi thermal raster (384/576 dots = 48mm/72mm printable width).
  // - Native (iOS/Android non-web): these are just canvas units — the HTML
  //   is rendered to a PDF at an explicit width/height, then rasterized to
  //   the exact target dot width, so proportions survive regardless of unit.
  // - Web (Chrome print dialog): px is real CSS px @96dpi, NOT thermal dots.
  //   Using "576px" literally is ~152mm wide on an 80mm(72mm-printable)
  //   paper — Chrome then silently scales the whole receipt down to fit,
  //   which is the "wrong paper size" bug. Convert to physical mm instead.
  const DOTS_PER_MM = 203 / 25.4;
  const toMm = (dots: number) => +(dots / DOTS_PER_MM).toFixed(3);
  const sizeUnit = isWeb ? "mm" : "px";

  // Web CSS millimeter calibrations for Chrome thermal print dialog
  const bodyFontSize = isWeb
    ? is57
      ? 2.5
      : 3.0
    : isAndroid
      ? is57
        ? Math.round(11 * (980 / 384))
        : Math.round(18 * (980 / 576))
      : is57
        ? 11
        : 18;

  const titleFontSize = isWeb
    ? is57
      ? 3.0
      : 3.6
    : isAndroid
      ? is57
        ? Math.round(15 * (980 / 384))
        : Math.round(24 * (980 / 576))
      : is57
        ? 15
        : 24;

  const lineFontSize = isWeb
    ? is57
      ? 2.5
      : 3.0
    : isAndroid
      ? is57
        ? Math.round(11 * (980 / 384))
        : Math.round(18 * (980 / 576))
      : is57
        ? 11
        : 18;

  const totalFontSize = isWeb
    ? is57
      ? 2.8
      : 3.4
    : isAndroid
      ? is57
        ? Math.round(13 * (980 / 384))
        : Math.round(20 * (980 / 576))
      : is57
        ? 13
        : 20;

  const logoWidth = isWeb
    ? is57
      ? 25
      : 36
    : isAndroid
      ? is57
        ? Math.round(160 * (980 / 384))
        : Math.round(240 * (980 / 576))
      : is57
        ? 160
        : 240;

  const logoMaxHeight = isWeb
    ? is57
      ? 18
      : 24
    : isAndroid
      ? is57
        ? Math.round(120 * (980 / 384))
        : Math.round(130 * (980 / 576))
      : is57
        ? 120
        : 130;

  const qtyColWidth = isWeb
    ? is57
      ? 10
      : 14
    : isAndroid
      ? is57
        ? Math.round(68 * (980 / 384))
        : Math.round(88 * (980 / 576))
      : is57
        ? 68
        : 88;

  const priceColWidth = isWeb
    ? is57
      ? 14
      : 18
    : isAndroid
      ? is57
        ? Math.round(88 * (980 / 384))
        : Math.round(110 * (980 / 576))
      : is57
        ? 88
        : 110;

  const qrSize = isWeb
    ? is57
      ? 22
      : 30
    : isAndroid
      ? is57
        ? Math.round(130 * (980 / 384))
        : Math.round(180 * (980 / 576))
      : is57
        ? 130
        : 180;

  const dividerBorder = isWeb
    ? is57
      ? 0.3
      : 0.5
    : isAndroid
      ? is57
        ? Math.round(1 * (980 / 384))
        : Math.round(3 * (980 / 576))
      : is57
        ? 1
        : 3;

  const containerPadding = isWeb
    ? is57
      ? 1.5
      : 2.5
    : isAndroid
      ? is57
        ? Math.round(2.5 * (980 / 384))
        : Math.round(5 * (980 / 576))
      : is57
        ? 2.5
        : 5;

  // Physical page width in mm (matches printable width: 72mm for 80mm roll, 48mm for 57mm roll)
  const pageWidthMm = is57 ? 48 : 72;

  const logoBase64 = await readImageAsBase64(settings.logoUri);
  const qrBase64 = await readImageAsBase64(settings.qrUri);

  const invoiceNumber = order.invoiceNumber || "#INV-00001";
  const customerName = order.customer?.name || "Walk-in Client";
  const dateStr =
    new Date().toLocaleDateString("en-GB") +
    ", " +
    new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const totalUSD = order.total.toFixed(2);
  const totalKHR = fmtKHR(order.total);

  const subtotalVal =
    order.subtotal ?? order.total + (order.discountAmount ?? 0);
  const discountHtml =
    order.discountAmount && order.discountAmount > 0
      ? `
      <div class="line">${padLabel("Subtotal", 8)}: $${subtotalVal.toFixed(2)} USD</div>
      <div class="line">${padLabel("Discount", 8)}: -$${order.discountAmount.toFixed(2)} USD (${order.discountPercent}%)</div>
      <div class="divider"></div>
      `
      : "";

  // ── Logo ──
  const logoHtml = logoBase64 ? `<img src="${logoBase64}" class="logo" />` : "";

  // ── Company info block — colon-aligned like the printed samples ──
  const labelWidth = 8; // "Address " is the longest label
  const infoLines = [
    settings.phone &&
      `<div class="line">${padLabel("Tel", labelWidth)}: ${esc(settings.phone)}</div>`,
    settings.email &&
      `<div class="line">${padLabel("Email", labelWidth)}: ${esc(settings.email)}</div>`,
    settings.address &&
      `<div class="line">${padLabel("Address", labelWidth)}: ${esc(settings.address)}</div>`,
  ]
    .filter(Boolean)
    .join("\n");

  const metaLabelWidth = 8; // "Customer" is the longest label
  const metaLines = [
    `<div class="line">${padLabel("Invoice", metaLabelWidth)}: ${esc(invoiceNumber)}</div>`,
    `<div class="line">${padLabel("Customer", metaLabelWidth)}: ${esc(customerName)}</div>`,
    `<div class="line">${padLabel("Date", metaLabelWidth)}: ${dateStr}</div>`,
  ].join("\n");

  // ── Items table ──
  let itemsHtml = "";
  if (settings.showProducts) {
    itemsHtml = `
      <table class="item-table">
        <thead>
          <tr>
            <th class="item-col">Item</th>
            <th class="qty-col">Qty</th>
            <th class="price-col">Price</th>
          </tr>
        </thead>
        <tbody>
          ${order.items
            .map((item) => {
              const lineTotal = item.product.price * item.quantity;
              const isRiel = item.product.currency === "riel";
              const priceFormatted = isRiel
                ? `${Math.round(lineTotal).toLocaleString("en-US")}៛`
                : `$${lineTotal.toFixed(2)}`;
              return `
            <tr>
              <td class="cell item-col">${esc(item.product.name)}</td>
              <td class="cell qty-col">x${item.quantity}</td>
              <td class="cell price-col">${priceFormatted}</td>
            </tr>
          `;
            })
            .join("")}
        </tbody>
      </table>
      <div class="divider"></div>
    `;
  }

  // ── QR ──
  const qrHtml = qrBase64 ? `<img src="${qrBase64}" class="qr" />` : "";

  // ── Thank you ──
  const thankYouHtml = settings.showThankYou
    ? `<div class="thank-you">${esc(settings.thankYouText || "Thank you!")}</div>`
    : "";

  const pageHeightCss = pageHeight
    ? isWeb
      ? toMm(pageHeight)
      : isAndroid
        ? Math.round(pageHeight * (980 / (is57 ? 384 : 576)))
        : pageHeight
    : undefined;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<style>
  @page {
    size: ${isWeb ? `${is57 ? 58 : 80}mm` : is57 ? "384px" : "576px"} ${pageHeightCss ? pageHeightCss + (isWeb ? "mm" : "px") : "auto"};
    margin: 0;
  }
  html, body {
    margin: 0 auto;
    padding: 0;
    width: ${isWeb ? `${pageWidthMm}mm` : isAndroid ? "100%" : is57 ? "384px" : "576px"};
    background-color: #ffffff;
    font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-size: ${bodyFontSize}${sizeUnit};
    line-height: 1.35;
    color: #000000;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .container {
    padding: ${containerPadding}${sizeUnit};
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  .logo {
    width: ${logoWidth}${sizeUnit};
    height: auto;
    max-height: ${logoMaxHeight}${sizeUnit};
    object-fit: contain;
    margin-bottom: 8px;
    display: block;
    background-color: #ffffff;
  }
  .company-name {
    font-weight: bold;
    font-size: ${titleFontSize}${sizeUnit};
    margin-bottom: 8px;
    text-align: center;
    letter-spacing: 0.5px;
  }
  .line {
    font-size: ${lineFontSize}${sizeUnit};
    width: 100%;
    text-align: left;
    white-space: pre;
    margin: 2px 0;
  }
  .divider {
    border-top: ${dividerBorder}${sizeUnit} solid #000000;
    width: 100%;
    margin: 6px 0;
  }
  .item-table {
    width: 100%;
    border-collapse: collapse;
    margin: 4px 0;
  }
  .item-table th {
    font-weight: bold;
    padding-bottom: 6px;
    font-size: ${lineFontSize}${sizeUnit};
  }
  .item-table td {
    padding: 4px 0;
    font-size: ${lineFontSize}${sizeUnit};
    vertical-align: top;
  }
  .item-col {
    text-align: left;
  }
  .qty-col {
    width: ${qtyColWidth}${sizeUnit};
    text-align: right;
    white-space: nowrap;
  }
  .price-col {
    width: ${priceColWidth}${sizeUnit};
    text-align: right;
    white-space: nowrap;
  }
  .total-line {
    font-weight: bold;
    font-size: ${totalFontSize}${sizeUnit};
    width: 100%;
    text-align: left;
    margin: 2px 0;
  }
  .qr {
    width: ${qrSize}${sizeUnit};
    height: ${qrSize}${sizeUnit};
    object-fit: contain;
    margin: 16px 0 0 0;
    display: block;
    background-color: #ffffff;
  }
  .thank-you {
    font-size: ${totalFontSize}${sizeUnit};
    margin-top: 16px;
    text-align: center;
  }
</style>
</head>
<body>
  <div class="container">
    ${logoHtml}
    <div class="company-name">${esc(settings.companyName || "COMPANY NAME")}</div>
    ${infoLines}

    <div class="divider"></div>

    ${metaLines}

    <div class="divider"></div>

    ${itemsHtml}

    ${discountHtml}
    <div class="total-line">Total : ${totalUSD} USD</div>
    <div class="total-line">Total : ${totalKHR}</div>

    <div class="divider"></div>

    ${qrHtml}
    ${thankYouHtml}
  </div>
</body>
</html>`;
}
