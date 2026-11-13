import { useLanguage } from "@/features/language";
import { getCompanyName } from "@/shared/constants/attendanceConfig";
import {
  ReportMode,
  ReportType,
  RequestSummary,
} from "@/shared/hooks/useAttendanceRequestReportData";
import { AttendanceRequestRuleItem } from "@/shared/services/attendanceRequestService";
import { StaffUser } from "@/shared/services/userService";
import { theme } from "@/shared/styles/theme";
import { StyleSheet, Text, View } from "react-native";

interface CustomRequestPaperProps {
  periodLabel: string;
  reportType: ReportType;
  reportMode: ReportMode;
  summary: RequestSummary;
  records: AttendanceRequestRuleItem[];
  targetStaff?: StaffUser | null;
}

export default function CustomRequestPaper({
  periodLabel,
  reportType,
  summary,
  records,
  targetStaff,
}: CustomRequestPaperProps) {
  const { t } = useLanguage();
  const generatedTimeStr = new Date().toLocaleString();

  // Sort records by date/from_date ascending, then id
  const sortedRecords = [...records].sort((a, b) => {
    const dateA = a.from_date || a.date || "";
    const dateB = b.from_date || b.date || "";
    if (dateA && dateB && dateA !== dateB) {
      return dateA.localeCompare(dateB);
    }
    const idA = a.id != null ? String(a.id) : "";
    const idB = b.id != null ? String(b.id) : "";
    if (idA && idB) {
      return idA.localeCompare(idB, undefined, { numeric: true });
    }
    const timeA = a.created_at || a.date || "";
    const timeB = b.created_at || b.date || "";
    return String(timeA).localeCompare(String(timeB));
  });

  const staffId =
    targetStaff?.id ||
    targetStaff?.staff_id ||
    (records.length > 0 ? records[0].staff_id : "-");
  const staffName =
    targetStaff?.name || (records.length > 0 ? records[0].name : "-");
  const position =
    targetStaff?.position ||
    (records.length > 0 ? records[0].position : "Staff Member") ||
    "Staff Member";
  const username = targetStaff?.username || "-";

  const staffSystemId =
    targetStaff?.system_id ||
    targetStaff?.id ||
    (records.length > 0
      ? (records[0] as any).systemId ||
        (records[0] as any).system_id ||
        records[0].staff_id
      : undefined);
  const companyName = getCompanyName(staffSystemId);

  const totalCount = summary?.totalRequests ?? records.length;

  return (
    <View style={styles.paperContainer}>
      {/* ── Header ── */}
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <Text style={styles.companyTitle}>{companyName}</Text>
          <Text style={styles.reportTitle}>
            {reportType} Request Total Report
          </Text>
          <Text style={styles.periodText}>Period: {periodLabel}</Text>
        </View>
        <Text style={styles.generatedAt}>Gen: {generatedTimeStr}</Text>
      </View>

      <View style={styles.divider} />

      {/* Staff detail info */}
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

      {/* ── Table ── */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.thCell, { width: 26, textAlign: "center" }]}>
            #
          </Text>
          <Text style={[styles.thCell, { flex: 1.2 }]}>
            {t("report.subject")}
          </Text>
          <Text style={[styles.thCell, { width: 120, textAlign: "center" }]}>
            {t("report.date")}
          </Text>
          <Text style={[styles.thCell, { flex: 1 }]}>{t("report.remark")}</Text>
          <Text style={[styles.thCell, { width: 68, textAlign: "center" }]}>
            {t("home.currentStatus")}
          </Text>
        </View>

        {/* Table Rows */}
        {sortedRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t("report.noRequests")}</Text>
          </View>
        ) : (
          sortedRecords.map((r, index) => {
            const status = (r.status || "pending").toLowerCase();
            const isApproved = status === "approved";
            const isRejected = status === "rejected";

            const badgeBg = isApproved
              ? "#dcfce7"
              : isRejected
                ? "#fedbdb"
                : "#fef3c7";
            const badgeColor = isApproved
              ? "#16a34a"
              : isRejected
                ? "#ff0000"
                : "#d97706";

            const subject = r.subject || "-";
            const remark = r.remark || "-";

            let dateLine = "-";
            let timeLine = "";

            if (r.from_date && r.to_date) {
              dateLine =
                r.from_date === r.to_date
                  ? r.from_date
                  : `${r.from_date} to ${r.to_date}`;
            } else if (r.date) {
              dateLine = r.date;
            }

            if (r.from_time && r.to_time) {
              timeLine = `${r.from_time} to ${r.to_time}`;
            } else if (r.from_time) {
              timeLine = r.from_time;
            } else if (r.time) {
              timeLine = r.time;
            }

            return (
              <View
                key={`${r.id || "req"}-${index}`}
                style={[
                  styles.tableRow,
                  index % 2 === 1 && styles.tableRowEven,
                ]}
              >
                <Text
                  style={[
                    styles.tdCell,
                    {
                      width: 26,
                      textAlign: "center",
                      // fontWeight: "600",
                      fontFamily: theme.fonts.semibold,
                    },
                  ]}
                >
                  {index + 1}
                </Text>
                <Text
                  style={[
                    styles.tdCell,
                    {
                      flex: 1.2,
                      // fontWeight: "600",
                      fontFamily: theme.fonts.semibold,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {subject}
                </Text>
                <View style={{ width: 120, alignItems: "center" }}>
                  <Text
                    style={[
                      styles.tdCell,
                      {
                        // fontWeight: "600",
                        fontFamily: theme.fonts.semibold,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {dateLine}
                  </Text>
                  {timeLine ? (
                    <Text style={styles.timeSubText} numberOfLines={1}>
                      {timeLine}
                    </Text>
                  ) : null}
                </View>
                <Text style={[styles.tdCell, { flex: 1 }]} numberOfLines={2}>
                  {remark}
                </Text>
                <View style={{ width: 68, alignItems: "center" }}>
                  <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                    <Text style={[styles.badgeText, { color: badgeColor }]}>
                      {status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}

        {/* Table Footer */}
        <View style={styles.tableFooter}>
          <Text style={styles.tfLabel}>{t("report.totalRequests")}</Text>
          <Text style={styles.tfValue}>{totalCount}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  paperContainer: {
    backgroundColor: theme.colors.background2,
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
    // fontWeight: "bold",
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
    // fontWeight: "bold",
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
  thCell: {
    fontSize: theme.fontSizes.xs,
    // fontWeight: "bold",
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
  tdCell: {
    fontSize: theme.fontSizes.xs,
    color: "#334155",
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  timeSubText: {
    fontSize: 9,
    color: "#64748b",
    fontFamily: theme.fonts.regular,
    marginTop: 1,
    includeFontPadding: false,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.xs,
  },
  badgeText: {
    fontSize: 8.5,
    // fontWeight: "bold",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  emptyContainer: {
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
    // fontWeight: "bold",
    color: "#0f172a",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  tfValue: {
    fontSize: theme.fontSizes.xs,
    // fontWeight: "bold",
    color: "#0f172a",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
