import { AttendanceRecord } from "@/features/attendance/_types/attendance.types";
import { getCompanyName } from "@/shared/constants/attendanceConfig";
import {
  AttendanceSummary,
  ReportMode,
  ReportType,
} from "@/shared/hooks/useAttendanceReportData";
import { StaffUser } from "@/shared/services/userService";
import { theme } from "@/shared/styles/theme";
import { ScrollView, StyleSheet, Text, View } from "react-native";

interface CustomAttendancePaperProps {
  periodLabel: string;
  reportType: ReportType;
  reportMode: ReportMode;
  summary: AttendanceSummary;
  records: AttendanceRecord[];
  targetStaff?: StaffUser | null;
}

function parseRecordDateTime(rec: AttendanceRecord): Date | null {
  if (rec.timestamp) {
    const d = new Date(rec.timestamp);
    if (!isNaN(d.getTime())) return d;
  }
  if (rec.date && rec.time) {
    const d = new Date(`${rec.date} ${rec.time}`);
    if (!isNaN(d.getTime())) return d;
  }
  if (rec.time) {
    const match = rec.time.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const seconds = match[3] ? parseInt(match[3], 10) : 0;
      const ampm = match[4]?.toUpperCase();
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;

      const baseDate = rec.date ? new Date(`${rec.date}T00:00:00`) : new Date();
      if (!isNaN(baseDate.getTime())) {
        baseDate.setHours(hours, minutes, seconds, 0);
        return baseDate;
      }
    }
  }
  return null;
}

function formatDisplayTime(rec?: AttendanceRecord | null): string {
  if (!rec) return "-";
  const dt = parseRecordDateTime(rec);
  if (dt) {
    let hours = dt.getHours();
    const minutes = String(dt.getMinutes()).padStart(2, "0");
    const seconds = String(dt.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const hh = String(hours).padStart(2, "0");
    return `${hh}:${minutes}:${seconds} ${ampm}`;
  }
  if (rec.time) {
    const match = rec.time.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const mm = match[2];
      const ss = match[3] ? match[3].padStart(2, "0") : "00";
      const ampm = match[4]
        ? match[4].toUpperCase()
        : hours >= 12
          ? "PM"
          : "AM";
      hours = hours % 12 || 12;
      return `${String(hours).padStart(2, "0")}:${mm}:${ss} ${ampm}`;
    }
    return rec.time;
  }
  return "-";
}

interface DayRow {
  staffId: string;
  staffName: string;
  date: string;
  timeIn: string;
  timeOut: string;
  totalTime: string;
  diffSeconds: number;
  remark: string;
}

