import { theme } from "@/shared/styles/theme";
import type { StaffUser } from "@/shared/services/userService";
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
          colors={[theme.colors.secondary, theme.colors.primary]}
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
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
    flexDirection: "row",
    marginHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background2,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.md,
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
    gap: theme.spacing.sm,
  },
  avatarCircle: {
    width: 65,
    height: 65,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xs,
    ...Platform.select({
      web: {
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
      },
      default: {
        shadowOffset: { width: 0, height: 4 },
        shadowColor: theme.colors.secondary,
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
    }),
  },
  avatarInitial: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: "700",
    color: theme.colors.background2,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  conName: {},
  userName: {
    fontSize: theme.fontSizes.xl,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    letterSpacing: -0.3,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  txtUserName: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
});
