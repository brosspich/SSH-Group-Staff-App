import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { AttendanceRecord } from "../_types/home.types";

export interface SuccessConfirmationModalProps {
  visible: boolean;
  savingAttendance: boolean;
  lastRecord: AttendanceRecord | null;
  onConfirm: () => void;
  onClose: () => void;
  onEdit?: () => void;
}

export default function SuccessConfirmationModal({
  visible,
  savingAttendance,
  lastRecord,
  onConfirm,
  onClose,
  onEdit,
}: SuccessConfirmationModalProps) {
  const { t, isKhmer } = useLanguage();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!savingAttendance) {
          onClose();
        }
      }}
    >
      <View style={styles.successOverlay}>
        <View style={styles.successCard}>
          <View style={styles.successIconCircle}>
            <Ionicons
              name="checkmark"
              size={40}
              color={theme.colors.background2}
            />
          </View>

          <Text style={styles.successTitle}>
            {savingAttendance
              ? isKhmer
                ? "កំពុងកត់ត្រាវត្តមាន..."
                : "Recording Attendance..."
              : isKhmer
                ? "បញ្ជាក់ការកត់ត្រាវត្តមាន"
                : "Confirm Attendance"}
          </Text>

          {lastRecord && (
            <View style={styles.successDetails}>
              <View style={styles.successDetailRow}>
                <Text style={styles.successDetailLabel}>
                  {isKhmer ? "ឈ្មោះបុគ្គលិក:" : "Staff Name:"}
                </Text>
                <Text style={styles.successDetailValue}>{lastRecord.name}</Text>
              </View>

              <View style={styles.successDetailRow}>
                <Text style={styles.successDetailLabel}>
                  {isKhmer ? "អត្តលេខបុគ្គលិក:" : "Staff ID:"}
                </Text>
                <Text style={styles.successDetailValue}>
                  {lastRecord.staff_id}
                </Text>
              </View>

              <View style={styles.successDetailRow}>
                <Text style={styles.successDetailLabel}>Scan Type:</Text>
                <View
                  style={[
                    styles.historyBadge,
                    {
                      backgroundColor:
                        lastRecord.type === "time-in"
                          ? theme.colors.timeInBg
                          : lastRecord.type === "time-out"
                            ? theme.colors.timeOutBg
                            : theme.colors.timeOtherBg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.historyBadgeText,
                      {
                        color:
                          lastRecord.type === "time-in"
                            ? theme.colors.timeIn
                            : lastRecord.type === "time-out"
                              ? theme.colors.timeOut
                              : theme.colors.timeOther,
                      },
                    ]}
                  >
                    {lastRecord.type.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.successDetailRow}>
                <Text style={styles.successDetailLabel}>Time Logged:</Text>
                <Text style={styles.successDetailValue}>{lastRecord.time}</Text>
              </View>

              <View style={styles.successDetailRow}>
                <Text style={styles.successDetailLabel}>Date:</Text>
                <Text style={styles.successDetailValue}>{lastRecord.date}</Text>
              </View>
            </View>
          )}

          {/* Edit Button */}
          <View style={styles.conEditBtn}>
            <TouchableOpacity
              onPress={onEdit}
              disabled={savingAttendance}
              activeOpacity={0.8}
              style={[
                styles.editIconButton,
                { opacity: savingAttendance ? 0.5 : 1 },
              ]}
            >
              <Ionicons
                name="create-outline"
                size={20}
                color={theme.colors.secondary}
              />
            </TouchableOpacity>
          </View>

          <View style={{ width: "100%", gap: theme.spacing.sm }}>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={onConfirm}
              disabled={savingAttendance}
              activeOpacity={0.85}
            >
              {savingAttendance ? (
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
                  <Text style={styles.successCloseText}>
                    {t("common.confirm")}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {!savingAttendance && (
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.successCloseText,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  successCard: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
  },
  successIconCircle: {
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.secondary,
  },
  successTitle: {
    fontSize: theme.fontSizes.xl,
    // fontWeight: "bold",
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  successDetails: {
    width: "100%",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  successDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  successDetailLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  successDetailValue: {
    fontSize: theme.fontSizes.sm,
    // fontWeight: "bold",
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  historyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  historyBadgeText: {
    fontSize: theme.fontSizes.xs,
    // fontWeight: "bold",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  conEditBtn: {
    position: "absolute",
    top: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 10,
  },
  editIconButton: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `${theme.colors.secondary}15`,
    borderWidth: 1,
    borderColor: `${theme.colors.secondary}30`,
    alignItems: "center",
    justifyContent: "center",
  },
  successBtn: {
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: `${theme.colors.grey}15`,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: `${theme.colors.grey}30`,
  },
  successCloseText: {
    color: theme.colors.background2,
    // fontWeight: "bold",
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
