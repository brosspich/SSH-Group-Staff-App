import { useLanguage } from "@/features/language";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { theme } from "@/shared/styles/theme";
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
  const { isKhmer } = useLanguage();
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
          <Text style={styles.selfDestructTitle}>
            {isKhmer
              ? "បិទសម័យប្រជុំដោយស្វ័យប្រវត្តិ"
              : "Sessions self-destruct"}
          </Text>

          {INACTIVE_PERIODS.map((period) => {
            const isSelected = currentPeriod === period;
            return (
              <Pressable
                key={period}
                style={({ pressed }) => [
                  styles.radioOptionRow,
                  {
                    backgroundColor: pressed
                      ? `${theme.colors.grey}33`
                      : theme.colors.transparent,
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
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    width: "100%",
  },
  selfDestructTitle: {
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    color: theme.colors.textPrimary,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  radioOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    borderRadius: theme.borderRadius.sm,
  },
  radioCircleOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.textSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  radioCircleOuterActive: {
    borderColor: theme.colors.secondary,
  },
  radioCircleInner: {
    width: 12,
    height: 12,
    borderRadius: theme.borderRadius.xs,
    backgroundColor: theme.colors.secondary,
  },
  radioOptionText: {
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    color: theme.colors.textPrimary,
  },
});
