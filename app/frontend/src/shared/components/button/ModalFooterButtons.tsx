import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

export type ModalFooterButtonVariant = "primary" | "danger" | "success";

export interface ModalFooterButtonsProps {
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
  closeText?: string;
  submitText?: string;
  submitting?: boolean;
  disabled?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap | null;
  variant?: ModalFooterButtonVariant;
  submitColor?: string;
  style?: StyleProp<ViewStyle>;
  noBorderTop?: boolean;
}

/**
 * Standardized, reusable modal footer action bar for consistent UI/UX (DRY & SOLID).
 * Left: Close/Cancel button (flex 1)
 * Right: Primary/Danger Submit button (flex 1.5) with loading indicator and icon support.
 */
export const ModalFooterButtons: React.FC<ModalFooterButtonsProps> = ({
  onClose,
  onSubmit,
  closeText = "Close",
  submitText = "Submit",
  submitting = false,
  disabled = false,
  iconName,
  variant = "primary",
  submitColor,
  style,
  noBorderTop = false,
}) => {
  // Determine effective icon if not explicitly provided or suppressed
  const resolvedIcon: keyof typeof Ionicons.glyphMap | null =
    iconName === null
      ? null
      : iconName ||
        (variant === "danger" ? "trash-outline" : "checkmark-circle-outline");

  // Determine button background color
  const resolvedSubmitColor =
    submitColor ||
    (variant === "danger" ? theme.colors.red : theme.colors.primary);

  return (
    <View style={[styles.actionRow, noBorderTop && styles.noBorderTop, style]}>
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={onClose}
        disabled={submitting}
        activeOpacity={0.8}
      >
        <Text style={styles.closeBtnText}>{closeText}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.submitBtn,
          { backgroundColor: resolvedSubmitColor },
          (disabled || submitting) && styles.submitBtnDisabled,
        ]}
        onPress={onSubmit}
        disabled={disabled || submitting}
        activeOpacity={0.85}
      >
        {submitting ? (
          <ActivityIndicator size="small" color={theme.colors.background2} />
        ) : (
          <>
            {resolvedIcon && (
              <Ionicons
                name={resolvedIcon}
                size={18}
                color={theme.colors.background2}
                style={{ marginRight: 6 }}
              />
            )}
            <Text style={styles.submitBtnText}>{submitText}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ModalFooterButtons;

const styles = StyleSheet.create({
  actionRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
    paddingTop: 12,
    backgroundColor: "transparent",
  },
  noBorderTop: {
    borderTopWidth: 0,
    paddingTop: 0,
  },
  closeBtn: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 12,
    backgroundColor: `${theme.colors.grey}15`,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: `${theme.colors.grey}30`,
  },
  closeBtnText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.sm,
    fontWeight: "bold",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  submitBtn: {
    flex: 1.5,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnDisabled: {
    opacity: 0.45,
  },
  submitBtnText: {
    color: theme.colors.background2,
    fontSize: theme.fontSizes.sm,
    fontWeight: "bold",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
