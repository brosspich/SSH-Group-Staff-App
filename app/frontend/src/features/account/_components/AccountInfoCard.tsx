import { InfoRow } from "@/shared/components/account/InfoRow";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import type { StaffUser } from "@/services/userService";
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
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: AppColors.textSecondary ?? AppColors.grey,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  card: {
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
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
