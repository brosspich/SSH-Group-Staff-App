import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface AttendanceListFooterProps {
  loadingMore: boolean;
  hasMore: boolean;
  totalFilteredCount: number;
  pageSize: number;
}

export const AttendanceListFooter: React.FC<AttendanceListFooterProps> = React.memo(
  ({ loadingMore, hasMore, totalFilteredCount, pageSize }) => {
    if (loadingMore) {
      return (
        <View style={styles.loadingMoreBox}>
          <ActivityIndicator size="small" color={AppColors.primary} />
          <Text style={styles.loadingMoreText}>Loading 10 more records...</Text>
        </View>
      );
    }

    if (!hasMore && totalFilteredCount > pageSize) {
      return (
        <View style={styles.allLoadedBox}>
          <Text style={styles.allLoadedText}>
            All {totalFilteredCount} records loaded
          </Text>
        </View>
      );
    }

    return <View style={{ height: 24 }} />;
  },
);

const styles = StyleSheet.create({
  loadingMoreBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 13,
    color: AppColors.primary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  allLoadedBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  allLoadedText: {
    fontSize: 12,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
});
