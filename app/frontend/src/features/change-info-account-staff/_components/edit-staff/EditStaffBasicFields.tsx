import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import React from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { EditStaffFormData } from "../../_types/editStaff.types";
import { COMMON_POSITIONS } from "../../_utils/editStaffConstants";
import { editStaffStyles as styles } from "./EditStaffStyles";

interface EditStaffBasicFieldsProps {
  formData: EditStaffFormData;
  updateField: <K extends keyof EditStaffFormData>(
    field: K,
    value: EditStaffFormData[K],
  ) => void;
  isOwner: boolean;
}

export const EditStaffBasicFields: React.FC<EditStaffBasicFieldsProps> = ({
  formData,
  updateField,
  isOwner,
}) => {
  const { t } = useLanguage();

  return (
    <>
      {/* Full Name */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>
          {t("changeInfoStaff.fullName", "Full Name")}
        </Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(v) => updateField("name", v)}
          placeholder={t("changeInfoStaff.fullNamePlaceholder", "Full name")}
          placeholderTextColor={theme.colors.grey}
        />
      </View>

      {/* Username */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>
          {t("changeInfoStaff.username", "Username")}
        </Text>
        <TextInput
          style={styles.input}
          value={formData.username}
          onChangeText={(v) =>
            updateField("username", v.toLowerCase().replace(/\s/g, ""))
          }
          placeholder={t("changeInfoStaff.usernamePlaceholder", "Username")}
          placeholderTextColor={theme.colors.grey}
          autoCapitalize="none"
        />
      </View>

      {/* Position with Quick Selection Chips */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>
          {t("changeInfoStaff.position", "Position")}
        </Text>
        <TextInput
          style={styles.input}
          value={formData.position}
          onChangeText={(v) => updateField("position", v)}
          placeholder={t("changeInfoStaff.positionPlaceholder", "Position")}
          placeholderTextColor={theme.colors.grey}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 6 }}
        >
          {COMMON_POSITIONS.map((pos) => {
            const isSelected =
              formData.position.toLowerCase() === pos.toLowerCase();
            return (
              <TouchableOpacity
                key={pos}
                onPress={() => updateField("position", pos)}
                style={[
                  styles.quickChip,
                  isSelected && styles.quickChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.quickChipText,
                    isSelected && styles.quickChipTextSelected,
                  ]}
                >
                  {pos}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* System ID */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>
          {t("changeInfoStaff.systemId", "System ID")}
        </Text>
        <TextInput
          style={[
            styles.input,
            !isOwner && {
              backgroundColor: theme.colors.background,
              color: theme.colors.textSecondary,
            },
          ]}
          value={formData.systemId}
          onChangeText={(v) => updateField("systemId", v)}
          editable={isOwner}
          placeholder={t("changeInfoStaff.systemIdPlaceholder", "System ID")}
          placeholderTextColor={theme.colors.grey}
        />
      </View>
    </>
  );
};
