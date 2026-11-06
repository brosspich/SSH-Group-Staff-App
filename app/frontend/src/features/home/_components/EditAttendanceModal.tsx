import { ImageSourceModal } from "@/features/home/_components/ImageSourceModal";
import { useEditAttendanceForm } from "@/features/home/_hooks/useEditAttendanceForm";
import type {
  AttendanceRecord,
  EditAttendanceSubmitPayload,
} from "@/features/home/_types/home.types";
import { renderAlertModal } from "@/shared/components/alert";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export interface EditAttendanceModalProps {
  visible: boolean;
  submitting: boolean;
  record: AttendanceRecord | null;
  onSubmit: (data: EditAttendanceSubmitPayload) => void;
  onClose: () => void;
}

export default function EditAttendanceModal({
  visible,
  submitting,
  record,
  onSubmit,
  onClose,
}: EditAttendanceModalProps) {
  const { isMobile } = useResponsive();

  const {
    selectedType,
    setSelectedType,
    remark,
    setRemark,
    imageUri,
    remarkError,
    setRemarkError,
    imageError,
    imageSourceModalVisible,
    setImageSourceModalVisible,
    genericAlert,
    dismissAlert,
    handlePickImage,
    handleRemoveImage,
    handleSubmit,
  } = useEditAttendanceForm({ visible, record, onSubmit });

  if (!record) return null;

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!submitting) onClose();
        }}
      >
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardAvoid}
          >
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.headerRow}>
                <View style={styles.headerTitleWrap}>
                  <View style={styles.headerIconCircle}>
                    <Ionicons
                      name="create-outline"
                      size={22}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text style={styles.headerTitle}>Edit Attendance</Text>
                </View>

                <TouchableOpacity
                  onPress={onClose}
                  disabled={submitting}
                  style={styles.headerCloseBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color={theme.colors.textSecondary || theme.colors.grey}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Staff Details Card */}
                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Staff Name</Text>
                    <Text style={styles.infoValue}>{record.name}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Staff ID</Text>
                    <Text style={styles.infoValue}>{record.staff_id}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Date</Text>
                    <Text style={styles.infoValue}>{record.date}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Time Logged</Text>
                    <Text style={styles.infoValue}>{record.time}</Text>
                  </View>
                </View>

                {/* Attendance Type Selector (Time-In or Time-Out) */}
                <Text style={styles.fieldLabel}>Select Attendance Type *</Text>
                <View style={styles.typeSelectorRow}>
                  <TouchableOpacity
                    style={[
                      styles.typeOptionBtn,
                      selectedType === "time-in" &&
                        styles.typeOptionBtnActiveIn,
                    ]}
                    onPress={() => setSelectedType("time-in")}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="log-in-outline"
                      size={20}
                      color={
                        selectedType === "time-in"
                          ? theme.colors.background2
                          : theme.colors.primary
                      }
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.typeOptionText,
                        selectedType === "time-in" &&
                          styles.typeOptionTextActiveIn,
                      ]}
                    >
                      Time-In
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.typeOptionBtn,
                      selectedType === "time-out" &&
                        styles.typeOptionBtnActiveOut,
                    ]}
                    onPress={() => setSelectedType("time-out")}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={20}
                      color={
                        selectedType === "time-out"
                          ? theme.colors.background2
                          : theme.colors.error
                      }
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.typeOptionText,
                        selectedType === "time-out" &&
                          styles.typeOptionTextActiveOut,
                      ]}
                    >
                      Time-Out
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Remark Input */}
                <View style={styles.fieldSection}>
                  <Text style={styles.fieldLabel}>Remark *</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      remarkError ? styles.inputErrorBorder : null,
                    ]}
                    placeholder="Enter reason for attendance adjustment..."
                    placeholderTextColor={theme.colors.grey}
                    value={remark}
                    onChangeText={(text) => {
                      setRemark(text);
                      if (remarkError && text.trim()) setRemarkError(null);
                    }}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  {remarkError && (
                    <Text style={styles.errorText}>{remarkError}</Text>
                  )}
                </View>

                {/* Proof Image Upload / Preview */}
                <View style={styles.fieldSection}>
                  <Text style={styles.fieldLabel}>Proof Image *</Text>
                  {imageUri ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image
                        source={{ uri: imageUri }}
                        style={styles.imagePreview}
                      />
                      <View style={styles.imageActionRow}>
                        <TouchableOpacity
                          style={styles.changeImageBtn}
                          onPress={() => setImageSourceModalVisible(true)}
                          disabled={submitting}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name="camera-outline"
                            size={16}
                            color={theme.colors.primary}
                            style={{ marginRight: 4 }}
                          />
                          <Text style={styles.changeImageText}>Change</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.removeImageBtn}
                          onPress={handleRemoveImage}
                          disabled={submitting}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color={theme.colors.error}
                            style={{ marginRight: 4 }}
                          />
                          <Text style={styles.removeImageText}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.uploadBox,
                        imageError ? styles.inputErrorBorder : null,
                      ]}
                      onPress={() => setImageSourceModalVisible(true)}
                      disabled={submitting}
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
                        Choose proof photo
                      </Text>
                      <Text style={styles.uploadPromptSub}>
                        Take photo or choose from gallery
                      </Text>
                    </TouchableOpacity>
                  )}
                  {imageError && (
                    <Text style={styles.errorText}>{imageError}</Text>
                  )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleSubmit}
                    disabled={submitting}
                    activeOpacity={0.85}
                  >
                    {submitting ? (
                      <ActivityIndicator
                        size="small"
                        color={theme.colors.background2}
                      />
                    ) : (
                      <>
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={20}
                          color={theme.colors.background2}
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.submitBtnText}>Submit</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={onClose}
                    disabled={submitting}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.closeBtnText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Reusable Image Source Selection Modal */}
      <ImageSourceModal
        visible={imageSourceModalVisible}
        onClose={() => setImageSourceModalVisible(false)}
        onSelectCamera={() => {
          setImageSourceModalVisible(false);
          handlePickImage(true);
        }}
        onSelectGallery={() => {
          setImageSourceModalVisible(false);
          handlePickImage(false);
        }}
      />

      {/* Shared Alert Modal */}
      {renderAlertModal({
        alertModalVisible: genericAlert.visible,
        setAlertModalVisible: (vis) => {
          if (!vis) dismissAlert();
        },
        title: genericAlert.title,
        bodyTxt: genericAlert.body,
        isMobile,
      })}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  keyboardAvoid: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "87%",
  },
  card: {
    backgroundColor: theme.colors.background2,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    width: "100%",
    maxHeight: "100%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  headerTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  headerCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `${theme.colors.grey}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  infoBox: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  infoValue: {
    fontSize: theme.fontSizes.sm,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  fieldSection: {
    marginBottom: theme.spacing.md,
  },
  fieldLabel: {
    fontSize: theme.fontSizes.sm,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    marginBottom: theme.spacing.sm,
  },
  typeSelectorRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  typeOptionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.08)",
    backgroundColor: theme.colors.background,
  },
  typeOptionBtnActiveIn: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeOptionBtnActiveOut: {
    backgroundColor: theme.colors.error,
    borderColor: theme.colors.error,
  },
  typeOptionText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  typeOptionTextActiveIn: {
    color: theme.colors.background2,
  },
  typeOptionTextActiveOut: {
    color: theme.colors.background2,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.regular,
    backgroundColor: theme.colors.background,
    minHeight: 76,
  },
  inputErrorBorder: {
    borderColor: theme.colors.error,
  },
  errorText: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.error,
    fontFamily: theme.fonts.regular,
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
  },
  uploadPromptSub: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    marginTop: 2,
    fontFamily: theme.fonts.regular,
  },
  imagePreviewContainer: {
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    backgroundColor: theme.colors.background,
  },
  imagePreview: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  imageActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background2,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  changeImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `${theme.colors.primary}12`,
  },
  changeImageText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: "bold",
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  removeImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `${theme.colors.error}12`,
  },
  removeImageText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: "bold",
    color: theme.colors.error,
    fontFamily: theme.fonts.bold,
  },
  actionRow: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {
    color: theme.colors.background2,
    fontSize: theme.fontSizes.sm,
    fontWeight: "bold",
    fontFamily: theme.fonts.bold,
  },
  closeBtn: {
    backgroundColor: `${theme.colors.grey}15`,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
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
  },
});
