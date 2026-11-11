import { useLanguage } from "@/features/language";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { StaffUser, userService } from "@/shared/services/userService";
import { theme } from "@/shared/styles/theme";
import { hashPassword } from "@/utils/passwordUtils";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  checkUsernameConflictApi,
  updateUserFieldApi,
} from "../_api/informationApi";
import type { FieldKey } from "../_types/information.types";
import { FIELD_CONFIG, getInitialFieldValue } from "../_utils/informationUtils";

interface EditFieldModalProps {
  visible: boolean;
  fieldKey: FieldKey | null;
  user: StaffUser | null;
  onClose: () => void;
  onSaved: (updated: StaffUser) => void;
}

export const EditFieldModal: React.FC<EditFieldModalProps> = ({
  visible,
  fieldKey,
  user,
  onClose,
  onSaved,
}) => {
  const { t } = useLanguage();
  const [value, setValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { isMobile } = useResponsive();
  const config = fieldKey ? FIELD_CONFIG[fieldKey] : null;
  const isPassword = fieldKey === "password";

  useEffect(() => {
    if (visible && fieldKey && user) {
      setValue(getInitialFieldValue(user, fieldKey));
      setError(null);
      setShowPassword(false);
    }
  }, [visible, fieldKey, user]);

  const handleSave = async () => {
    if (!user || !fieldKey || !config) return;

    const trimmed = value.trim();
    const validationError = config.validate(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (fieldKey === "username" && trimmed !== user.username) {
        const isConflict = await checkUsernameConflictApi(trimmed, user.id);
        if (isConflict) {
          setError(
            t("account.usernameTaken", "This username is already taken"),
          );
          setSaving(false);
          return;
        }
      }

      const valueToSave =
        fieldKey === "password" ? hashPassword(trimmed) : trimmed;

      const updated = await updateUserFieldApi(user.id, fieldKey, valueToSave);

      await userService.save(updated);
      onSaved(updated);
      onClose();
    } catch (err: any) {
      setError(
        err?.message ??
          t("account.updateFailed", "Failed to update. Please try again."),
      );
    } finally {
      setSaving(false);
    }
  };

  if (!config) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              maxWidth: !isMobile ? 450 : "100%",
              width: !isMobile ? 450 : "100%",
            },
          ]}
        >
          <Text style={styles.title}>{config.title}</Text>

          <View style={styles.field}>
            <View style={{ position: "relative", justifyContent: "center" }}>
              <TextInput
                style={[
                  styles.input,
                  isPassword && { paddingRight: 42 },
                  error && styles.inputError,
                ]}
                value={value}
                onChangeText={(v) => {
                  let nextVal = v;
                  if (config.formatInput) {
                    nextVal = config.formatInput(v, value);
                  } else if (config.stripSpaces) {
                    nextVal = v.replace(/\s/g, "");
                  }
                  setValue(nextVal);
                }}
                placeholder={config.placeholder}
                placeholderTextColor={theme.colors.grey}
                autoCapitalize={config.autoCapitalize ?? "sentences"}
                autoCorrect={false}
                keyboardType={config.keyboardType}
                secureTextEntry={isPassword && !showPassword}
                autoFocus
              />
              {isPassword && (
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword((prev) => !prev)}
                  hitSlop={8}
                >
                  <MaterialIcons
                    name={showPassword ? "visibility-off" : "visibility"}
                    size={20}
                    color={theme.colors.grey}
                  />
                </TouchableOpacity>
              )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.cancelBtn]}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={styles.cancelText}>
                {t("common.cancel", "Cancel")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.saveBtn]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator
                  color={theme.colors.background2}
                  size="small"
                />
              ) : (
                <Text style={styles.saveText}>{t("common.save", "Save")}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  container: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    // fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    textAlign: "center",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  field: {
    marginBottom: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSizes.xs,
    marginTop: theme.spacing.xs,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  eyeBtn: {
    position: "absolute",
    right: theme.spacing.md,
    height: "100%",
    justifyContent: "center",
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  btn: {
    flex: 1,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: theme.colors.secondary,
  },
  cancelText: {
    color: theme.colors.secondary,
    // fontWeight: "600",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  saveBtn: {
    backgroundColor: theme.colors.secondary,
  },
  saveText: {
    color: theme.colors.background2,
    // fontWeight: "700",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
