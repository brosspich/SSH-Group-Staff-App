import { InfoRow } from "@/components/account/InfoRow";
import { AppColors } from "@/constants/appcolors";
import type { StaffUser } from "@/services/userService";
import { formatJoinedDisplay } from "@/utils/formatters";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import type { FieldKey } from "../_types/information.types";

interface InformationCardProps {
  user: StaffUser | null;
  onEditField: (field: FieldKey) => void;
}

export const InformationCard: React.FC<InformationCardProps> = ({
  user,
  onEditField,
}) => {
  const rawJoinedDate = user?.joined || user?.created_at;
  const joinedDate = formatJoinedDisplay(rawJoinedDate);

  return (
    <View style={styles.section}>
      <View style={styles.card}>
        <InfoRow
          icon={FontAwesome6}
          iconName="contact-card"
          label="System ID"
          value={user?.system_id ?? "None"}
        />
        <InfoRow
          icon={FontAwesome6}
          iconName="contact-card"
          label="Staff ID"
          value={user?.id ?? "None"}
        />
        <InfoRow
          icon={MaterialIcons}
          iconName="badge"
          label="Full Name"
          value={user?.name ?? "None"}
          edit={() => onEditField("name")}
        />
        <InfoRow
          icon={MaterialIcons}
          iconName="person"
          label="Username"
          value={user?.username ?? "None"}
          edit={() => onEditField("username")}
        />
        <InfoRow
          icon={MaterialIcons}
          iconName="work"
          label="Position"
          value={user?.position ?? "None"}
          edit={() => onEditField("position")}
        />
        <InfoRow
          icon={MaterialIcons}
          iconName="email"
          label="Email"
          value={user?.email ?? "None"}
          edit={() => onEditField("email")}
        />
        <InfoRow
          icon={MaterialIcons}
          iconName="phone"
          label="Phone"
          value={user?.phone ?? "None"}
          edit={() => onEditField("phone")}
        />
        <InfoRow
          icon={MaterialIcons}
          iconName="lock"
          label="Password"
          value="........................"
          edit={() => onEditField("password")}
        />
        <InfoRow
          icon={MaterialIcons}
          iconName="event"
          label="Joined"
          value={joinedDate}
          edit={() => onEditField("joined")}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 12,
    marginBottom: 10,
    marginTop: 10,
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
