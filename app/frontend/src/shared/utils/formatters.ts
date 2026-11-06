/**
 * Pure helper formatters (Dates, Currencies, Strings, Names)
 */

export function formatDate(
  date: string | Date | number,
  locale: string = "en-US",
): string {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
  } catch {
    return "";
  }
}

export function formatTime(date: string | Date | number): string {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function formatDateYMD(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatTime12h(date: Date = new Date()): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export function getTwoInitials(name?: string | null): string {
  if (!name || !name.trim()) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function truncateText(text: string, maxLength: number = 30): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function parseDateString(dateStr?: string | null): Date | null {
  if (!dateStr || !dateStr.trim()) return null;
  const clean = dateStr.trim();

  // Handle YYYY/MM/DD or YYYY-MM-DD
  const ymdMatch = clean.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // Handle DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // General ISO or standard Date fallback
  const d = new Date(clean);
  if (!isNaN(d.getTime())) return d;

  return null;
}

export function formatJoinedDisplay(rawJoinedDate?: string | null): string {
  if (!rawJoinedDate) return "—";
  const parsed = parseDateString(rawJoinedDate);
  if (parsed) {
    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  return rawJoinedDate;
}
