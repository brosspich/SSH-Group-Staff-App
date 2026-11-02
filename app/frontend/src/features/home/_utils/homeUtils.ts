import { AttendanceRecord } from "../_types/home.types";

export function formatTime12h(date = new Date()): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export function formatDateYMD(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Generates formatted attendance ID: att-XXXX-YYYY-ZZZZ
 * att-0000-0000-9999 -> att-0000-0001-0000
 * att-0000-9999-9999 -> att-0001-0000-0000
 */
export function generateNextAttendanceId(
  existingRecords: AttendanceRecord[] = [],
): string {
  let maxSeq = 0;

  for (const rec of existingRecords) {
    if (rec?.id && typeof rec.id === "string") {
      const clean = rec.id.replace(/^att[-_]/i, "").replace(/-/g, "");
      const num = parseInt(clean, 10);
      if (!isNaN(num) && num > maxSeq && num < 1000000000000) {
        maxSeq = num;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  const seqStr = String(nextSeq).padStart(12, "0");
  const block1 = seqStr.substring(0, 4);
  const block2 = seqStr.substring(4, 8);
  const block3 = seqStr.substring(8, 12);

  return `ATT-${block1}-${block2}-${block3}`;
}
