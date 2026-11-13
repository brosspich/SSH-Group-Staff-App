/**
 * Formats a date string (e.g. "2026-07-01") into DD/MM/YYYY format ("01/07/2026")
 * exactly as shown in the design specification (Pic 3).
 */
export function formatSubscriptionDate(dateStr?: string): string {
  if (!dateStr) return "--/--/----";

  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      // In case dateStr is already in "YYYY-MM-DD" or similar
      const parts = dateStr.split(/[-/]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return `${parts[2].padStart(2, "0")}/${parts[1].padStart(2, "0")}/${parts[0]}`;
        }
      }
      return dateStr;
    }

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Calculates remaining days between current date and target end date
 */
export function calculateDaysRemaining(endDateStr?: string): number {
  if (!endDateStr) return 0;
  try {
    const end = new Date(endDateStr);
    if (isNaN(end.getTime())) return 0;

    const today = new Date();
    const endDay = new Date(
      end.getFullYear(),
      end.getMonth(),
      end.getDate(),
    ).getTime();
    const currentDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    ).getTime();

    const diffMs = endDay - currentDay;
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  } catch {
    return 0;
  }
}
