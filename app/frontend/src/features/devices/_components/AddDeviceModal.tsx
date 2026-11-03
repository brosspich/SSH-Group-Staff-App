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

interface AddDeviceModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddDeviceModal({
  visible,
  onClose,
}: AddDeviceModalProps) {
  const { isMobile } = useResponsive();

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
            { borderRadius: 24 },
            !isMobile && {
              maxWidth: 400,
              alignSelf: "center",
            },
          ]}
        >
          <View style={styles.modalHeaderContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="rocket-outline" size={32} color="#ff9800" />
            </View>
            <Text style={styles.modalDeviceName}>Coming Soon</Text>
            <Text style={styles.modalStatusTime}>
              Feature Under Development
            </Text>
          </View>

          <View style={styles.bodyContainer}>
            <Text style={styles.bodyText}>
              The option to add devices via QR Code scanning is coming soon! You
              will be able to link new devices instantly in a future update.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.gotItBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.gotItText}>Got It</Text>
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
    backgroundColor: AppColors.background2,
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
    backgroundColor: "#fff3e0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalDeviceName: {
    fontSize: 18,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    color: AppColors.textPrimary,
  },
  modalStatusTime: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    marginTop: 4,
  },
  bodyContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  bodyText: {
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    color: AppColors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  gotItBtn: {
    backgroundColor: AppColors.secondary,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  gotItText: {
    color: AppColors.background2,
    fontSize: 15,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
