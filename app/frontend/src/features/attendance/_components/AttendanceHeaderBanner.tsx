import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface AttendanceHeaderBannerProps {
  totalCount: number;
  timeInCount: number;
  timeOutCount: number;
  timeOtherCount: number;
  topInset: number;
}

export const AttendanceHeaderBanner: React.FC<AttendanceHeaderBannerProps> = ({
  totalCount,
  timeInCount,
  timeOutCount,
  timeOtherCount,
  topInset,
}) => {
  return (
    <LinearGradient
      colors={[AppColors.secondary, AppColors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerCard}
    >
      <View style={[styles.headerTop, { paddingTop: 70 + topInset }]}>
        <View>
          <Text style={styles.headerSubTitle}>Staff Attendance History</Text>
          <Text style={styles.headerTitle}>Attendance Logs</Text>
        </View>
        <View style={styles.headerCountBadge}>
          <Text style={styles.headerCountText}>{totalCount} Total</Text>
        </View>
      </View>

      {/* Quick Stat Bar */}
      <View style={styles.conStatBar}>
        <View style={styles.bgConStatBar} />
        <View style={styles.statBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{timeInCount}</Text>
            <Text style={styles.statLabel}>Time-In</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{timeOutCount}</Text>
            <Text style={styles.statLabel}>Time-Out</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{timeOtherCount}</Text>
            <Text style={styles.statLabel}>Other</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerCard: {},
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerSubTitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  headerTitle: {
    fontSize: 22,
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    marginTop: 2,
  },
  headerCountBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  headerCountText: {
    fontSize: 12,
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },

  // Stat bar
  conStatBar: {
    marginTop: 30,
  },
  bgConStatBar: {
    backgroundColor: AppColors.background,
    height: 30,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
  },
  statBar: {
    flexDirection: "row",
    backgroundColor: AppColors.background2,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "space-around",
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: AppColors.grey + 70,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  statLabel: {
    fontSize: 12,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: AppColors.grey + 70,
  },
});