export default function CustomAttendancePaper({
  periodLabel,
  reportType,
  reportMode,
  records,
  targetStaff,
}: CustomAttendancePaperProps) {
  const generatedTimeStr = new Date().toLocaleString();

  // Group records by staffId and date
  const groups = new Map<string, AttendanceRecord[]>();
  for (const r of records) {
    const staffId = r.staff_id != null ? String(r.staff_id) : "-";
    const date = r.date || "-";
    const key = `${staffId}___${date}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(r);
  }

  const dayRows: DayRow[] = [];
  groups.forEach((groupRecords, key) => {
    const [staffId, date] = key.split("___");
    const staffName = groupRecords[0]?.name || targetStaff?.name || "-";

    const sortedGroup = [...groupRecords].sort((a, b) => {
      const dtA = parseRecordDateTime(a)?.getTime() ?? 0;
      const dtB = parseRecordDateTime(b)?.getTime() ?? 0;
      return dtA - dtB;
    });

    let inRec = sortedGroup.find((r) => r.type === "time-in");
    let outRec = [...sortedGroup].reverse().find((r) => r.type === "time-out");

    if (
      !inRec &&
      sortedGroup.length > 0 &&
      sortedGroup[0].type !== "time-out"
    ) {
      inRec = sortedGroup[0];
    }
    if (!outRec && sortedGroup.length > 1) {
      const last = sortedGroup[sortedGroup.length - 1];
      if (last !== inRec && last.type !== "time-in") {
        outRec = last;
      }
    }

    const timeInStr = inRec ? formatDisplayTime(inRec) : "-";
    const timeOutStr = outRec ? formatDisplayTime(outRec) : "-";

    let diffSeconds = 0;
    let totalTimeStr = "-";
    if (inRec && outRec && inRec !== outRec) {
      const inDate = parseRecordDateTime(inRec);
      const outDate = parseRecordDateTime(outRec);
      if (inDate && outDate) {
        const diffMs = outDate.getTime() - inDate.getTime();
        if (diffMs > 0) {
          diffSeconds = Math.round(diffMs / 1000);
          const h = Math.floor(diffSeconds / 3600);
          const m = Math.floor((diffSeconds % 3600) / 60);
          const s = diffSeconds % 60;
          totalTimeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        }
      }
    }

    const remark =
      inRec?.remark ||
      outRec?.remark ||
      groupRecords.find((r) => r.remark)?.remark ||
      "-";

    dayRows.push({
      staffId,
      staffName,
      date,
      timeIn: timeInStr,
      timeOut: timeOutStr,
      totalTime: totalTimeStr,
      diffSeconds,
      remark,
    });
  });

  dayRows.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.staffId.localeCompare(b.staffId, undefined, { numeric: true });
  });

  // Grand total formatted as cumulative hours: e.g. 05H 14M 29S or 250H 30M 45S
  const grandTotalSeconds = dayRows.reduce((sum, r) => sum + r.diffSeconds, 0);
  const totalHours = Math.floor(grandTotalSeconds / 3600);
  const remSeconds = grandTotalSeconds % 3600;
  const minutes = Math.floor(remSeconds / 60);
  const seconds = remSeconds % 60;

  const grandHoursStr = String(totalHours).padStart(2, "0");
  const grandMinsStr = String(minutes).padStart(2, "0");
  const grandSecsStr = String(seconds).padStart(2, "0");
  const grandTotalFormatted = `${grandHoursStr}H ${grandMinsStr}M ${grandSecsStr}S`;

  const staffId =
    targetStaff?.id ||
    targetStaff?.staff_id ||
    (records.length > 0 ? records[0].staff_id : "-");
  const staffName =
    targetStaff?.name || (records.length > 0 ? records[0].name : "-");
  const position = targetStaff?.position || "Staff Member";
  const username =
    targetStaff?.username ||
    (records.length > 0 ? (records[0] as any).username : "") ||
    (staffId !== "-" ? staffId : "-");

  const staffSystemId =
    targetStaff?.system_id ||
    targetStaff?.id ||
    (records.length > 0
      ? records[0].system_id || records[0].staff_id
      : undefined);
  const companyName = getCompanyName(staffSystemId);

  const isAllStaff = reportMode === "all";

  return (
    <View style={styles.paperContainer}>
      {/* ── Header ── */}
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <Text style={styles.companyTitle}>{companyName}</Text>
          <Text style={styles.reportTitle}>
            {reportType} Attendance Total Report
          </Text>
          <Text style={styles.periodText}>Period: {periodLabel}</Text>
        </View>
        <Text style={styles.generatedAt}>Gen: {generatedTimeStr}</Text>
      </View>

      <View style={styles.divider} />

      {/* Staff detail info (only for current or individual staff) */}
      {!isAllStaff && (
        <View style={styles.staffInfoCard}>
          <Text style={styles.staffInfoText} numberOfLines={1}>
            <Text style={styles.staffInfoLabel}>Staff id : </Text>
            {staffId} &nbsp;|&nbsp;
            <Text style={styles.staffInfoLabel}>Staff Name : </Text>
            {staffName} &nbsp;|&nbsp;
            <Text style={styles.staffInfoLabel}>Position : </Text>
            {position} &nbsp;|&nbsp;
            <Text style={styles.staffInfoLabel}>Username : </Text>
            {username}
          </Text>
        </View>
      )}

      {/* ── Records Table ── */}
      {!isAllStaff ? (
        /* Single Staff View: 6 columns with horizontal scroll */
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={[styles.table, { minWidth: 540 }]}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text
                style={[styles.th, { width: 32, textAlign: "center" }]}
                numberOfLines={1}
              >
                #
              </Text>
              <Text
                style={[styles.th, { width: 92, textAlign: "center" }]}
                numberOfLines={1}
              >
                Date
              </Text>
              <Text
                style={[styles.th, { width: 92, textAlign: "center" }]}
                numberOfLines={1}
              >
                Time In
              </Text>
              <Text
                style={[styles.th, { width: 92, textAlign: "center" }]}
                numberOfLines={1}
              >
                Time Out
              </Text>
              <Text
                style={[styles.th, { width: 96, textAlign: "center" }]}
                numberOfLines={1}
              >
                Total Time
              </Text>
              <Text
                style={[styles.th, { width: 136, textAlign: "center" }]}
                numberOfLines={1}
              >
                Remark
              </Text>
            </View>

            {/* Table Rows */}
            {dayRows.length === 0 ? (
              <View style={styles.emptyRow}>
                <Text style={styles.emptyText}>
                  No logs found for this period.
                </Text>
              </View>
            ) : (
              dayRows.map((item, index) => {
                const isEven = index % 2 === 0;
                return (
                  <View
                    key={`${item.staffId}-${item.date}-${index}`}
                    style={[styles.tableRow, isEven && styles.tableRowEven]}
                  >
                    <Text
                      style={[
                        styles.td,
                        { width: 32, textAlign: "center", fontWeight: "600" },
                      ]}
                      numberOfLines={1}
                    >
                      {index + 1}
                    </Text>
                    <Text
                      style={[styles.td, { width: 92, textAlign: "center" }]}
                      numberOfLines={1}
                    >
                      {item.date}
                    </Text>
                    <Text
                      style={[
                        styles.td,
                        {
                          width: 92,
                          textAlign: "center",
                          fontWeight: "600",
                          color: "#0022ff",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {item.timeIn}
                    </Text>
                    <Text
                      style={[
                        styles.td,
                        {
                          width: 92,
                          textAlign: "center",
                          fontWeight: "600",
                          color: "#ff0000",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {item.timeOut}
                    </Text>
                    <Text
                      style={[
                        styles.td,
                        { width: 96, textAlign: "center", fontWeight: "700" },
                      ]}
                      numberOfLines={1}
                    >
                      {item.totalTime}
                    </Text>
                    <Text
                      style={[styles.td, { width: 136, textAlign: "center" }]}
                      numberOfLines={1}
                    >
                      {item.remark || "-"}
                    </Text>
                  </View>
                );
              })
            )}

            {/* Table Footer */}
            <View style={styles.tableFooter}>
              <Text style={styles.tfLabel}>Total Time Work Attendance</Text>
              <Text style={styles.tfValue}>{grandTotalFormatted}</Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        /* All Staff View: 8 columns with smooth horizontal scroll */
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={[styles.table, { minWidth: 660 }]}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text
                style={[styles.th, { width: 32, textAlign: "center" }]}
                numberOfLines={1}
              >
                #
              </Text>
              <Text
                style={[styles.th, { width: 72, textAlign: "center" }]}
                numberOfLines={1}
              >
                Staff ID
              </Text>
              <Text style={[styles.th, { width: 110 }]} numberOfLines={1}>
                Staff Name
              </Text>
              <Text
                style={[styles.th, { width: 85, textAlign: "center" }]}
                numberOfLines={1}
              >
                Date
              </Text>
              <Text
                style={[styles.th, { width: 98, textAlign: "center" }]}
                numberOfLines={1}
              >
                Time In
              </Text>
              <Text
                style={[styles.th, { width: 98, textAlign: "center" }]}
                numberOfLines={1}
              >
                Time Out
              </Text>
              <Text
                style={[styles.th, { width: 85, textAlign: "center" }]}
                numberOfLines={1}
              >
                Total Time
              </Text>
              <Text
                style={[styles.th, { width: 78, textAlign: "center" }]}
                numberOfLines={1}
              >
                Remark
              </Text>
            </View>

            {/* Table Rows */}
            {dayRows.length === 0 ? (
              <View style={styles.emptyRow}>
                <Text style={styles.emptyText}>
                  No logs found for this period.
                </Text>
              </View>
            ) : (
              dayRows.map((item, index) => {
                const isEven = index % 2 === 0;
                return (
                  <View
                    key={`${item.staffId}-${item.date}-${index}`}
                    style={[styles.tableRow, isEven && styles.tableRowEven]}
                  >
                    <Text
                      style={[
                        styles.td,
                        { width: 32, textAlign: "center", fontWeight: "600" },
                      ]}
                      numberOfLines={1}
                    >
                      {index + 1}
                    </Text>
                    <Text
                      style={[
                        styles.td,
                        { width: 72, textAlign: "center", fontWeight: "600" },
                      ]}
                      numberOfLines={1}
                    >
                      {item.staffId}
                    </Text>
                    <Text
                      style={[styles.td, { width: 110, fontWeight: "700" }]}
                      numberOfLines={1}
                    >
                      {item.staffName}
                    </Text>
                    <Text
                      style={[styles.td, { width: 85, textAlign: "center" }]}
                      numberOfLines={1}
                    >
                      {item.date}
                    </Text>
                    <Text
                      style={[
                        styles.td,
                        {
                          width: 98,
                          textAlign: "center",
                          fontWeight: "600",
                          color: "#0022ff",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {item.timeIn}
                    </Text>
                    <Text
                      style={[
                        styles.td,
                        {
                          width: 98,
                          textAlign: "center",
                          fontWeight: "600",
                          color: "#ff0000",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {item.timeOut}
                    </Text>
                    <Text
                      style={[
                        styles.td,
                        { width: 85, textAlign: "center", fontWeight: "700" },
                      ]}
                      numberOfLines={1}
                    >
                      {item.totalTime}
                    </Text>
                    <Text
                      style={[styles.td, { width: 78, textAlign: "center" }]}
                      numberOfLines={1}
                    >
                      {item.remark || "-"}
                    </Text>
                  </View>
                );
              })
            )}

            {/* Table Footer */}
            <View style={styles.tableFooter}>
              <Text style={styles.tfLabel}>Total Time Work Attendance</Text>
              <Text style={styles.tfValue}>{grandTotalFormatted}</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  paperContainer: {
    backgroundColor: "#ffffff",
    borderRadius: theme.borderRadius.sm,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  titleCol: {
    flex: 1,
  },
  companyTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: "bold",
    color: "#0f172a",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  reportTitle: {
    fontSize: theme.fontSizes.sm,
    color: "#334155",
    fontFamily: theme.fonts.bold,
    marginTop: 2,
    includeFontPadding: false,
  },
  periodText: {
    fontSize: theme.fontSizes.xs,
    color: "#64748b",
    fontFamily: theme.fonts.regular,
    marginTop: 2,
    includeFontPadding: false,
  },
  generatedAt: {
    fontSize: 9.5,
    color: "#94a3b8",
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginBottom: 10,
  },
  staffInfoCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: theme.borderRadius.xs,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  staffInfoText: {
    fontSize: theme.fontSizes.xs,
    color: "#1e293b",
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  staffInfoLabel: {
    fontWeight: "bold",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  table: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: theme.borderRadius.xs,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingVertical: 7,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  th: {
    fontSize: theme.fontSizes.xs,
    fontWeight: "bold",
    color: "#334155",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tableRowEven: {
    backgroundColor: "#f8fafc",
  },
  td: {
    fontSize: theme.fontSizes.xs,
    color: "#334155",
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  emptyRow: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: theme.fontSizes.xs,
    color: "#94a3b8",
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  tableFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderTopWidth: 2,
    borderTopColor: "#94a3b8",
  },
  tfLabel: {
    fontSize: theme.fontSizes.xs,
    fontWeight: "bold",
    color: "#0f172a",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  tfValue: {
    fontSize: theme.fontSizes.xs,
    fontWeight: "bold",
    color: "#0f172a",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
