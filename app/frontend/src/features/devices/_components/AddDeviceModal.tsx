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

interface AddDeviceModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddDeviceModal({
  visible,
  onClose,
}: AddDeviceModalProps) {
  const { isMobile } = useResponsive();
  const { t } = useLanguage();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.modalSheet,
            { borderRadius: theme.borderRadius.xl },
            !isMobile && {
              maxWidth: 400,
              alignSelf: "center",
            },
          ]}
        >
          <View style={styles.modalHeaderContainer}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="rocket-outline"
                size={32}
                color={theme.colors.warning}
              />
            </View>
            <Text style={styles.modalDeviceName}>
              {t("devices.comingSoon", "Coming Soon")}
            </Text>
            <Text style={styles.modalStatusTime}>
              {t("devices.featureUnderDev", "Feature Under Development")}
            </Text>
          </View>

          <View style={styles.bodyContainer}>
            <Text style={styles.bodyText}>
              {t(
                "devices.addDeviceDesc",
                "The option to add devices via QR Code scanning is coming soon! You will be able to link new devices instantly in a future update.",
              )}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.gotItBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.gotItText}>{t("devices.gotIt", "Got It")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalSheet: {
    backgroundColor: theme.colors.background2,
    padding: 24,
    width: "100%",
  },
  modalHeaderContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${theme.colors.warning}18`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalDeviceName: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    marginBottom: 4,
  },
  modalStatusTime: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  bodyContainer: {
    marginBottom: 24,
  },
  bodyText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  gotItBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  gotItText: {
    color: theme.colors.background2,
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
