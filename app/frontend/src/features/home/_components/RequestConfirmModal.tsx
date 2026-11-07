import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
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
}) => {
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
      <View style={styles.confirmOverlay}>
        <View style={styles.confirmCard}>
          <View style={styles.confirmIconCircle}>
            <Ionicons
              name="alert-circle-outline"
              size={36}
              color={theme.colors.primary}
            />
          </View>

          <Text style={styles.confirmTitle}>Confirm Request</Text>

          <View style={styles.confirmDetails}>
            <View style={styles.confirmDetailRow}>
              <Text style={styles.confirmDetailLabel}>Staff:</Text>
              <Text style={styles.confirmDetailValue}>
                {userName} ({userId})
              </Text>
            </View>

            <View style={styles.confirmDetailRow}>
              <Text style={styles.confirmDetailLabel}>Subject:</Text>
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
              <Text style={styles.confirmDetailLabel}>Remark:</Text>
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
              <Text style={styles.confirmDetailLabel}>Date:</Text>
              <Text style={styles.confirmDetailValue}>
                {isSameDay(fromDate, toDate)
                  ? formatDateYMD(fromDate)
                  : `${formatDateYMD(fromDate)} to ${formatDateYMD(toDate)}`}
              </Text>
            </View>

            <View style={styles.confirmDetailRow}>
              <Text style={styles.confirmDetailLabel}>Time:</Text>
              <Text style={styles.confirmDetailValue}>
                {`${fromTime} - ${toTime}`}
              </Text>
            </View>

            {imageUri && (
              <View style={styles.confirmDetailRow}>
                <Text style={styles.confirmDetailLabel}>Proof Photo:</Text>
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
                  <Text style={styles.confirmBtnText}>Submit</Text>
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
                  Cancel
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
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
  },
  confirmIconCircle: {
    marginBottom: 10,
    padding: 10,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: `${theme.colors.primary}15`,
  },
  confirmTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  confirmDetails: {
    width: "100%",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: 16,
    marginVertical: 16,
    gap: 10,
  },
  confirmDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  confirmDetailLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  confirmDetailValue: {
    fontSize: theme.fontSizes.sm,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  confirmSubmitBtn: {
    borderRadius: theme.borderRadius.md,
    paddingVertical: 12,
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmCancelBtn: {
    borderRadius: theme.borderRadius.md,
    paddingVertical: 12,
    backgroundColor: `${theme.colors.grey}15`,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: `${theme.colors.grey}30`,
  },
  confirmBtnText: {
    color: theme.colors.background2,
    fontWeight: "bold",
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
