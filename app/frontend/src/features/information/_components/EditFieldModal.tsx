import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useResponsive } from "@/hooks/useResponsive";
import { StaffUser, userService } from "@/services/userService";
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
          setError("This username is already taken");
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
      setError(err?.message ?? "Failed to update. Please try again.");
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
                placeholderTextColor={AppColors.grey}
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
                    color={AppColors.grey}
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
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.saveBtn]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveText}>Save</Text>
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
    padding: 20,
  },
  container: {
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginBottom: 16,
    textAlign: "center",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  field: {
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: AppColors.secondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  inputError: {
    borderColor: AppColors.red,
  },
  errorText: {
    color: AppColors.red,
    fontSize: 12,
    marginTop: 4,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    height: "100%",
    justifyContent: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  btn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: AppColors.secondary,
  },
  cancelText: {
    color: AppColors.secondary,
    fontWeight: "600",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  saveBtn: {
    backgroundColor: AppColors.secondary,
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
