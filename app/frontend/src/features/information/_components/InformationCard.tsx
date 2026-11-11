import { useLanguage } from "@/features/language";
import { InfoRow } from "@/shared/components/account/InfoRow";
import type { StaffUser } from "@/shared/services/userService";
import { theme } from "@/shared/styles/theme";
import { formatJoinedDisplay } from "@/utils/formatters";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import type { FieldKey } from "../_types/information.types";

interface InformationCardProps {
  user: StaffUser | null;
  onEditField: (field: FieldKey) => void;
}

export const InformationCard: React.FC<InformationCardProps> = ({
  user,
  onEditField,
}) => {
  const { t } = useLanguage();
  const rawJoinedDate = user?.joined || user?.created_at;
  const joinedDate = formatJoinedDisplay(rawJoinedDate);
  const noneText = t("common.none", "None");

  return (
    <View style={styles.section}>
      <View style={styles.card}>
        <InfoRow
          icon={FontAwesome6}
          iconName="contact-card"
          label={t("account.systemId", "System ID")}
          value={user?.system_id ?? noneText}
        />
        <InfoRow
          icon={FontAwesome6}
          iconName="contact-card"
          label={t("account.id", "Staff ID")}
          value={user?.id ?? noneText}
        />
        <InfoRow
          icon={MaterialIcons}
          iconName="badge"
          label={t("account.name", "Full Name")}
          value={user?.name ?? noneText}
          edit={() => onEditField("name")}
        />
        <InfoRow
          icon={MaterialIcons}
          iconName="person"
          label={t("account.username", "Username")}
          value={user?.username ?? noneText}
          edit={() => onEditField("username")}
        />
        <InfoRow
          icon={MaterialIcons}
          iconName="work"
          label={t("account.position", "Position")}
          value={user?.position ?? noneText}
          edit={() => onEditField("position")}
        />
        <InfoRow
          icon={MaterialIcons}
          iconName="email"
          label={t("account.email", "Email")}
          value={user?.email ?? noneText}
          edit={() => onEditField("email")}
        />
        <InfoRow
          icon={MaterialIcons}
          iconName="phone"
          label={t("account.phone", "Phone")}
          value={user?.phone ?? noneText}
          edit={() => onEditField("phone")}
        />
        <InfoRow
          icon={MaterialIcons}
          iconName="lock"
          label={t("common.password", "Password")}
          value="........................"
          edit={() => onEditField("password")}
        />
        <InfoRow
          icon={MaterialIcons}
          iconName="event"
          label={t("account.joined", "Joined")}
          value={joinedDate}
          edit={() => onEditField("joined")}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    ...theme.shadows.sm,
  },
});
