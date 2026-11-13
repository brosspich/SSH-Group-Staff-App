import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { NonSubscriptionDetailsCardProps } from "../_types/nonSubscription.types";

export const NonSubscriptionDetailsCard: React.FC<
  NonSubscriptionDetailsCardProps
> = ({ companyId, staffName, subInfo }) => {
  const { t } = useLanguage();

  const isStatusActive = subInfo?.status === "Active";
  const daysRemaining = subInfo?.daysRemaining ?? 0;

  return (
    <View style={styles.infoCard}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardHeaderTitle}>
          {t("subscription.details", "Subscription Details")}
        </Text>
        <View
          style={[styles.expiredBadge, isStatusActive && styles.activeBadge]}
        >
          <Text
            style={[
              styles.expiredBadgeText,
              isStatusActive && styles.activeBadgeText,
            ]}
          >
            {subInfo?.status || t("subscription.inactive", "Expired")}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Row 1: Branch System ID */}
      <View style={styles.cardRow}>
        <Text style={styles.rowLabel}>
          {t("subscription.systemId", "Branch System ID")}
        </Text>
        <Text style={styles.rowValue}>{companyId}</Text>
      </View>

      <View style={styles.divider} />

      {/* Row 2: Staff Member Name */}
      <View style={styles.cardRow}>
        <Text style={styles.rowLabel}>
          {t("subscription.staffName", "Staff Member")}
        </Text>
        <Text style={styles.rowValue}>{staffName}</Text>
      </View>

      <View style={styles.divider} />

      {/* Row 3: Days Remaining */}
      <View style={styles.cardRow}>
        <Text style={styles.rowLabel}>
          {t("subscription.daysRemaining", "Days Remaining")}
        </Text>
        <Text
          style={[
            styles.rowValue,
            {
              color:
                daysRemaining > 0 ? theme.colors.primary : theme.colors.red,
            },
          ]}
        >
          {daysRemaining} {t("subscription.days", "days")}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    width: "100%",
    backgroundColor: theme.colors.background2,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: `${theme.colors.grey}20`,
    marginBottom: 26,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardHeaderTitle: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  expiredBadge: {
    backgroundColor: "rgba(229, 57, 53, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  activeBadge: {
    backgroundColor: `${theme.colors.primary}18`,
  },
  expiredBadgeText: {
    fontSize: 11,
    color: theme.colors.red,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  activeBadgeText: {
    color: theme.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: `${theme.colors.grey}15`,
    width: "100%",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  rowLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  rowValue: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
