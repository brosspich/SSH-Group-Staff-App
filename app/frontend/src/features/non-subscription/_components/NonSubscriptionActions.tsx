import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { NonSubscriptionActionsProps } from "../_types/nonSubscription.types";

export const NonSubscriptionActions: React.FC<NonSubscriptionActionsProps> = ({
  checking,
  onCheckAgain,
  onContactSupport,
  onLogout,
}) => {
  const { t } = useLanguage();

  return (
    <View style={styles.actionGroup}>
      {/* 1. Check Again Button */}
      <TouchableOpacity
        style={styles.btnPrimary}
        onPress={onCheckAgain}
        disabled={checking}
        activeOpacity={0.85}
      >
        {checking ? (
          <ActivityIndicator size="small" color={theme.colors.background2} />
        ) : (
          <>
            <Ionicons
              name="refresh-outline"
              size={18}
              color={theme.colors.background2}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.btnPrimaryText}>
              {t("subscription.checkAgain", "Check Again")}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* 2. Contact Support Telegram Button */}
      <TouchableOpacity
        style={styles.btnSecondary}
        onPress={onContactSupport}
        activeOpacity={0.85}
      >
        <Ionicons
          name="paper-plane-outline"
          size={18}
          color={theme.colors.primary}
          style={{ marginRight: 8 }}
        />
        <Text style={styles.btnSecondaryText}>
          {t("subscription.contactSupport", "Contact Support / Telegram")}
        </Text>
      </TouchableOpacity>

      {/* 3. Logout Button */}
      <TouchableOpacity
        style={styles.btnLogout}
        onPress={onLogout}
        activeOpacity={0.7}
      >
        <Feather
          name="log-out"
          size={16}
          color={theme.colors.textSecondary}
          style={{ marginRight: 6 }}
        />
        <Text style={styles.btnLogoutText}>
          {t("common.logout", "Log Out")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionGroup: {
    width: "100%",
    gap: 12,
  },
  btnPrimary: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: {
    color: theme.colors.background2,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  btnSecondary: {
    backgroundColor: `${theme.colors.primary}12`,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}30`,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondaryText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  btnLogout: {
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnLogoutText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.medium,
    includeFontPadding: false,
  },
});
