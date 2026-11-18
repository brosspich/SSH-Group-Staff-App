import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
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
  const { t } = useLanguage();

  return (
    <LinearGradient
      colors={[theme.colors.secondary, theme.colors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerCard}
    >
      <View style={[styles.headerTop, { paddingTop: 70 + topInset }]}>
        <View style={{ flex: 1, flexShrink: 1 }}>
          <Text style={styles.headerSubTitle}>
            {t("attendance.historySubtitle")}
          </Text>
          <Text style={styles.headerTitle}>{t("attendance.logsTitle")}</Text>
        </View>
        <View style={styles.headerCountBadge}>
          <Text style={styles.headerCountText}>
            {`${totalCount} ${t("common.total")}`}
          </Text>
        </View>
      </View>

      {/* Quick Stat Bar */}
      <View style={styles.conStatBar}>
        <View style={styles.bgConStatBar} />
        <View style={styles.statBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{timeInCount}</Text>
            <Text style={styles.statLabel}>{t("attendance.timeInShort")}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{timeOutCount}</Text>
            <Text style={styles.statLabel}>{t("attendance.timeOutShort")}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{timeOtherCount}</Text>
            <Text style={styles.statLabel}>{t("attendance.otherShort")}</Text>
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
    paddingHorizontal: theme.spacing.lg,
    // flex: 1,
    gap: theme.spacing.md,
  },
  headerSubTitle: {
    fontSize: theme.fontSizes.xs,
    color: "rgba(255,255,255,0.8)",
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    flexShrink: 1,
  },
  headerTitle: {
    fontSize: theme.fontSizes.xxl,
    color: theme.colors.background2,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    marginTop: 2,
    flexShrink: 1,
  },
  headerCountBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    flex: 1,
  },
  headerCountText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.background2,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },

  // Stat bar
  conStatBar: {
    marginTop: theme.spacing.xl,
  },
  bgConStatBar: {
    backgroundColor: theme.colors.background,
    height: 30,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopRightRadius: theme.borderRadius.md,
    borderTopLeftRadius: theme.borderRadius.md,
  },
  statBar: {
    flexDirection: "row",
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: "center",
    justifyContent: "space-around",
    marginHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.grey + 70,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  statLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.grey + 70,
  },
});
