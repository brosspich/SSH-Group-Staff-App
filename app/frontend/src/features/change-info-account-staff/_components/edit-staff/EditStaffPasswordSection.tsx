import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { editStaffStyles as styles } from "./EditStaffStyles";

interface EditStaffPasswordSectionProps {
  wantResetPassword: boolean;
  setWantResetPassword: (want: boolean) => void;
  newPassword: string;
  setNewPassword: (pw: string) => void;
  confirmPassword: string;
  setConfirmPassword: (pw: string) => void;
  showNewPassword: boolean;
  setShowNewPassword: (show: boolean) => void;
}

export const EditStaffPasswordSection: React.FC<
  EditStaffPasswordSectionProps
> = ({
  wantResetPassword,
  setWantResetPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showNewPassword,
  setShowNewPassword,
}) => {
  const { t } = useLanguage();

  return (
    <View style={styles.resetPasswordCard}>
      <TouchableOpacity
        style={styles.resetPasswordHeader}
        onPress={() => setWantResetPassword(!wantResetPassword)}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons
            name="key-outline"
            size={20}
            color={wantResetPassword ? theme.colors.primary : theme.colors.grey}
            style={{ marginRight: 8 }}
          />
          <Text
            style={[
              styles.resetPasswordTitle,
              wantResetPassword && { color: theme.colors.primary },
            ]}
          >
            {t("changeInfoStaff.resetPasswordTitle", "Reset Staff Password")}
          </Text>
        </View>
        <Ionicons
          name={wantResetPassword ? "chevron-up" : "chevron-down"}
          size={20}
          color={theme.colors.grey}
        />
      </TouchableOpacity>

      {wantResetPassword && (
        <View style={{ marginTop: 12 }}>
          <Text style={styles.fieldLabel}>
            {t("changeInfoStaff.newPassword", "New Password")}
          </Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t(
                "changeInfoStaff.newPasswordPlaceholder",
                "Min 6 characters",
              )}
              placeholderTextColor={theme.colors.grey}
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={{ padding: 6 }}
            >
              <Ionicons
                name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={theme.colors.grey}
              />
            </TouchableOpacity>
          </View>

          <Text style={[styles.fieldLabel, { marginTop: 10 }]}>
            {t("changeInfoStaff.confirmNewPassword", "Confirm New Password")}
          </Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t(
                "changeInfoStaff.confirmNewPasswordPlaceholder",
                "Re-enter password",
              )}
              placeholderTextColor={theme.colors.grey}
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
            />
          </View>
        </View>
      )}
    </View>
  );
};
