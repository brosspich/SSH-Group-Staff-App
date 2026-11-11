import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface AttendanceListFooterProps {
  loadingMore: boolean;
  hasMore: boolean;
  totalFilteredCount: number;
  pageSize: number;
}

export const AttendanceListFooter: React.FC<AttendanceListFooterProps> =
  React.memo(({ loadingMore, hasMore, totalFilteredCount, pageSize }) => {
    const { t } = useLanguage();

    if (loadingMore) {
      return (
        <View style={styles.loadingMoreBox}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.loadingMoreText}>
            {t("attendance.loadingMore", "Loading {{count}} more records...", {
              count: 10,
            })}
          </Text>
        </View>
      );
    }

    if (!hasMore && totalFilteredCount > pageSize) {
      return (
        <View style={styles.allLoadedBox}>
          <Text style={styles.allLoadedText}>
            {t("attendance.allRecordsLoaded", "All {{count}} records loaded", {
              count: totalFilteredCount,
            })}
          </Text>
        </View>
      );
    }

    return <View style={{ height: theme.spacing.lg }} />;
  });

const styles = StyleSheet.create({
  loadingMoreBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  loadingMoreText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  allLoadedBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.lg,
  },
  allLoadedText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
});
