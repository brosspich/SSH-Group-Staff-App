import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { NonSubscriptionHeaderProps } from "../_types/nonSubscription.types";

export const NonSubscriptionHeader: React.FC<NonSubscriptionHeaderProps> = ({
  title,
  subtitle,
}) => {
  const { t } = useLanguage();

  const resolvedTitle =
    title ?? t("subscription.expiredTitle", "Subscription Expired");
  const resolvedSubtitle =
    subtitle ??
    t(
      "subscription.expiredDesc",
      "The subscription service for your company branch has expired. Please renew your plan to continue using the system.",
    );

  return (
    <View style={styles.container}>
      {/* ── Warning Illustration Icon ── */}
      <View style={styles.iconContainer}>
        <View style={styles.iconCircleOuter}>
          <View style={styles.iconCircleInner}>
            <MaterialCommunityIcons
              name="clock-alert-outline"
              size={54}
              color={theme.colors.red}
            />
          </View>
        </View>
      </View>

      {/* ── Title & Message ── */}
      <Text style={styles.title}>{resolvedTitle}</Text>
      <Text style={styles.subtitle}>{resolvedSubtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  iconCircleOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(229, 57, 53, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(229, 57, 53, 0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    textAlign: "center",
    marginBottom: 10,
    includeFontPadding: false,
  },
  subtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 26,
    includeFontPadding: false,
  },
});
