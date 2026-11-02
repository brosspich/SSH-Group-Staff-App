import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AttendanceRecord } from "../_types/home.types";

interface RecentAttendanceHistoryProps {
  attendanceList: AttendanceRecord[];
  onViewAll: () => void;
}

export const RecentAttendanceHistory: React.FC<
  RecentAttendanceHistoryProps
> = ({ attendanceList, onViewAll }) => {
  return (
    <>
      {/* ── Recent History Section ── */}
      <View style={styles.historyHeaderRow}>
        <Text style={styles.sectionTitle}>Recent Attendance Logs</Text>
        <TouchableOpacity onPress={onViewAll} style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>
            View All ({attendanceList.length})
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={AppColors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Recent History List (First 4) */}
      {attendanceList.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="calendar-outline" size={42} color={AppColors.grey} />
          <Text style={styles.emptyTitle}>No Attendance Records</Text>
          <Text style={styles.emptySub}>
            Scan a QR code to record your time-in, time-out, or time-other.
          </Text>
        </View>
      ) : (
        <View style={styles.historyList}>
          {attendanceList.slice(0, 4).map((item) => {
            const isTimeIn = item.type === "time-in";
            const isTimeOut = item.type === "time-out";

            const badgeBg = isTimeIn
              ? "#dce0fc"
              : isTimeOut
                ? "#fedbdb"
                : "#f3e8ff";
            const badgeColor = isTimeIn
              ? "#0022ff"
              : isTimeOut
                ? "#ff0000"
                : "#7e22ce";

            return (
              <View key={item.id} style={styles.historyItem}>
                <View style={styles.historyItemLeft}>
                  <View
                    style={[styles.historyBadge, { backgroundColor: badgeBg }]}
                  >
                    <Text
                      style={[styles.historyBadgeText, { color: badgeColor }]}
                    >
                      {item.type.toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.historyItemTime}>{item.time}</Text>
                    <Text style={styles.historyItemDate}>{item.date}</Text>
                  </View>
                </View>

                <View style={styles.historyItemRight}>
                  <Text style={styles.historyStaffName}>{item.name}</Text>
                  <Text style={styles.historyStaffId}>ID: {item.staff_id}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  historyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 16,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  viewAllText: {
    fontSize: 12.5,
    color: AppColors.primary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  historyList: {
    gap: 10,
  },
  historyItem: {
    backgroundColor: AppColors.background2,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: AppColors.grey + 40,
    marginHorizontal: 15,
  },
  historyItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  historyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  historyBadgeText: {
    fontSize: 11,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  historyItemTime: {
    fontSize: 14,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  historyItemDate: {
    fontSize: 11,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },
  historyItemRight: {
    alignItems: "flex-end",
  },
  historyStaffName: {
    fontSize: 13,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  historyStaffId: {
    fontSize: 11,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 15,
  },
  emptyTitle: {
    fontSize: 15,
    color: AppColors.textPrimary,
    marginTop: 10,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  emptySub: {
    fontSize: 12,
    color: AppColors.grey,
    textAlign: "center",
    marginTop: 4,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
});
