import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useResponsive } from "@/hooks/useResponsive";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type { InactivePeriod } from "../_types/devices.types";
import { INACTIVE_PERIODS } from "../_utils/devicesConstants";

interface SelfDestructModalProps {
  visible: boolean;
  currentPeriod: InactivePeriod;
  onSelectPeriod: (period: InactivePeriod) => void;
  onClose: () => void;
}

export default function SelfDestructModal({
  visible,
  currentPeriod,
  onSelectPeriod,
  onClose,
}: SelfDestructModalProps) {
  const { isMobile } = useResponsive();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.alertOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.selfDestructCard, !isMobile && { maxWidth: 400 }]}>
          <Text style={styles.selfDestructTitle}>Sessions self-destruct</Text>

          {INACTIVE_PERIODS.map((period) => {
            const isSelected = currentPeriod === period;
            return (
              <Pressable
                key={period}
                style={({ pressed }) => [
                  styles.radioOptionRow,
                  {
                    backgroundColor: pressed
                      ? `${AppColors.grey}33`
                      : AppColors.transparent,
                    paddingVertical: 16,
                  },
                ]}
                onPress={() => onSelectPeriod(period)}
              >
                <View
                  style={[
                    styles.radioCircleOuter,
                    isSelected && styles.radioCircleOuterActive,
                  ]}
                >
                  {isSelected && <View style={styles.radioCircleInner} />}
                </View>
                <Text style={styles.radioOptionText}>{period}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  selfDestructCard: {
    backgroundColor: AppColors.background2,
    borderRadius: 20,
    padding: 20,
    width: "100%",
  },
  selfDestructTitle: {
    fontSize: 16,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    color: AppColors.textPrimary,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  radioOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  radioCircleOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: AppColors.textSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  radioCircleOuterActive: {
    borderColor: AppColors.secondary,
  },
  radioCircleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: AppColors.secondary,
  },
  radioOptionText: {
    fontSize: 15,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    color: AppColors.textPrimary,
  },
});
