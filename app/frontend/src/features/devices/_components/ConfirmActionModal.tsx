import { useLanguage } from "@/features/language";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { AlertConfig } from "../_types/devices.types";

interface ConfirmActionModalProps {
  config: AlertConfig;
  onClose: () => void;
}

export default function ConfirmActionModal({
  config,
  onClose,
}: ConfirmActionModalProps) {
  const { t } = useLanguage();
  const { isMobile } = useResponsive();

  return (
    <Modal
      visible={config.visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.alertOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.alertCard, !isMobile && { maxWidth: 400 }]}>
          <View
            style={[
              styles.alertIconCircle,
              {
                backgroundColor:
                  config.type === "destructive"
                    ? `${theme.colors.error}18`
                    : `${theme.colors.info}18`,
              },
            ]}
          >
            <Ionicons
              name={
                config.type === "destructive"
                  ? "hand-left-outline"
                  : "information-circle-outline"
              }
              size={28}
              color={
                config.type === "destructive"
                  ? theme.colors.error
                  : theme.colors.secondary
              }
            />
          </View>

          <Text style={styles.alertTitleText}>{config.title}</Text>
          <Text style={styles.alertBodyText}>{config.body}</Text>

          <View style={styles.alertBtnRow}>
            <TouchableOpacity
              style={styles.alertCancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.alertCancelText}>{t("common.cancel")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.alertConfirmBtn,
                {
                  backgroundColor:
                    config.type === "destructive"
                      ? theme.colors.error
                      : theme.colors.secondary,
                },
              ]}
              onPress={async () => {
                onClose();
                if (config.onConfirm) {
                  await config.onConfirm();
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.alertConfirmText}>{config.confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  alertCard: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.xl,
    padding: 24,
    alignItems: "center",
    width: "100%",
    elevation: 8,
  },
  alertIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  alertTitleText: {
    fontSize: theme.fontSizes.lg,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    color: theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  alertBodyText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  alertBtnRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  alertCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  alertCancelText: {
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    color: theme.colors.textPrimary,
  },
  alertConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  alertConfirmText: {
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    color: theme.colors.background2,
  },
});
