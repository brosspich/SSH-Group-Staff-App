import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useResponsive } from "@/hooks/useResponsive";
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
                  config.type === "destructive" ? "#ffebee" : "#e3f2fd",
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
                config.type === "destructive" ? "#e53935" : AppColors.secondary
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
              <Text style={styles.alertCancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.alertConfirmBtn,
                {
                  backgroundColor:
                    config.type === "destructive"
                      ? "#e53935"
                      : AppColors.secondary,
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
    backgroundColor: AppColors.background2,
    borderRadius: 20,
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
    fontSize: 18,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    color: AppColors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  alertBodyText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontFamily: AppFonts.regular,
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
    borderRadius: 10,
    backgroundColor: AppColors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  alertCancelText: {
    fontSize: 15,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    color: AppColors.textPrimary,
  },
  alertConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  alertConfirmText: {
    fontSize: 15,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    color: "#ffffff",
  },
});
