import { useLanguage } from "@/features/language";
import { InfoRow } from "@/shared/components/account/InfoRow";
import type { StaffUser } from "@/shared/services/userService";
import { theme } from "@/shared/styles/theme";
import { formatJoinedDisplay } from "@/utils/formatters";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

interface AccountInfoCardProps {
  user: StaffUser | null;
}

export const AccountInfoCard: React.FC<AccountInfoCardProps> = ({ user }) => {
  const { t } = useLanguage();
  const rawJoinedDate = user?.joined || user?.created_at;
  const joinedDate = formatJoinedDisplay(rawJoinedDate);
  const noneText = t("common.none", "None");

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {t("account.accountInfo", "Account Info")}
      </Text>
      <View style={styles.card}>
        <InfoRow
          icon={FontAwesome6}
          iconName="contact-card"
          label={t("account.id", "Staff ID")}
          value={user?.id ?? noneText}
        />
        <InfoRow
          icon={MaterialIcons}
          iconName="work"
          label={t("account.position", "Position")}
          value={user?.position ?? noneText}
        />
        <InfoRow
          icon={MaterialIcons}
          iconName="email"
          label={t("account.email", "Email")}
          value={user?.email ?? noneText}
        />
        <InfoRow
          icon={MaterialIcons}
          iconName="phone"
          label={t("account.phone", "Phone")}
          value={user?.phone ?? noneText}
        />
        <InfoRow
          icon={MaterialIcons}
          iconName="event"
          label={t("account.joined", "Joined")}
          value={joinedDate}
        />
        <InfoRow
          icon={MaterialIcons}
          iconName="event"
          label={t("account.dob", "Date of Birth")}
          value={user?.dob ? formatJoinedDisplay(user.dob) : noneText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary ?? theme.colors.grey,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: theme.spacing.sm,
    textAlign: "center",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  card: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    ...Platform.select({
      web: {
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
      },
      default: {
        ...theme.shadows.sm,
      },
    }),
  },
});
