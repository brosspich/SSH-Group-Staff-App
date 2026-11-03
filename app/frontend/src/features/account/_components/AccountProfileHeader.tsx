import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import type { StaffUser } from "@/services/userService";
import { getTwoInitials } from "@/utils/formatters";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

interface AccountProfileHeaderProps {
  user: StaffUser | null;
}

export const AccountProfileHeader: React.FC<AccountProfileHeaderProps> = ({
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
    alignItems: "center",
    paddingVertical: 15,
    gap: 10,
    flexDirection: "row",
    marginHorizontal: 15,
    backgroundColor: AppColors.background2,
    paddingHorizontal: 13,
    borderRadius: 12,
    marginVertical: 12,
    justifyContent: "space-between",
    ...Platform.select({
      web: {
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
      },
      default: {
        shadowOffset: { width: 0, height: 2 },
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  conAvatarTxt: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  avatarCircle: {
    width: 65,
    height: 65,
    borderRadius: 12,
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
    fontSize: 24,
    fontWeight: "700",
    color: AppColors.background2,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  conName: {},
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    letterSpacing: -0.3,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  txtUserName: {
    fontSize: 12,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
});
