import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { StaffUser } from "@/services/userService";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

interface SettingProfileCardProps {
  user: StaffUser | null;
}

export const getTwoInitials = (name?: string | null) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
};

export const SettingProfileCard: React.FC<SettingProfileCardProps> = ({
  user,
}) => {
  return (
    <View style={styles.avatarSection}>
      <View style={styles.conAvatarTxt}>
        <LinearGradient
          colors={[AppColors.secondary, AppColors.primary]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          locations={[0.3, 0.9]}
          style={styles.avatarCircle}
        >
          <Text style={styles.avatarInitial}>{getTwoInitials(user?.name)}</Text>
        </LinearGradient>

        <View style={styles.conName}>
          <Text style={styles.userName}>{user?.name ?? "Name"}</Text>
          <Text style={styles.txtUserName}>
            @{user?.username ?? "username"}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarSection: {
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 10,
    overflow: "hidden",
  },
  conAvatarTxt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarCircle: {
    width: 45,
    height: 45,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    ...Platform.select({
      web: {
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
      },
      default: {
        shadowOffset: { width: 0, height: 4 },
        shadowColor: AppColors.secondary,
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
    }),
  },
  avatarInitial: {
    fontSize: 18,
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  conName: {},
  userName: {
    fontSize: 18,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  txtUserName: {
    fontSize: 10,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
});
