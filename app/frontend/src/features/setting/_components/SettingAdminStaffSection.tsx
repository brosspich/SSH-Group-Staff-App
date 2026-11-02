import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
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
              ? `${AppColors.grey}33`
              : AppColors.transparent,
          },
        ]}
      >
        <View style={styles.iconTxt}>
          <View style={styles.conIcon}>
            <Ionicons
              name={iconName}
              size={20}
              color={AppColors.textPrimary}
            />
          </View>
          <Text style={styles.txtTitle}>{title}</Text>
        </View>
        <Ionicons
          name="chevron-forward-outline"
          size={20}
          color={AppColors.textPrimary}
        />
      </Pressable>
    );
  }

  function Border() {
    return <View style={styles.border} />;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Account Staff</Text>
      <View style={styles.card}>
        <BtnItem
          onPress={() => router.push("/account-staff/CreateAccountStaff")}
          title="Create Account Staff"
          iconName="person-outline"
        />
        <Border />
        <BtnItem
          onPress={() => router.push("/account-staff/ChangeInfoAccountStaff")}
          title="Change Info Account Staff"
          iconName="create-outline"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    color: AppColors.textSecondary ?? AppColors.grey,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 10,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  card: {
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    overflow: "hidden",
  },
  conBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  iconTxt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  conIcon: {
    width: 35,
    height: 35,
    backgroundColor: `${AppColors.grey}50`,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  txtTitle: {
    fontSize: 16,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  border: {
    height: 0.3,
    flex: 1,
    backgroundColor: AppColors.grey,
  },
});
