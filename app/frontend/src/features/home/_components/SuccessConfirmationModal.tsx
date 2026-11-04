import type { AttendanceRecord } from "@/app/(tabs)/index";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface SuccessConfirmationModalProps {
  visible: boolean;
  savingAttendance: boolean;
  lastRecord: AttendanceRecord | null;
  onConfirm: () => void;
  onClose: () => void;
}

export default function SuccessConfirmationModal({
  visible,
  savingAttendance,
  lastRecord,
  onConfirm,
  onClose,
}: SuccessConfirmationModalProps) {
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
              color={AppColors.background2}
            />
          </View>

          <Text style={styles.successTitle}>
            {savingAttendance
              ? "Recording Attendance..."
              : "Confirm Attendance"}
          </Text>

          {lastRecord && (
            <View style={styles.successDetails}>
              <View style={styles.successDetailRow}>
                <Text style={styles.successDetailLabel}>Staff Name:</Text>
                <Text style={styles.successDetailValue}>{lastRecord.name}</Text>
              </View>

              <View style={styles.successDetailRow}>
                <Text style={styles.successDetailLabel}>Staff ID:</Text>
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
                          ? "#dce0fc"
                          : lastRecord.type === "time-out"
                            ? "#fedbdb"
                            : "#f3e8ff",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.historyBadgeText,
                      {
                        color:
                          lastRecord.type === "time-in"
                            ? "#0022ff"
                            : lastRecord.type === "time-out"
                              ? "#ff0000"
                              : "#7e22ce",
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

          <View style={{ width: "100%", gap: 10 }}>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={onConfirm}
              disabled={savingAttendance}
              activeOpacity={0.85}
            >
              {savingAttendance ? (
                <ActivityIndicator size="small" color={AppColors.background2} />
              ) : (
                <>
                  <Ionicons
                    name="send-outline"
                    size={16}
                    color={AppColors.background2}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.successCloseText}>Submit</Text>
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
                    { color: AppColors.textPrimary },
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
}

const styles = StyleSheet.create({
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  successCard: {
    backgroundColor: AppColors.background2,
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
  },
  successIconCircle: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 14,
    backgroundColor: AppColors.secondary,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  successDetails: {
    width: "100%",
    backgroundColor: AppColors.background,
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    gap: 10,
  },
  successDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  successDetailLabel: {
    fontSize: 12.5,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  successDetailValue: {
    fontSize: 13.5,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  historyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  historyBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  successBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: AppColors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: `${AppColors.grey}15`,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: `${AppColors.grey}30`,
  },
  successCloseText: {
    color: AppColors.background2,
    fontWeight: "bold",
    fontSize: 15,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
