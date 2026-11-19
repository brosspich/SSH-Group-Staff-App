import { useLanguage } from "@/features/language";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface ImageSourceModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCamera: () => void;
  onSelectGallery: () => void;
  title?: string;
  subtitle?: string;
  useModal?: boolean;
}

export const ImageSourceModal: React.FC<ImageSourceModalProps> = ({
  visible,
  onClose,
  onSelectCamera,
  onSelectGallery,
  title,
  subtitle,
  useModal = false,
}) => {
  const { isMobile } = useResponsive();
  const { t } = useLanguage();

  if (!visible) return null;

  const displayTitle =
    title ?? t("home.uploadProofImage", "Upload Proof Image");
  const displaySubtitle =
    subtitle ?? t("home.selectImageSource", "Select image source:");

  const content = (
    <View
      style={[
        styles.overlay,
        !useModal && StyleSheet.absoluteFill,
        !useModal && { zIndex: 9999, elevation: 9999 },
      ]}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={[styles.card, { maxWidth: isMobile ? "100%" : 380 }]}>
        <Text style={styles.title}>{displayTitle}</Text>
        <Text style={styles.subtitle}>{displaySubtitle}</Text>

        <View style={styles.gridRow}>
          {/* Gallery Option */}
          <TouchableOpacity
            style={styles.sourceCard}
            onPress={onSelectGallery}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: `${theme.colors.primary}15` },
              ]}
            >
              <Ionicons
                name="images-outline"
                size={30}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.sourceText}>
              {t("home.gallery", "Gallery")}
            </Text>
          </TouchableOpacity>

          {/* Take Photo Option */}
          <TouchableOpacity
            style={styles.sourceCard}
            onPress={onSelectCamera}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: `${theme.colors.secondary}15` },
              ]}
            >
              <Ionicons
                name="camera-outline"
                size={30}
                color={theme.colors.secondary}
              />
            </View>
            <Text style={styles.sourceText}>
              {t("home.takePhoto", "Take Photo")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelText}>{t("common.cancel", "Cancel")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (useModal) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        {content}
      </Modal>
    );
  }

  return content;
};

export default ImageSourceModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  card: {
    width: "100%",
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: "center",
    ...theme.shadows.lg,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    marginBottom: theme.spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    marginBottom: theme.spacing.xl,
    textAlign: "center",
  },
  gridRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    width: "100%",
    justifyContent: "center",
    marginBottom: theme.spacing.xl,
  },
  sourceCard: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
  },
  sourceText: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    color: theme.colors.textPrimary,
  },
  cancelBtn: {
    width: "100%",
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  cancelText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    color: theme.colors.textSecondary,
  },
});
