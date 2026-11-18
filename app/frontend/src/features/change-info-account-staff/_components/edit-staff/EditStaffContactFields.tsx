import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import React from "react";
import { Text, TextInput, View } from "react-native";
import type { EditStaffFormData } from "../../_types/editStaff.types";
import { editStaffStyles as styles } from "./EditStaffStyles";

interface EditStaffContactFieldsProps {
  formData: EditStaffFormData;
  updateField: <K extends keyof EditStaffFormData>(
    field: K,
    value: EditStaffFormData[K],
  ) => void;
}

export const EditStaffContactFields: React.FC<EditStaffContactFieldsProps> = ({
  formData,
  updateField,
}) => {
  const { t } = useLanguage();

  return (
    <>
      {/* Contact: Phone & Email */}
      <View style={styles.rowFields}>
        <View style={{ flex: 1, marginRight: 6 }}>
          <Text style={styles.fieldLabel}>
            {t("changeInfoStaff.phone", "Phone")}
          </Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(v) => updateField("phone", v)}
            placeholder={t("changeInfoStaff.phonePlaceholder", "Phone")}
            placeholderTextColor={theme.colors.grey}
            keyboardType="phone-pad"
          />
        </View>
        <View style={{ flex: 1, marginLeft: 6 }}>
          <Text style={styles.fieldLabel}>
            {t("changeInfoStaff.email", "Email")}
          </Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(v) => updateField("email", v)}
            placeholder={t("changeInfoStaff.emailPlaceholder", "Email")}
            placeholderTextColor={theme.colors.grey}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Joined Date */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>
          {t("changeInfoStaff.joinedDate", "Joined Date (YYYY/MM/DD)")}
        </Text>
        <TextInput
          style={styles.input}
          value={formData.joined}
          onChangeText={(v) => updateField("joined", v)}
          placeholder="YYYY/MM/DD"
          placeholderTextColor={theme.colors.grey}
        />
      </View>

      {/* Date of Birth */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>
          {t("changeInfoStaff.dob", "Date of Birth (YYYY/MM/DD)")}
        </Text>
        <TextInput
          style={styles.input}
          value={formData.dob}
          onChangeText={(v) => updateField("dob", v)}
          placeholder="YYYY/MM/DD"
          placeholderTextColor={theme.colors.grey}
        />
      </View>
    </>
  );
};
