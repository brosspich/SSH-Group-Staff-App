import {
  DEFAULT_SETTINGS,
  STORAGE_KEY as RECEIPT_SETTINGS_KEY,
  ReceiptSettings,
} from "@/app/create/custom_receipt";
import { OrderData } from "@/components/sale/types";
import {
  disconnectBleGatt,
  ensureBleGattConnected,
  writeBleGattChunked,
} from "@/hooks/useBLEScanner";
import { compileImageForEzpl, compileImageForZpl } from "@/utils/imageCompiler";
import { buildReceiptHtml } from "@/utils/receiptHtmlBuilder";
import { BLEPrinter, NetPrinter, USBPrinter } from "@/utils/thermalPrinter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import * as Print from "expo-print";
import { useCallback, useEffect, useRef, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface DiscoveredPrinter {
  target: string;
  deviceName: string;
  connectionType: "bluetooth" | "usb" | "wifi" | "ble";
  ip?: string;
  port?: number;
  vendorId?: string;
  productId?: string;
  // "escpos" = anything that speaks raster GS v 0 (Xprinter, most 57/80mm
  // thermal receipt printers). "ezpl"/"zpl" = GoDEX/Zebra label printers.
  // This only controls which raw bytes wrap the image — there is no more
  // text-layout logic per protocol, both are HTML → PNG → raster bytes.
  printerProtocol?: "escpos" | "ezpl" | "zpl";
  serviceUUID?: string;
  characteristicUUID?: string;
  writeWithResponse?: boolean;
  mtu?: number;
}

// ── Timeout guard ──────────────────────────────────────────────────────────────
/**
 * Wraps a promise so it always settles within `ms`, even if the underlying
 * native call (Print.printToFileAsync, PDF→raster conversion, BLE/USB/WiFi
 * writes) never resolves or rejects on its own.
 *
 * Without this, a hung native call means the `await` in the caller never
 * returns — so the surrounding try/finally never runs, `isPrinting` and
 * `printLockRef` stay stuck `true` forever, and the UI shows an infinite
 * spinner with no way to retry. This turns that into a normal error the
 * person can see and retry from.
 *
 * NOTE: this does not (and cannot) cancel the underlying native operation —
 * it may still complete in the background after we've moved on. That's
 * harmless here since nothing awaits its result once we've timed out.
 */
const withTimeout = <T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new Error(
          `${label} timed out after ${Math.round(ms / 1000)}s. Please try again.`,
        ),
      );
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });

const PRINT_RENDER_TIMEOUT_MS = 20000; // HTML → PDF → raster image
const PRINT_SEND_TIMEOUT_MS = 15000; // raw bytes → BLE/USB/WiFi transport

// ── Storage helpers ────────────────────────────────────────────────────────────

export const PRINTER_STORAGE_KEYS = {
  bluetooth: "selected_printer_bluetooth",
  ble: "selected_printer_ble",
  usb: "selected_printer_usb",
  wifi: "selected_printer_wifi",
  legacy: "selected_printer",
} as const;

export const loadAnySavedPrinter = async () => {
  for (const key of Object.values(PRINTER_STORAGE_KEYS)) {
    const raw = await AsyncStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  }
  return null;
};

export const clearAllSavedPrinters = async () => {
  await Promise.all(
    Object.values(PRINTER_STORAGE_KEYS).map((key) =>
      AsyncStorage.removeItem(key),
    ),
  );
};

