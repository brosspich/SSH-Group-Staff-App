import { AttendanceRecord } from "@/app/(tabs)/attendance";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { AttendanceSummary, ReportMode, ReportType } from "@/hooks/useAttendanceReportData";
import { StaffUser } from "@/services/userService";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface CustomAttendancePaperProps {
  periodLabel: string;
  reportType: ReportType;
  reportMode: ReportMode;
  summary: AttendanceSummary;
  records: AttendanceRecord[];
  targetStaff?: StaffUser | null;
}

export default function CustomAttendancePaper({
  periodLabel,
  reportType,
  reportMode,
  summary,
  records,
  targetStaff,
}: CustomAttendancePaperProps) {
  const generatedTimeStr = new Date().toLocaleString();

  return (
    <View style={styles.paperContainer}>
      {/* ── Header ── */}
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <Text style={styles.companyTitle}>SSH Group</Text>
          <Text style={styles.reportTitle}>
            {reportType} Attendance Report (
            {reportMode === "individual" ? "Individual" : "All Staff"})
          </Text>
          <Text style={styles.periodText}>Period: {periodLabel}</Text>
        </View>
        <Text style={styles.generatedAt}>Gen: {generatedTimeStr}</Text>
      </View>

      <View style={styles.divider} />

      {/* Staff detail info for individual report */}
      {reportMode === "individual" && targetStaff && (
        <View style={styles.staffInfoCard}>
          <Text style={styles.staffInfoText}>
            <Text style={styles.staffInfoLabel}>Staff:</Text> {targetStaff.name}{" "}
            ({targetStaff.id})
          </Text>
          <Text style={styles.staffInfoText}>
            <Text style={styles.staffInfoLabel}>Position:</Text>{" "}
            {targetStaff.position || "N/A"}
          </Text>
        </View>
      )}

      {/* ── Summary Stats Grid ── */}
      <View style={styles.summaryGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statBoxLabel}>Total Logs</Text>
          <Text style={styles.statBoxValue}>{summary.totalLogs}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxLabel}>Time-In</Text>
          <Text style={[styles.statBoxValue, { color: "#15803d" }]}>
            {summary.timeInCount}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxLabel}>Time-Out</Text>
          <Text style={[styles.statBoxValue, { color: "#1d4ed8" }]}>
            {summary.timeOutCount}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxLabel}>Other</Text>
          <Text style={[styles.statBoxValue, { color: "#7e22ce" }]}>
            {summary.timeOtherCount}
          </Text>
        </View>
      </View>

      {/* ── Records Table ── */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { width: "10%", textAlign: "center" }]}>
            #
          </Text>
          <Text style={[styles.th, { width: "18%" }]}>Staff ID</Text>
          <Text style={[styles.th, { flex: 1 }]}>Name</Text>
          <Text style={[styles.th, { width: "22%", textAlign: "center" }]}>
            Date
          </Text>
          <Text style={[styles.th, { width: "20%", textAlign: "center" }]}>
            Time
          </Text>

          <Text style={[styles.th, { width: "18%", textAlign: "center" }]}>
            Type
          </Text>
        </View>

        {/* Table Rows */}
        {records.length === 0 ? (
          <View style={styles.emptyRow}>
            <Text style={styles.emptyText}>No logs found for this period.</Text>
          </View>
        ) : (
          records.map((item, index) => {
            const isEven = index % 2 === 0;
            const badgeBg =
              item.type === "time-in"
                ? "#dcfce7"
                : item.type === "time-out"
                  ? "#dbeafe"
                  : "#f3e8ff";
            const badgeColor =
              item.type === "time-in"
                ? "#15803d"
                : item.type === "time-out"
                  ? "#1d4ed8"
                  : "#7e22ce";

            return (
              <View
                key={item.id || index}
                style={[styles.tableRow, isEven && styles.tableRowEven]}
              >
                <Text
                  style={[styles.td, { width: "10%", textAlign: "center" }]}
                >
                  {index + 1}
                </Text>
                <Text
                  style={[styles.td, { width: "18%" }]}
                  numberOfLines={1}
                >
                  {item.staff_id}
                </Text>
                <Text style={[styles.td, { flex: 1 }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text
                  style={[styles.td, { width: "22%", textAlign: "center" }]}
                >
                  {item.date}
                </Text>
                <Text
                  style={[styles.td, { width: "20%", textAlign: "center" }]}
                  numberOfLines={1}
                >
                  {item.time}
                </Text>
                <View
                  style={{
                    width: "18%",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={[styles.badge, { backgroundColor: badgeBg }]}
                  >
                    <Text
                      style={[styles.badgeText, { color: badgeColor }]}
                    >
                      {item.type}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}

        {/* Table Footer */}
        <View style={styles.tableFooter}>
          <Text style={styles.tfLabel}>Total Records</Text>
          <Text style={styles.tfValue}>{summary.totalLogs}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  paperContainer: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    margin: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleCol: { flex: 1 },
  companyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  reportTitle: {
    fontSize: 13,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    marginTop: 2,
    includeFontPadding: false,
  },
  periodText: {
    fontSize: 11,
    color: "#64748b",
    fontFamily: AppFonts.regular,
    marginTop: 2,
    includeFontPadding: false,
  },
  generatedAt: {
    fontSize: 9,
    color: "#94a3b8",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 12,
  },
  staffInfoCard: {
    flexDirection: "row",
    gap: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  staffInfoText: {
    fontSize: 11,
    color: "#334155",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  staffInfoLabel: {
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
  },
  statBoxLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "#64748b",
    fontFamily: AppFonts.bold,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  statBoxValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f172a",
    fontFamily: AppFonts.bold,
    marginTop: 2,
    includeFontPadding: false,
  },
  table: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  th: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#334155",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tableRowEven: {
    backgroundColor: "#f8fafc",
  },
  td: {
    fontSize: 10.5,
    color: "#334155",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  emptyRow: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 11,
    color: "#94a3b8",
    fontFamily: AppFonts.regular,
  },
  tableFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
  },
  tfLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0f172a",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  tfValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0f172a",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
