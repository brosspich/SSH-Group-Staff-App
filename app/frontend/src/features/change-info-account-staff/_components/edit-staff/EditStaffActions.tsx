import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { editStaffStyles as styles } from "./EditStaffStyles";

interface EditStaffActionsProps {
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export const EditStaffActions: React.FC<EditStaffActionsProps> = ({
  saving,
  onCancel,
  onSave,
}) => {
  const { t } = useLanguage();

  return (
    <View style={styles.actionRow}>
      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={onCancel}
        disabled={saving}
        activeOpacity={0.7}
      >
        <Text
          style={styles.cancelBtnText}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {t("changeInfoStaff.cancel", "Cancel")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.saveBtn, saving && { opacity: 0.6 }]}
        onPress={onSave}
        disabled={saving}
        activeOpacity={0.8}
      >
        {saving ? (
          <ActivityIndicator size="small" color={theme.colors.background2} />
        ) : (
          <Text
            style={styles.saveBtnText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {t("changeInfoStaff.saveChanges", "Save Changes")}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
