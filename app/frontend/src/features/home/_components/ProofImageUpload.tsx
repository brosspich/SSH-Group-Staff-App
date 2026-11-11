import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface ProofImageUploadProps {
  imageUri: string | null;
  onPressUpload: () => void;
  onRemoveImage: () => void;
  disabled?: boolean;
  error?: string | null;
  label?: string;
  required?: boolean;
}

/**
 * Reusable Proof Image Upload Component for attendance & request modals (SOLID/DRY).
 */
export const ProofImageUpload: React.FC<ProofImageUploadProps> = ({
  imageUri,
  onPressUpload,
  onRemoveImage,
  disabled = false,
  error = null,
  label,
  required = false,
}) => {
  const { t } = useLanguage();
  const displayLabel = label ?? t("home.proofPhoto", "Proof Photo");

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {displayLabel}{" "}
        {required ? <Text style={styles.requiredStar}>*</Text> : null}
      </Text>

      {imageUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.changeBtn}
              onPress={onPressUpload}
              disabled={disabled}
              activeOpacity={0.75}
            >
              <Ionicons
                name="camera-outline"
                size={16}
                color={theme.colors.primary}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.changeText}>
                {t("home.changePhoto", "Change Photo")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.removeBtn}
              onPress={onRemoveImage}
              disabled={disabled}
              activeOpacity={0.75}
            >
              <Ionicons
                name="trash-outline"
                size={16}
                color={theme.colors.error}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.removeText}>
                {t("home.removePhoto", "Remove Photo")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.uploadBox, error ? styles.inputErrorBorder : null]}
          onPress={onPressUpload}
          disabled={disabled}
          activeOpacity={0.75}
        >
          <View style={styles.uploadIconCircle}>
            <Ionicons
              name="cloud-upload-outline"
              size={28}
              color={theme.colors.primary}
            />
          </View>
          <Text style={styles.uploadPromptTitle}>
            {t("home.chooseProofPhoto", "Choose proof photo")}
          </Text>
          <Text style={styles.uploadPromptSub}>
            {t("home.takeOrChooseGallery", "Take photo or choose from gallery")}
          </Text>
        </TouchableOpacity>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

export default ProofImageUpload;

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    marginBottom: theme.spacing.xs,
  },
  requiredStar: {
    color: theme.colors.error,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: `${theme.colors.primary}40`,
    borderStyle: "dashed",
    borderRadius: theme.borderRadius.lg,
    backgroundColor: `${theme.colors.primary}06`,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
  },
  uploadPromptTitle: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  uploadPromptSub: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    color: theme.colors.grey,
    textAlign: "center",
  },
  previewContainer: {
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    padding: theme.spacing.sm,
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: theme.borderRadius.md,
    resizeMode: "cover",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  changeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.primary}12`,
  },
  changeText: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    color: theme.colors.primary,
  },
  removeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.error}12`,
  },
  removeText: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    color: theme.colors.error,
  },
  inputErrorBorder: {
    borderColor: theme.colors.error,
    backgroundColor: `${theme.colors.error}08`,
  },
  errorText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.error,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    marginTop: 4,
  },
});
