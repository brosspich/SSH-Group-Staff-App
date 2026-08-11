import type {
  FilePrintOptions,
  FilePrintResult,
  PrintOptions,
} from "expo-print/build/Print.types";

let activePrintLock = false;
let lockResetTimer: any = null;

const FILE_PRINT_TIMEOUT_MS = 60000; // 60s for PDF file rendering
const SYSTEM_PRINT_TIMEOUT_MS = 180000; // 3 minutes for native print dialog interaction

function getPrintModule(): any {
  try {
    return require("expo-print/build/Print");
  } catch (e) {
    console.warn("[printGuard] expo-print module unavailable:", e);
    return null;
  }
}

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`));
    }, ms);

    promise.then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

export function isNativePrintBusy(): boolean {
  return activePrintLock;
}

export function forceResetPrintLock(): void {
  activePrintLock = false;
  if (lockResetTimer) {
    clearTimeout(lockResetTimer);
    lockResetTimer = null;
  }
}

export async function safePrintAsync(
  options: PrintOptions,
): Promise<boolean> {
  if (activePrintLock) {
    console.warn(
      "[printGuard] safePrintAsync skipped: another print request is already in progress",
    );
    return false;
  }

  const printMod = getPrintModule();
  if (!printMod || typeof printMod.printAsync !== "function") {
    console.warn(
      "[printGuard] printAsync not supported in this build/environment",
    );
    return false;
  }

  activePrintLock = true;

  // Auto safety reset after timeout in case native print dialog hangs indefinitely
  if (lockResetTimer) clearTimeout(lockResetTimer);
  lockResetTimer = setTimeout(() => {
    activePrintLock = false;
  }, SYSTEM_PRINT_TIMEOUT_MS);

  try {
    await withTimeout(
      printMod.printAsync(options),
      SYSTEM_PRINT_TIMEOUT_MS,
      "System print",
    );
    return true;
  } catch (e: any) {
    const msg = e?.message || String(e || "");
    if (
      msg.includes("already in progress") ||
      msg.includes("canceled") ||
      msg.includes("cancelled") ||
      msg.includes("user canceled") ||
      msg.includes("dismissed")
    ) {
      console.warn("[printGuard] Print request canceled or busy:", msg);
    } else {
      console.error("[printGuard] Print error:", msg);
    }
    return false;
  } finally {
    forceResetPrintLock();
  }
}

export async function safePrintToFileAsync(
  options?: FilePrintOptions,
): Promise<FilePrintResult | null> {
  if (activePrintLock) {
    console.warn(
      "[printGuard] safePrintToFileAsync skipped: another print request is already in progress",
    );
    return null;
  }

  const printMod = getPrintModule();
  if (!printMod || typeof printMod.printToFileAsync !== "function") {
    console.warn(
      "[printGuard] printToFileAsync not supported in this build/environment",
    );
    return null;
  }

  activePrintLock = true;

  if (lockResetTimer) clearTimeout(lockResetTimer);
  lockResetTimer = setTimeout(() => {
    activePrintLock = false;
  }, FILE_PRINT_TIMEOUT_MS);

  try {
    const result = await withTimeout(
      printMod.printToFileAsync(options),
      FILE_PRINT_TIMEOUT_MS,
      "Render print file",
    );
    return result as FilePrintResult | null;
  } catch (e: any) {
    const msg = e?.message || String(e || "");
    if (msg.includes("already in progress")) {
      console.warn(
        "[printGuard] PrintToFile request skipped (already in progress):",
        msg,
      );
    } else {
      console.error("[printGuard] Save PDF error:", msg);
    }
    return null;
  } finally {
    forceResetPrintLock();
  }
}
