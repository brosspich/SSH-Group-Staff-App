import { useLanguage } from "@/features/language";
import AppbarBack from "@/shared/components/appbar/appbarback";
import { theme } from "@/shared/styles/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const InfoCompanyUnauthorized: React.FC = () => {
  const { t } = useLanguage();

  return (
    <View style={styles.safe}>
      <AppbarBack
        Title={t("infoCompany.title", "Company Information")}
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
          {t("infoCompany.accessRestricted", "Access Restricted")}
        </Text>
        <Text style={styles.unauthSubtitle}>
          {t(
            "infoCompany.accessRestrictedDesc",
            "Only administrator accounts have permission to edit company information.",
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
    backgroundColor: `${theme.colors.red}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: `${theme.colors.red}30`,
  },
  unauthTitle: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  unauthSubtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  backBtnText: {
    color: theme.colors.background2,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
