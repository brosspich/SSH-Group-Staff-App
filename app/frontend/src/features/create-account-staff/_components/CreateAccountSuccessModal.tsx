import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CreateAccountSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  staffName: string;
  staffId: string;
  systemId: string;
}

export const CreateAccountSuccessModal: React.FC<
  CreateAccountSuccessModalProps
> = ({ visible, onClose, staffName, staffId, systemId }) => {
  const { t } = useLanguage();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.successIconCircle}>
            <Ionicons
              name="checkmark-sharp"
              size={42}
              color={theme.colors.background2}
            />
          </View>
          <Text style={styles.modalTitle}>
            {t("createAccountStaff.accountCreated", "Account Created!")}
          </Text>
          <Text style={styles.modalMessage}>
            {t("createAccountStaff.accountCreatedDesc", {
              name: staffName || "Staff",
              defaultValue: `Staff account for ${staffName || "Staff"} has been successfully created.`,
            })}
          </Text>

          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {t("createAccountStaff.staffId", "Staff ID")}:
              </Text>
              <Text style={styles.summaryVal}>{staffId}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {t("account.systemId", "System ID")}:
              </Text>
              <Text style={styles.summaryVal}>{systemId}</Text>
            </View>
          </View>

          <View style={styles.modalBtnRow}>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnSecondary]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBtnSecText}>
                {t("createAccountStaff.addAnother", "Add Another")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnPrimary]}
              onPress={() => {
                onClose();
                router.replace("/account-staff/ChangeInfoAccountStaff");
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBtnPriText}>
                {t("createAccountStaff.viewStaffList", "View Staff List")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: theme.colors.background2,
    borderRadius: 18,
    padding: 24,
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    borderWidth: 1,
    borderColor: `${theme.colors.primary}33`,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textPrimary,
    marginBottom: 8,
    includeFontPadding: false,
  },
  modalMessage: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 18,
    includeFontPadding: false,
  },
  summaryBox: {
    width: "100%",
    backgroundColor: `${theme.colors.background}99`,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: `${theme.colors.grey}22`,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
    includeFontPadding: false,
  },
  summaryVal: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textPrimary,
    includeFontPadding: false,
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  modalBtnSecText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.sm,
    includeFontPadding: false,
  },
  modalBtnPrimary: {
    backgroundColor: theme.colors.primary,
  },
  modalBtnPriText: {
    color: theme.colors.background2,
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.sm,
    includeFontPadding: false,
  },
});
