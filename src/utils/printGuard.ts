import * as Print from "expo-print";

let activePrintLock = false;

const PRINT_TIMEOUT_MS = 15000;

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

export async function safePrintAsync(
  options: Print.PrintOptions,
): Promise<boolean> {
  if (activePrintLock) {
    console.warn(
      "[printGuard] safePrintAsync skipped: another print request is already in progress",
    );
    return false;
  }

  activePrintLock = true;
  try {
    await withTimeout(
      Print.printAsync(options),
      PRINT_TIMEOUT_MS,
      "System print",
    );
    return true;
  } catch (e: any) {
    if (e?.message?.includes("already in progress")) {
      console.warn(
        "[printGuard] Print request skipped (already in progress):",
        e?.message,
      );
    } else {
      console.error("[printGuard] Print error:", e?.message);
    }
    return false;
  } finally {
    activePrintLock = false;
  }
}

export async function safePrintToFileAsync(
  options?: Print.FilePrintOptions,
): Promise<Print.FilePrintResult | null> {
  if (activePrintLock) {
    console.warn(
      "[printGuard] safePrintToFileAsync skipped: another print request is already in progress",
    );
    return null;
  }

  activePrintLock = true;
  try {
    const result = await withTimeout(
      Print.printToFileAsync(options),
      PRINT_TIMEOUT_MS,
      "Render print file",
    );
    return result;
  } catch (e: any) {
    if (e?.message?.includes("already in progress")) {
      console.warn(
        "[printGuard] PrintToFile request skipped (already in progress):",
        e?.message,
      );
    } else {
      console.error("[printGuard] Save PDF error:", e?.message);
    }
    return null;
  } finally {
    activePrintLock = false;
  }
}
