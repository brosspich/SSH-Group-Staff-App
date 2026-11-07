import { useResponsive } from "@/shared/hooks/useResponsive";
import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface ImageSourceModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCamera: () => void;
  onSelectGallery: () => void;
  title?: string;
  subtitle?: string;
}

export const ImageSourceModal: React.FC<ImageSourceModalProps> = ({
  visible,
  onClose,
  onSelectCamera,
  onSelectGallery,
  title = "Upload Proof Image",
  subtitle = "Select image source:",
}) => {
  const { isMobile } = useResponsive();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { maxWidth: isMobile ? "100%" : 380 }]}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

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
              <Text style={styles.sourceText}>Gallery</Text>
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
              <Text style={styles.sourceText}>Take Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ImageSourceModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    textAlign: "center",
    marginBottom: theme.spacing.xs,
    includeFontPadding: false,
  },
  subtitle: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    fontFamily: theme.fonts.regular,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
    includeFontPadding: false,
  },
  gridRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    width: "100%",
    marginBottom: theme.spacing.lg,
  },
  sourceCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.08)",
    backgroundColor: theme.colors.background,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
  },
  sourceText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  cancelBtn: {
    width: "100%",
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.grey}15`,
    borderWidth: 1,
    borderColor: `${theme.colors.grey}30`,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
