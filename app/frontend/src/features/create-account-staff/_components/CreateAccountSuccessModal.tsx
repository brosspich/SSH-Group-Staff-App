import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
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
            <Ionicons name="checkmark-sharp" size={42} color="#fff" />
          </View>
          <Text style={styles.modalTitle}>Account Created!</Text>
          <Text style={styles.modalMessage}>
            Staff account for{" "}
            <Text
              style={{ fontFamily: AppFonts.bold, color: AppColors.primary }}
            >
              {staffName || "Staff"}
            </Text>{" "}
            has been successfully created.
          </Text>

          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Staff ID:</Text>
              <Text style={styles.summaryVal}>{staffId}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>System ID:</Text>
              <Text style={styles.summaryVal}>{systemId}</Text>
            </View>
          </View>

          <View style={styles.modalBtnRow}>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnSecondary]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBtnSecText}>Add Another</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnPrimary]}
              onPress={() => {
                onClose();
                router.replace("/account-staff/ChangeInfoAccountStaff");
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBtnPriText}>View Staff List</Text>
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
    backgroundColor: AppColors.background2,
    borderRadius: 18,
    padding: 24,
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    borderWidth: 1,
    borderColor: `${AppColors.primary}33`,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: AppFonts.bold,
    color: AppColors.textPrimary,
    marginBottom: 8,
    includeFontPadding: false,
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: AppFonts.regular,
    color: AppColors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 18,
    includeFontPadding: false,
  },
  summaryBox: {
    width: "100%",
    backgroundColor: `${AppColors.background}99`,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: `${AppColors.grey}22`,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 13,
    fontFamily: AppFonts.regular,
    color: AppColors.textSecondary,
    includeFontPadding: false,
  },
  summaryVal: {
    fontSize: 13,
    fontFamily: AppFonts.bold,
    color: AppColors.textPrimary,
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
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: AppColors.primary,
  },
  modalBtnSecText: {
    color: AppColors.primary,
    fontFamily: AppFonts.bold,
    fontSize: 14,
    includeFontPadding: false,
  },
  modalBtnPrimary: {
    backgroundColor: AppColors.primary,
  },
  modalBtnPriText: {
    color: "#fff",
    fontFamily: AppFonts.bold,
    fontSize: 14,
    includeFontPadding: false,
  },
});
