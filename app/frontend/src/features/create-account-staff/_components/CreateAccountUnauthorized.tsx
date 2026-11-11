import { useLanguage } from "@/features/language";
import AppbarBack from "@/shared/components/appbar/appbarback";
import { theme } from "@/shared/styles/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const CreateAccountUnauthorized: React.FC = () => {
  const { t } = useLanguage();

  return (
    <View style={styles.safe}>
      <AppbarBack
        Title={t("setting.createStaff", "Create Account Staff")}
        fallbackRoute="/(tabs)/setting"
      />
      <View style={styles.centerContainer}>
        <View style={styles.lockCircle}>
          <MaterialIcons
            name="lock-outline"
            size={54}
            color={theme.colors.red}
          />
        </View>
        <Text style={styles.unauthTitle}>
          {t("adminStaff.accessRestricted", "Access Restricted")}
        </Text>
        <Text style={styles.unauthSubtitle}>
          {t(
            "adminStaff.accessRestrictedDesc",
            "You do not have administrative permissions to view or manage staff accounts.",
          )}
        </Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace("/(tabs)/setting")}
          activeOpacity={0.8}
        >
          <Text style={styles.backBtnText}>
            {t("adminStaff.backToSetting", "Back to Settings")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  lockCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${theme.colors.red}18`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  unauthTitle: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textPrimary,
    marginBottom: 8,
    includeFontPadding: false,
  },
  unauthSubtitle: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    includeFontPadding: false,
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
  },
  backBtnText: {
    color: theme.colors.background2,
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.sm,
    includeFontPadding: false,
  },
});
