import { useLanguage } from "@/features/language";
import { StaffUser } from "@/shared/services/userService";
import { theme } from "@/shared/styles/theme";
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
  const { t } = useLanguage();

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
          <Text style={styles.userName}>
            {user?.name ?? t("account.name", "Name")}
          </Text>
          <Text style={styles.txtUserName}>
            @{user?.username ?? t("account.username", "username")}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarSection: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    overflow: "hidden",
  },
  conAvatarTxt: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  avatarCircle: {
    width: 45,
    height: 45,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xs,
    ...Platform.select({
      web: {
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
      },
      default: {
        ...theme.shadows.md,
      },
    }),
  },
  avatarInitial: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.background2,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  conName: {},
  userName: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textPrimary,
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
