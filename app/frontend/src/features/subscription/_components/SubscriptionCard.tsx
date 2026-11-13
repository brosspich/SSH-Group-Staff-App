import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { SubscriptionInfo } from "../_types/subscription.types";
import { formatSubscriptionDate } from "../_utils/subscriptionUtils";

interface SubscriptionCardProps {
  subscription: SubscriptionInfo;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
}) => {
  const { t } = useLanguage();

  const isActive = subscription.status === "Active" && !subscription.isExpired;

  return (
    <View style={styles.card}>
      {/* ── Status Badge ── */}
      <View style={styles.badgeRow}>
        <View
          style={[
            styles.badgePill,
            isActive ? styles.badgeActive : styles.badgeInactive,
          ]}
        >
          <View
            style={[
              styles.badgeDot,
              isActive ? styles.dotActive : styles.dotInactive,
            ]}
          />
          <Text
            style={[
              styles.badgeText,
              isActive ? styles.badgeTextActive : styles.badgeTextInactive,
            ]}
          >
            {isActive
              ? t("subscription.active", "Active")
              : t("subscription.inactive", "Inactive")}
          </Text>
        </View>
      </View>

      {/* ── Plan Title ── */}
      <Text style={styles.planTitle}>{subscription.plan || "1 Year"}</Text>

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ── Row 1: Start Date ── */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>
          {t("subscription.startDate", "Start Date")}
        </Text>
        <Text style={styles.infoValue}>
          {formatSubscriptionDate(subscription.startDate)}
        </Text>
      </View>

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ── Row 2: End Date ── */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>
          {t("subscription.endDate", "End Date")}
        </Text>
        <Text style={styles.infoValue}>
          {formatSubscriptionDate(subscription.endDate)}
        </Text>
      </View>

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ── Row 3: Days Remaining ── */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>
          {t("subscription.daysRemaining", "Days Remaining")}
        </Text>
        <Text
          style={[styles.infoValue, !isActive && { color: theme.colors.red }]}
        >
          {subscription.daysRemaining} {t("subscription.days", "days")}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background2,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: `${theme.colors.grey}20`,
    ...theme.shadows.sm,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  badgeActive: {
    backgroundColor: "rgba(76, 175, 80, 0.12)",
  },
  badgeInactive: {
    backgroundColor: "rgba(229, 57, 53, 0.12)",
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  dotActive: {
    backgroundColor: theme.colors.green,
  },
  dotInactive: {
    backgroundColor: theme.colors.red,
  },
  badgeText: {
    fontSize: 13,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  badgeTextActive: {
    color: theme.colors.green,
  },
  badgeTextInactive: {
    color: theme.colors.red,
  },
  planTitle: {
    fontSize: 24,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    marginTop: 14,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: `${theme.colors.grey}20`,
    width: "100%",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  infoLabel: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  infoValue: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
