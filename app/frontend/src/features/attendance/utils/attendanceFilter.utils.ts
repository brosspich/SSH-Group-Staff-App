import {
  AttendanceFilterType,
  AttendanceRecord,
} from "../_types/attendance.types";

export function formatDateYMD(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export interface AttendanceCounts {
  todayCount: number;
  allCount: number;
  timeInCount: number;
  timeOutCount: number;
  timeOtherCount: number;
}

export function calculateAttendanceCounts(
  records: AttendanceRecord[],
  todayStr: string,
): AttendanceCounts {
  let todayCount = 0;
  let timeInCount = 0;
  let timeOutCount = 0;
  let timeOtherCount = 0;

  for (const r of records) {
    const rDate = r.date || (r as any).scanDate || "";
    if (rDate === todayStr) {
      todayCount++;
    }

    if (r.type === "time-in") {
      timeInCount++;
    } else if (r.type === "time-out") {
      timeOutCount++;
    } else if (r.type === "time-other") {
      timeOtherCount++;
    }
  }

  return {
    todayCount,
    allCount: records.length,
    timeInCount,
    timeOutCount,
    timeOtherCount,
  };
}

export function filterAttendanceRecords(
  records: AttendanceRecord[],
  filter: AttendanceFilterType,
  query: string,
  todayStr: string,
): AttendanceRecord[] {
  const trimmedQuery = query.trim().toLowerCase();
  const currentMonth = todayStr.substring(0, 7);

  return records.filter((r) => {
    const rDate = r.date || (r as any).scanDate || "";
    const rTime = r.time || (r as any).scanTime || "";
    const rType = r.type || "";
    const rName = r.name || "";
    const rStaffId =
      r.staff_id || (r as any).userId || (r as any).staffId || "";

    // 1. Filter by Chip
    let matchesChip = true;
    if (filter === "today") {
      matchesChip = rDate === todayStr;
    } else if (filter === "month") {
      matchesChip = rDate.startsWith(currentMonth);
    }

    if (!matchesChip) return false;

    // 2. Filter by Search Query
    if (trimmedQuery.length > 0) {
      return (
        rDate.toLowerCase().includes(trimmedQuery) ||
        rTime.toLowerCase().includes(trimmedQuery) ||
        rType.toLowerCase().includes(trimmedQuery) ||
        rName.toLowerCase().includes(trimmedQuery) ||
        rStaffId.toLowerCase().includes(trimmedQuery) ||
        Boolean(r.id?.toLowerCase().includes(trimmedQuery))
      );
    }

    return true;
  });
}
