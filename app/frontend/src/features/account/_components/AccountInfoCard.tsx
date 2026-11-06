import { InfoRow } from "@/shared/components/account/InfoRow";
import { theme } from "@/shared/styles/theme";
import type { StaffUser } from "@/shared/services/userService";
import { formatJoinedDisplay } from "@/utils/formatters";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

interface AccountInfoCardProps {
  user: StaffUser | null;
}

export const AccountInfoCard: React.FC<AccountInfoCardProps> = ({ user }) => {
  const rawJoinedDate = user?.joined || user?.created_at;
  const joinedDate = formatJoinedDisplay(rawJoinedDate);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Account Info</Text>
      <View style={styles.card}>
        <InfoRow
          icon={FontAwesome6}
          iconName="contact-card"
          label="Staff ID"
          value={user?.id ?? "None"}
        />
        <InfoRow
          icon={MaterialIcons}
          iconName="work"
          label="Position"
          value={user?.position ?? "None"}
        />
        <InfoRow
          icon={MaterialIcons}
          iconName="email"
          label="Email"
          value={user?.email ?? "None"}
        />
        <InfoRow
          icon={MaterialIcons}
          iconName="phone"
          label="Phone"
          value={user?.phone ?? "None"}
        />
        <InfoRow
          icon={MaterialIcons}
          iconName="event"
          label="Joined"
          value={joinedDate}
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
    fontWeight: "700",
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
        shadowOffset: { width: 0, height: 2 },
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
});
