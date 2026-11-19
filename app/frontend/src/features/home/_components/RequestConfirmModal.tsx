import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { formatDateYMD, isSameDay } from "../_utils/homeUtils";

export interface RequestConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  submitting: boolean;
  userName: string;
  userId: string;
  subject: string;
  remark: string;
  fromDate: Date;
  toDate: Date;
  fromTime: string;
  toTime: string;
  imageUri?: string | null;
  useModal?: boolean;
}

/**
 * Clean confirmation modal for attendance requests (SRP).
 */
export const RequestConfirmModal: React.FC<RequestConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  submitting,
  userName,
  userId,
  subject,
  remark,
  fromDate,
  toDate,
  fromTime,
  toTime,
  imageUri,
  useModal = false,
}) => {
  const { t } = useLanguage();

  if (!visible) return null;

  const content = (
    <View
      style={[
        styles.confirmOverlay,
        !useModal && StyleSheet.absoluteFill,
        !useModal && { zIndex: 1000, elevation: 1000 },
      ]}
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => {
          if (!submitting) onClose();
        }}
      />
      <View style={styles.confirmCard}>
        <View style={styles.confirmIconCircle}>
          <Ionicons
            name="alert-circle-outline"
            size={36}
            color={theme.colors.primary}
          />
        </View>

        <Text style={styles.confirmTitle}>
          {t("home.confirmRequest", "Confirm Request")}
        </Text>

        <View style={styles.confirmDetails}>
          <View style={styles.confirmDetailRow}>
            <Text style={styles.confirmDetailLabel}>
              {t("home.staff", "Staff")}:
            </Text>
            <Text style={styles.confirmDetailValue}>
              {userName} ({userId})
            </Text>
          </View>

          <View style={styles.confirmDetailRow}>
            <Text style={styles.confirmDetailLabel}>
              {t("home.subject", "Subject")}:
            </Text>
            <Text
              style={[
                styles.confirmDetailValue,
                { flex: 1, textAlign: "right" },
              ]}
              numberOfLines={2}
            >
              {subject.trim()}
            </Text>
          </View>

          <View style={styles.confirmDetailRow}>
            <Text style={styles.confirmDetailLabel}>
              {t("home.remark", "Remark")}:
            </Text>
            <Text
              style={[
                styles.confirmDetailValue,
                { flex: 1, textAlign: "right" },
              ]}
              numberOfLines={3}
            >
              {remark.trim()}
            </Text>
          </View>

          <View style={styles.confirmDetailRow}>
            <Text style={styles.confirmDetailLabel}>
              {t("home.date", "Date")}:
            </Text>
            <Text style={styles.confirmDetailValue}>
              {isSameDay(fromDate, toDate)
                ? formatDateYMD(fromDate)
                : `${formatDateYMD(fromDate)} to ${formatDateYMD(toDate)}`}
            </Text>
          </View>

          <View style={styles.confirmDetailRow}>
            <Text style={styles.confirmDetailLabel}>
              {t("home.time", "Time")}:
            </Text>
            <Text style={styles.confirmDetailValue}>
              {`${fromTime} - ${toTime}`}
            </Text>
          </View>

          {imageUri && (
            <View style={styles.confirmDetailRow}>
              <Text style={styles.confirmDetailLabel}>
                {t("home.proofPhoto", "Proof Photo")}:
              </Text>
              <Image
                source={{ uri: imageUri }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 6,
                  backgroundColor: theme.colors.background,
                }}
              />
            </View>
          )}
        </View>

        <View style={{ width: "100%", gap: 10 }}>
          <TouchableOpacity
            style={styles.confirmSubmitBtn}
            onPress={onConfirm}
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
                  name="send-outline"
                  size={16}
                  color={theme.colors.background2}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.confirmBtnText}>
                  {t("common.submit", "Submit")}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {!submitting && (
            <TouchableOpacity
              style={styles.confirmCancelBtn}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.confirmBtnText,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {t("common.cancel", "Cancel")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  if (useModal) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          if (!submitting) onClose();
        }}
      >
        {content}
      </Modal>
    );
  }

  return content;
};

export default RequestConfirmModal;

const styles = StyleSheet.create({
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  confirmCard: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.xl,
    padding: 24,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    ...theme.shadows.lg,
  },
  confirmIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textPrimary,
    marginBottom: 16,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    textAlign: "center",
  },
  confirmDetails: {
    width: "100%",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  confirmDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  confirmDetailLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    width: 90,
  },
  confirmDetailValue: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  confirmSubmitBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  confirmCancelBtn: {
    backgroundColor: theme.colors.background,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnText: {
    color: theme.colors.background2,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
