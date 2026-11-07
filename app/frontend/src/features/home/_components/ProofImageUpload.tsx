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
  label = "Proof Photo",
  required = false,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required ? <Text style={styles.requiredStar}>*</Text> : null}
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
              <Text style={styles.changeText}>Change Photo</Text>
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
              <Text style={styles.removeText}>Remove Photo</Text>
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
          <Text style={styles.uploadPromptTitle}>Choose proof photo</Text>
          <Text style={styles.uploadPromptSub}>
            Take photo or choose from gallery
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
    fontWeight: "600",
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    marginBottom: theme.spacing.sm,
  },
  requiredStar: {
    color: theme.colors.error,
    fontWeight: "bold",
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: `${theme.colors.primary}60`,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${theme.colors.primary}08`,
  },
  inputErrorBorder: {
    borderColor: theme.colors.error,
  },
  uploadIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
  },
  uploadPromptTitle: {
    fontSize: theme.fontSizes.sm,
    fontWeight: "bold",
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  uploadPromptSub: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    marginTop: 2,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  previewContainer: {
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    backgroundColor: theme.colors.background,
  },
  previewImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background2,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  changeBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `${theme.colors.primary}12`,
  },
  changeText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: "bold",
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  removeBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `${theme.colors.error}12`,
  },
  removeText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: "bold",
    color: theme.colors.error,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  errorText: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.error,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
});
