import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface SettingAdminStaffSectionProps {
  isAdminOrOwner: boolean;
}

export const SettingAdminStaffSection: React.FC<
  SettingAdminStaffSectionProps
> = ({ isAdminOrOwner }) => {
  const { t } = useLanguage();
  if (!isAdminOrOwner) return null;

  function BtnItem({
    iconName,
    title,
    onPress,
  }: {
    iconName: keyof typeof Ionicons.glyphMap;
    title: string;
    onPress: () => void;
  }) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.conBtn,
          {
            backgroundColor: pressed
              ? `${theme.colors.grey}33`
              : theme.colors.transparent,
          },
        ]}
      >
        <View style={styles.iconTxt}>
          <View style={styles.conIcon}>
            <Ionicons
              name={iconName}
              size={20}
              color={theme.colors.textPrimary}
            />
          </View>
          <Text style={styles.txtTitle}>{title}</Text>
        </View>
        <Ionicons
          name="chevron-forward-outline"
          size={20}
          color={theme.colors.textPrimary}
        />
      </Pressable>
    );
  }

  function Border() {
    return <View style={styles.border} />;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t("setting.adminStaff")}</Text>
      <View style={styles.card}>
        <BtnItem
          onPress={() => router.push("/account-staff/CreateAccountStaff")}
          title={t("setting.createStaff")}
          iconName="person-outline"
        />
        <Border />
        <BtnItem
          onPress={() => router.push("/account-staff/ChangeInfoAccountStaff")}
          title={t("setting.editStaff")}
          iconName="create-outline"
        />
        <Border />
        <BtnItem
          onPress={() => router.push("/info-company/info-company" as any)}
          title={t("setting.companyInfo", "Company Information")}
          iconName="business-outline"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary ?? theme.colors.grey,
    textTransform: "uppercase",
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  card: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
  },
  conBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 7,
  },
  iconTxt: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  conIcon: {
    width: 35,
    height: 35,
    backgroundColor: `${theme.colors.grey}50`,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  txtTitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  border: {
    height: 0.3,
    flex: 1,
    backgroundColor: theme.colors.grey,
  },
});