export const loadReceiptSettings = async (): Promise<ReceiptSettings> => {
  try {
    const raw = await AsyncStorage.getItem(RECEIPT_SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.warn("[usePrinter] Could not load receipt settings:", e);
  }
  return DEFAULT_SETTINGS;
};

const DUMMY_ORDER: OrderData = {
  id: "test-001",
  total: 12.5,
  invoiceNumber: "INV-TEST-001",
  paymentMethod: "cash" as const,
  customer: { id: "1", name: "Test Customer", phone: "012345678", email: "" },
  items: [
    {
      product: {
        id: "p1",
        name: "Product A",
        price: 5.0,
        category_id: "",
        artwork: "",
      },
      quantity: 2,
    },
    {
      product: {
        id: "p2",
        name: "Product B",
        price: 2.5,
        category_id: "",
        artwork: "",
      },
      quantity: 1,
    },
    {
      product: {
        id: "p3",
        name: "ផលិតផល ៣",
        price: 3.0,
        category_id: "",
        artwork: "",
      },
      quantity: 1,
    },
  ],
};

// ── Raster wrapping — hardware command bytes only, no layout logic ───────────

const ESC_INIT = Buffer.from([0x1b, 0x40]); // ESC @ — initialize
const ESC_CUT = Buffer.from([0x1d, 0x56, 0x42, 0x00]); // GS V B 0 — full cut

const GODEX_PRINT_WIDTH_80MM = 576;
const GODEX_PRINT_WIDTH_57MM = 384;
const GODEX_DPI = 203;
const GODEX_DOTS_PER_MM = GODEX_DPI / 25.4;
const dotsToMm = (dots: number): number => Math.ceil(dots / GODEX_DOTS_PER_MM);

const detectGodex = (name?: string): boolean => {
  if (!name) return false;
  const n = name.toLowerCase();
  return (
    n.includes("godex") ||
    n.includes("mx") ||
    n.includes("gd") ||
    n.includes("192.168.1.206")
  );
};

const getPrintWidthDots = (
  deviceName: string | undefined,
  paperSize: ReceiptSettings["paperSize"],
): number => (paperSize === "57mm" ? 384 : 576);

const buildEscposImageBuffer = (
  binHex: string,
  widthBytes: number,
  height: number,
): Buffer => {
  const imgData = Buffer.from(binHex, "hex");
  if (imgData.length !== widthBytes * height) {
    throw new Error(
      `Image data size mismatch: got ${imgData.length} bytes, expected ${widthBytes * height}`,
    );
  }
  const xL = widthBytes & 0xff;
  const xH = (widthBytes >> 8) & 0xff;
  const yL = height & 0xff;
  const yH = (height >> 8) & 0xff;
  // GS v 0 0 xL xH yL yH d1...dk — the ESC/POS raster-image command
  const header = Buffer.from([0x1d, 0x76, 0x30, 0x00, xL, xH, yL, yH]);
  return Buffer.concat([header, imgData]);
};

interface CompiledImageData {
  binary: Buffer;
  height: number;
  widthBytes: number;
  zplHex?: string;
  zplTotalBytes?: number;
  zplRowBytes?: number;
}

/** Builds the raw byte payload to hand a printer, given a receipt image or compiled data. */
const buildImagePayload = async (
  p: DiscoveredPrinter,
  imagePayload: string | CompiledImageData,
  settings: ReceiptSettings,
): Promise<Buffer> => {
  const isGodex = detectGodex(p.deviceName);
  const protocol = isGodex ? "zpl" : (p.printerProtocol ?? "escpos");
  const is57 = settings.paperSize === "57mm";

  let ezplData: CompiledImageData;
  let zplData: {
    hex: string;
    totalBytes: number;
    rowBytes: number;
    height: number;
  } | null = null;

  if (typeof imagePayload === "object" && "binary" in imagePayload) {
    ezplData = imagePayload;
    if (protocol === "zpl") {
      if (imagePayload.zplHex) {
        zplData = {
          hex: imagePayload.zplHex,
          totalBytes: imagePayload.zplTotalBytes!,
          rowBytes: imagePayload.zplRowBytes!,
          height: imagePayload.height,
        };
      } else {
        const hex = imagePayload.binary.toString("hex").toUpperCase();
        zplData = {
          hex,
          totalBytes: imagePayload.binary.length,
          rowBytes: imagePayload.widthBytes,
          height: imagePayload.height,
        };
      }
    }
  } else {
    // imagePayload is a file URI string
    if (protocol === "zpl") {
      const targetWidth = is57 ? 384 : 576;
      zplData = await compileImageForZpl(imagePayload, targetWidth);
      ezplData = {
        binary: Buffer.from(zplData.hex, "hex"),
        height: zplData.height,
        widthBytes: zplData.rowBytes,
      };
    } else if (protocol === "ezpl") {
      const targetWidth = is57
        ? GODEX_PRINT_WIDTH_57MM
        : GODEX_PRINT_WIDTH_80MM;
      ezplData = await compileImageForEzpl(imagePayload, targetWidth);
    } else {
      const printWidth = getPrintWidthDots(p.deviceName, settings.paperSize);
      ezplData = await compileImageForEzpl(imagePayload, printWidth);
    }
  }

  if (protocol === "ezpl") {
    const labelHeightMm = dotsToMm(ezplData.height + 30);
    const labelWidthMm = is57 ? 57 : 72;
    const header =
      `^Q${labelHeightMm},0\r\n^W${labelWidthMm}\r\n^H5\r\n^P1\r\n^S1\r\n^C1\r\n` +
      `^R0\r\n^SD5\r\n^O0\r\n^D0\r\n^E12\r\n^L\r\n^LR2\r\n` +
      `Q0,0,${ezplData.widthBytes},${ezplData.height}\r`;
    return Buffer.concat([
      Buffer.from(header, "binary"),
      ezplData.binary,
      Buffer.from("\r\nE\r\n", "binary"),
    ]);
  }

  if (protocol === "zpl") {
    // Zebra ZPL / GoDEX ZPL emulation
    const targetWidth = is57 ? 384 : 576;
    const zpl =
      `^XA\r\n^PW${targetWidth}\r\n^LL${zplData!.height + 30}\r\n` +
      `^FO0,0^GFA,${zplData!.totalBytes},${zplData!.totalBytes},${zplData!.rowBytes},${zplData!.hex}^FS\r\n` +
      `^XZ\r\n`;
    return Buffer.from(zpl, "utf-8");
  }

  // ESC/POS
  const imgBuffer = buildEscposImageBuffer(
    ezplData.binary.toString("hex"),
    ezplData.widthBytes,
    ezplData.height,
  );
  return Buffer.concat([ESC_INIT, imgBuffer, ESC_CUT]);
};

/**
 * Builds a minimal plain-text test payload for the given printer's native
 * command language — no HTML, no PDF, no image compiling. This exists so
 * "is the printer even reachable" can be answered in ~100ms instead of
 * waiting on the full HTML→PDF→PNG→raster pipeline.
 */
const buildRawTextPayload = (p: DiscoveredPrinter): Buffer => {
  const isGodex = detectGodex(p.deviceName);
  const protocol = isGodex ? "zpl" : (p.printerProtocol ?? "escpos");

  if (protocol === "ezpl") {
    const text =
      "^Q60,0\n^W72\n^H10\n^P1\n^S2\n^AD\n^C1\n^R0\n^SD12\n^O0\n^D0\n^E12\n^L\n" +
      "AA,10,10,1,1,0,0,==== Test Print ====\n" +
      "AA,10,40,1,1,0,0,This is test printing ......\n" +
      "AA,10,70,1,1,0,0,===============\n" +
      "E\n";
    return Buffer.from(text, "utf-8");
  }

  if (protocol === "zpl") {
    // Zebra ZPL / GoDEX ZPL emulation
    const zpl =
      "^XA\n^PW576\n^LL200\n^CI28\n" +
      "^FO0,20^FB576,1,0,C^A0N,28,28^FD==== Test Print ====^FS\n" +
      "^FO0,60^FB576,1,0,C^A0N,24,24^FDThis is test printing ......^FS\n" +
      "^FO0,100^FB576,1,0,C^A0N,24,24^FD===============^FS\n" +
      "^XZ\n";
    return Buffer.from(zpl, "utf-8");
  }

  // ESC/POS
  const text =
    "==== Test Print ====\n" +
    "This is test printing ......\n" +
    "===============\n\n\n";
  return Buffer.concat([ESC_INIT, Buffer.from(text, "utf-8"), ESC_CUT]);
};

// ── Transport — one shared sender for BLE / WiFi / USB / classic Bluetooth ───

const sendRawTcp = (
  ip: string,
  port: number,
  data: Buffer,
  timeoutMs = 5000,
): Promise<void> =>
  new Promise((resolve, reject) => {
    let settled = false;
    const finish = (err?: Error) => {
      if (settled) return;
      settled = true;
      err ? reject(err) : resolve();
    };
    const TcpSocketModule = require("react-native-tcp-socket");
    const TcpSocket = TcpSocketModule.default || TcpSocketModule;
    const client = TcpSocket.connect(
      { host: ip, port, timeout: timeoutMs },
      () => {
        client.write(data, undefined, (err?: Error) => {
          try {
            client.end();
          } catch (_) {}
          setTimeout(() => {
            try {
              client.destroy();
            } catch (_) {}
            finish(err);
          }, 100); // 1.5 seconds safety window to allow full buffer write + printing start
        });
      },
    );
    client.on("error", (e: Error) => {
      try {
        client.destroy();
      } catch (_) {}
      finish(e);
    });
    client.on("timeout", () => {
      try {
        client.destroy();
      } catch (_) {}
      finish(new Error("TCP connection timed out"));
    });
  });

const getPrinter = (connectionType: string): any => {
  if (connectionType === "usb") {
    if (!USBPrinter)
      throw new Error("USBPrinter not available on this platform");
    return USBPrinter;
  }
  if (connectionType === "wifi") {
    if (!NetPrinter) throw new Error("NetPrinter failed to load");
    return NetPrinter;
  }
  if (!BLEPrinter) throw new Error("BLEPrinter failed to load");
  return BLEPrinter;
};

let classicBleInitialized = false;
const ensureClassicBleInit = async (): Promise<void> => {
  if (classicBleInitialized) return;
  if (!BLEPrinter)
    throw new Error("BLEPrinter failed to load — check native module linking");
  await BLEPrinter.init();
  classicBleInitialized = true;
};

let usbInitialized = false;
const ensureUsbInit = async (): Promise<void> => {
  if (usbInitialized) return;
  if (!USBPrinter) throw new Error("USBPrinter not available on this platform");
  await USBPrinter.init();
  usbInitialized = true;
};

const connectPrinter = async (p: DiscoveredPrinter): Promise<void> => {
  if (p.target === "system_pdf") return;
  if (p.connectionType === "ble") {
    await ensureBleGattConnected(p.target);
    return;
  }
  if (p.connectionType === "usb") {
    if (!USBPrinter)
      throw new Error("USBPrinter not available on this platform");
    if (p.vendorId === undefined || p.productId === undefined)
      throw new Error("Missing USB vendor/product ID");
    await ensureUsbInit();
    await USBPrinter.connectPrinter(p.vendorId, p.productId);
  } else if (p.connectionType === "wifi") {
    if (!NetPrinter) throw new Error("NetPrinter failed to load");
    if (!p.ip || !p.port) throw new Error("Missing WiFi ip/port");
    await NetPrinter.connectPrinter(p.ip, p.port);
  } else {
    await ensureClassicBleInit();
    await BLEPrinter.connectPrinter(p.target);
  }
};

const closePrinter = async (
  connectionType: string,
  target?: string,
): Promise<void> => {
  if (target === "system_pdf") return;
  if (connectionType === "ble") {
    if (target) await disconnectBleGatt(target);
    return;
  }
  if (connectionType === "usb" || connectionType === "bluetooth") {
    // Note: On Android, USBPrinter and BLEPrinter printRawData write asynchronously in background Java thread.
    // Calling closeConn() immediately terminates the active socket/USB transfer before bytes finish writing.
    // Keep connection open; adapters manage connection lifecycle automatically.
    return;
  }
  if (connectionType === "wifi") await NetPrinter?.closeConn();
};

/** Sends one payload `copies` times to whichever transport the printer uses. */
const sendPayload = async (
  p: DiscoveredPrinter,
  payload: Buffer,
  copies: number,
): Promise<void> => {
  if (p.connectionType === "wifi") {
    if (!p.ip || !p.port) throw new Error("Missing IP/port for this printer.");
    for (let i = 0; i < copies; i++) {
      await sendRawTcp(p.ip, p.port, payload);
      if (i < copies - 1) {
        await new Promise((r) => setTimeout(r, 100));
      }
    }
    return;
  }

  if (p.connectionType === "ble") {
    if (!p.serviceUUID || !p.characteristicUUID) {
      throw new Error(
        "This BLE printer hasn't completed GATT setup — reconnect it in Settings → Printer.",
      );
    }
    await connectPrinter(p);
    try {
      for (let i = 0; i < copies; i++) {
        await writeBleGattChunked(
          p.target,
          p.serviceUUID,
          p.characteristicUUID,
          payload,
          !p.writeWithResponse,
          p.mtu,
        );
        if (i < copies - 1) {
          await new Promise((r) => setTimeout(r, 100));
        }
      }
    } finally {
      await closePrinter(p.connectionType, p.target);
    }
    return;
  }

  // USB / classic Bluetooth
  await connectPrinter(p);
  try {
    const printer = getPrinter(p.connectionType);
    const b64 = payload.toString("base64");
    for (let i = 0; i < copies; i++) {
      const printFn = printer.printRawData || printer.printRaw;
      if (typeof printFn !== "function") {
        throw new Error(
          `Printer module for connection type "${p.connectionType}" does not support raw printing.`,
        );
      }
      await printFn.call(printer, b64);
      if (i < copies - 1) {
        await new Promise((r) => setTimeout(r, 100));
      }
    }
    await new Promise((r) => setTimeout(r, 300));
  } finally {
    await closePrinter(p.connectionType, p.target);
  }
};

/** HTML → PNG receipt image, via expo-print + expo-pdf-to-image. */
const getEstimatedHeight = (
  order: OrderData,
  settings: ReceiptSettings,
): number => {
  const is57 = settings.paperSize === "57mm";
  const scale = is57 ? 384 / 162 : 576 / 227;

  const pxToPt = (px: number) => px / scale;

  // 1. Container padding top only (bottom is 0): 12px for 57mm, 16px for 80mm
  const containerPaddingPx = is57 ? 12 : 16;
  let h = pxToPt(containerPaddingPx);

  // 2. Logo height
  if (settings.logoUri) {
    const logoMaxHeightPx = is57 ? 120 : 130;
    h += pxToPt(logoMaxHeightPx + 8); // height + margin-bottom
  }

  // 3. Company Name
  const titleFontSizePx = is57 ? 15 : 24;
  h += pxToPt(titleFontSizePx + 12); // font-size + margin-bottom

  // 4. Info Lines (Tel, Email, Address)
  const lineFontSizePx = is57 ? 11 : 18;
  const infoLinePt = pxToPt(lineFontSizePx * 1.45 + 4); // font-size * line-height + margin
  if (settings.phone) h += infoLinePt;
  if (settings.email) h += infoLinePt;
  if (settings.address) h += infoLinePt;

  // 5. Divider (below info lines) — uses new thinner 57mm border
  const dividerBorderPx = is57 ? 1 : 3;
  const dividerPt = pxToPt(dividerBorderPx + 24); // margin-top(12)+margin-bottom(12)+border-width
  h += dividerPt;

  // 6. Meta Lines (Invoice, Customer, Date)
  h += 3 * infoLinePt;

  // 7. Divider 2 (above items table)
  h += dividerPt;

  // 8. Items Table Header
  if (settings.showProducts) {
    h += pxToPt(lineFontSizePx * 1.45 + 6); // header line-height + padding-bottom

    // 9. Items List (accounts for text wrapping)
    const charLimit = is57 ? 9 : 18;
    for (const item of order.items) {
      const nameLen = item.product.name.length;
      const lineCount = Math.ceil(nameLen / charLimit);
      h += lineCount * pxToPt(lineFontSizePx * 1.45 + 8); // line-height + row padding
    }

    // 10. Divider 3 (below items table)
    h += dividerPt;
  }

  // 11. Totals (Total USD and Total KHR)
  const totalFontSizePx = is57 ? 13 : 20;
  const totalLinePt = pxToPt(totalFontSizePx * 1.45 + 4);
  h += 2 * totalLinePt;

  // 12. Divider 4 (above QR code)
  h += dividerPt;

  // 13. QR Code
  if (settings.qrUri) {
    const qrSizePx = is57 ? 130 : 180;
    h += pxToPt(qrSizePx + 16); // qrSize + margin-top
  }

  // 14. Thank You Text
  if (settings.showThankYou) {
    h += pxToPt(totalFontSizePx * 1.45 + 16); // totalFontSize * line-height + margin-top(16px, matches CSS)
  }

  // 15. Safe printer output tail feed (space after Thank You text)
  h += pxToPt(40);

  // 16. Fixed footer safety pad — protects the QR/Thank You block from being
  // clipped if item-name wrapping (charLimit heuristic, esp. for Khmer glyphs
  // which render wider than the Latin-char assumption) under-counts lines.
  // 57mm gets a relatively bigger pad since it has less room to absorb error.
  h += is57 ? 60 : 40;

  return Math.ceil(h);
};

// ── Auto-crop trailing blank rows ─────────────────────────────────────────────
/**
 * Scans a 1bpp raster (MSB-first, 1 = printed dot) from the bottom up and
 * trims blank rows below the last row that actually has content. Lets the
 * PDF height estimate safely over-shoot without leaving blank paper at the
 * end of the receipt — works for ESC/POS, EZPL, and ZPL since they all
 * build from this same {binary, height, widthBytes} shape.
 */
const cropTrailingWhitespace = (
  binary: Buffer,
  widthBytes: number,
  height: number,
  bottomMarginPx = 20,
): { binary: Buffer; height: number } => {
  let lastContentRow = -1;
  for (let row = height - 1; row >= 0; row--) {
    const start = row * widthBytes;
    const rowBuf = binary.subarray(start, start + widthBytes);
    if (rowBuf.some((b) => b !== 0x00)) {
      lastContentRow = row;
      break;
    }
  }

  if (lastContentRow === -1) return { binary, height }; // nothing found, don't touch it

  const newHeight = Math.min(height, lastContentRow + 1 + bottomMarginPx);
  if (newHeight >= height) return { binary, height };

  return {
    binary: Buffer.from(binary.subarray(0, newHeight * widthBytes)),
    height: newHeight,
  };
};

const renderReceiptImage = async (
  order: OrderData,
  settings: ReceiptSettings,
  printWidth: number,
): Promise<CompiledImageData | string> => {
  const html = await buildReceiptHtml(order, settings);
  const is57 = settings.paperSize === "57mm";
  const widthPoints = is57 ? 384 : 576;
  const scale = is57 ? 384 / 162 : 576 / 227;

  const heightPoints =
    Math.ceil(getEstimatedHeight(order, settings) * scale * 1.25) + 200;

  console.log(
    `[usePrinter] printToFileAsync starting: widthPoints=${widthPoints} heightPoints=${heightPoints}`,
  );

  // Guarded with a timeout: on some Android devices, expo-print's hidden
  // WebView can get stuck after several prints in a row and never resolve —
  // without this, the await below hangs forever, the surrounding
  // try/finally in the caller never runs, and isPrinting/printLockRef stay
  // stuck true (the "infinite loading" symptom).
  const { uri: pdfUri } = await withTimeout(
    Print.printToFileAsync({
      html,
      width: widthPoints,
      height: heightPoints,
    }),
    PRINT_RENDER_TIMEOUT_MS,
    "Rendering receipt",
  );

  console.log(`[usePrinter] printToFileAsync done: pdfUri=${pdfUri}`);

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ExpoPdfToImage = require("expo-pdf-to-image");
  const module = ExpoPdfToImage?.default || ExpoPdfToImage;
  if (!module) {
    throw new Error("expo-pdf-to-image module not found");
  }

  if (typeof module.convertPdfToBinarizedBytes === "function") {
    try {
      console.log(
        `[usePrinter] using native convertPdfToBinarizedBytes with width=${printWidth}`,
      );
      const base64Bytes = await withTimeout<string>(
        module.convertPdfToBinarizedBytes(pdfUri, printWidth),
        PRINT_RENDER_TIMEOUT_MS,
        "Converting receipt to print image",
      );
      const binary = Buffer.from(base64Bytes, "base64");
      const widthBytes = Math.ceil(printWidth / 8);
      const rawHeight = Math.ceil(binary.length / widthBytes);
      const expectedLength = widthBytes * rawHeight;
      let paddedBinary = binary;
      if (binary.length < expectedLength) {
        paddedBinary = Buffer.concat([
          binary,
          Buffer.alloc(expectedLength - binary.length, 0),
        ]);
      }

      const cropped = cropTrailingWhitespace(
        paddedBinary,
        widthBytes,
        rawHeight,
        120,
      );

      return {
        binary: cropped.binary,
        height: cropped.height,
        widthBytes,
      };
    } catch (err) {
      console.warn(
        "[usePrinter] native convertPdfToBinarizedBytes failed, falling back to image conversion:",
        err,
      );
    }
  }

  if (typeof module.convertPdfToImages !== "function") {
    throw new Error(
      "Direct thermal printing requires the PDF-to-Image native module. Run 'npx expo run:android' or 'npx expo run:ios' to compile it.",
    );
  }

  const images = await withTimeout<string[]>(
    module.convertPdfToImages(pdfUri),
    PRINT_RENDER_TIMEOUT_MS,
    "Converting receipt to image",
  );
  if (!images || images.length === 0)
    throw new Error("Failed to render PDF to image.");

  let uri = images[0];
  if (
    !uri.startsWith("file://") &&
    !uri.startsWith("data:") &&
    uri.startsWith("/")
  ) {
    uri = `file://${uri}`;
  }
  return uri;
};

export const getPrinterIcon = (
  printer: DiscoveredPrinter | null,
): "usb" | "bluetooth" | "wifi" => {
  if (printer?.connectionType === "usb") return "usb";
  if (printer?.connectionType === "wifi") return "wifi";
  return "bluetooth";
};

const requestBluetoothPermission = async (): Promise<boolean> => {
  if (Platform.OS !== "android" || Platform.Version < 31) return true;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

// ── Hook ───────────────────────────────────────────────────────────────────────

export const usePrinter = () => {
  const [selectedPrinter, setSelectedPrinterState] =
    useState<DiscoveredPrinter | null>(null);
  const [printers, setPrinters] = useState<DiscoveredPrinter[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertBody, setAlertBody] = useState("");

  const isMounted = useRef(true);
  const printLockRef = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    (async () => {
      try {
        for (const key of Object.values(PRINTER_STORAGE_KEYS)) {
          const raw = await AsyncStorage.getItem(key);
          if (raw && isMounted.current) {
            setSelectedPrinterState(JSON.parse(raw));
            return;
          }
        }
      } catch (e) {
        console.warn("[usePrinter] load saved printer failed:", e);
      }
    })();
    return () => {
      isMounted.current = false;
    };
  }, []);

  const refreshPrinters = useCallback(async () => {
    if (!BLEPrinter) {
      console.warn("[usePrinter] BLEPrinter not available on this platform");
      return;
    }
    if (isMounted.current) setIsDiscovering(true);
    try {
      const hasPermission = await requestBluetoothPermission();
      if (!hasPermission) {
        if (isMounted.current) {
          setAlertTitle("Bluetooth Permission Denied");
          setAlertBody(
            "Please grant Bluetooth permission in your device settings and try again.",
          );
          setAlertVisible(true);
        }
        return;
      }
      await ensureClassicBleInit();
      const list = await BLEPrinter.getDeviceList();
      const mapped: DiscoveredPrinter[] = (list as any[]).map((d) => ({
        target: d.inner_mac_address,
        deviceName: d.device_name,
        connectionType: "bluetooth" as const,
      }));
      if (isMounted.current) setPrinters(mapped);
    } catch (e: any) {
      console.warn("[usePrinter] refreshPrinters failed:", e?.message ?? e);
      if (isMounted.current) {
        setAlertTitle("Bluetooth Unavailable");
        setAlertBody("Please enable Bluetooth on your device and try again.");
        setAlertVisible(true);
      }
    } finally {
      if (isMounted.current) setIsDiscovering(false);
    }
  }, []);

  const setSelectedPrinter = useCallback(
    async (printer: DiscoveredPrinter | null) => {
      setSelectedPrinterState(printer);
      try {
        await clearAllSavedPrinters();
        if (printer) {
          const key =
            printer.connectionType === "usb"
              ? PRINTER_STORAGE_KEYS.usb
              : printer.connectionType === "wifi"
                ? PRINTER_STORAGE_KEYS.wifi
                : printer.connectionType === "ble"
                  ? PRINTER_STORAGE_KEYS.ble
                  : PRINTER_STORAGE_KEYS.bluetooth;
          await AsyncStorage.setItem(key, JSON.stringify(printer));
        }
      } catch (e) {
        console.warn("[usePrinter] persist selection failed:", e);
      }
    },
    [],
  );

  /** Fast reachability check — plain text only, no HTML/PDF/image pipeline. */
  const rawTextTest = useCallback(async (): Promise<void> => {
    if (!selectedPrinter) {
      setAlertTitle("No Printer");
      setAlertBody(
        "No saved printer found. Go to Settings → Printer to set one up.",
      );
      setAlertVisible(true);
      return;
    }
    try {
      const payload = buildRawTextPayload(selectedPrinter);
      await withTimeout(
        sendPayload(selectedPrinter, payload, 1),
        PRINT_SEND_TIMEOUT_MS,
        "Sending to printer",
      );
      setAlertTitle("Raw Test Sent");
      setAlertBody("If nothing printed, check paper and printer head.");
      setAlertVisible(true);
    } catch (e: any) {
      setAlertTitle("Test Error");
      setAlertBody(e?.message ?? "Could not reach printer.");
      setAlertVisible(true);
    }
  }, [selectedPrinter]);

  /** Full receipt test — renders the real HTML receipt template to an image. */
  const testPrint = useCallback(async (): Promise<void> => {
    if (!selectedPrinter) {
      setAlertTitle("No Printer");
      setAlertBody(
        "No saved printer found. Go to Settings → Printer to set one up.",
      );
      setAlertVisible(true);
      return;
    }
    try {
      const settings = await loadReceiptSettings();
      const printWidth = getPrintWidthDots(
        selectedPrinter.deviceName,
        settings.paperSize,
      );
      const imagePayload = await renderReceiptImage(
        DUMMY_ORDER,
        settings,
        printWidth,
      );
      const payload = await buildImagePayload(
        selectedPrinter,
        imagePayload,
        settings,
      );
      await withTimeout(
        sendPayload(selectedPrinter, payload, 1),
        PRINT_SEND_TIMEOUT_MS,
        "Sending to printer",
      );
      setAlertTitle("Test Sent");
      setAlertBody("If nothing printed, check paper and printer head.");
      setAlertVisible(true);
    } catch (e: any) {
      setAlertTitle("Test Error");
      setAlertBody(e?.message ?? "Could not reach printer.");
      setAlertVisible(true);
    }
  }, [selectedPrinter]);

  const printReceiptWithPrinter = useCallback(
    async (
      order: OrderData,
      overrideSettings?: ReceiptSettings,
      imageUri?: string, // optional override, e.g. a custom promo image
    ): Promise<boolean> => {
      if (printLockRef.current) return false;
      if (!selectedPrinter) {
        setAlertTitle("No Printer");
        setAlertBody(
          "No saved printer found. Go to Settings → Printer to set one up.",
        );
        setAlertVisible(true);
        return false;
      }

      printLockRef.current = true;
      if (isMounted.current) setIsPrinting(true);

      try {
        const settings = overrideSettings || (await loadReceiptSettings());
        const copies = Math.max(1, settings.copies ?? 1);
        const printWidth = getPrintWidthDots(
          selectedPrinter.deviceName,
          settings.paperSize,
        );

        const finalImagePayload =
          imageUri ?? (await renderReceiptImage(order, settings, printWidth));

        const payload = await buildImagePayload(
          selectedPrinter,
          finalImagePayload,
          settings,
        );
        await withTimeout(
          sendPayload(selectedPrinter, payload, copies),
          PRINT_SEND_TIMEOUT_MS,
          "Sending to printer",
        );

        return true;
      } catch (error: any) {
        setAlertTitle("Print Error");
        setAlertBody(
          error?.message ?? "Failed to print. Check printer connection.",
        );
        setAlertVisible(true);
        return false;
      } finally {
        if (isMounted.current) setIsPrinting(false);
        printLockRef.current = false;
      }
    },
    [selectedPrinter],
  );

  return {
    printers,
    selectedPrinter,
    setSelectedPrinter,
    isDiscovering,
    isPrinting,
    printReceipt: printReceiptWithPrinter,
    testPrint,
    rawTextTest,
    refreshPrinters,
    alertVisible,
    setAlertVisible,
    alertTitle,
    setAlertTitle,
    alertBody,
    setAlertBody,
  };
};
