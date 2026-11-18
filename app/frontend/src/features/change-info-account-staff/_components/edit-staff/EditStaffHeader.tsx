import { useLanguage } from "@/features/language";
import type { StaffUser } from "@/shared/services/userService";
import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { editStaffStyles as styles } from "./EditStaffStyles";

interface EditStaffHeaderProps {
  staff: StaffUser | null;
  onClose: () => void;
}

export const EditStaffHeader: React.FC<EditStaffHeaderProps> = ({
  staff,
  onClose,
}) => {
  const { t } = useLanguage();

  return (
    <View style={styles.headerRow}>
      <View>
        <Text style={styles.modalTitle}>
          {t("changeInfoStaff.editModalTitle", "Edit Staff Account")}
        </Text>
        <Text style={styles.modalSub}>
          {t("changeInfoStaff.idLabel", {
            id: staff?.id,
            defaultValue: `ID: ${staff?.id}`,
          })}{" "}
          • @{staff?.username}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onClose}
        style={styles.closeBtn}
        accessibilityLabel="Close"
      >
        <Ionicons name="close" size={30} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};
