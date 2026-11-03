import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface WeeklyRangeSelectorCardProps {
  periodLabel: string;
  weekOffset: number;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

export function WeeklyRangeSelectorCard({
  periodLabel,
  weekOffset,
  onPrevWeek,
  onNextWeek,
}: WeeklyRangeSelectorCardProps) {
  const isLatestWeek = weekOffset >= 0;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>This week</Text>
      <View style={styles.stepperRow}>
        <TouchableOpacity style={styles.arrowBtn} onPress={onPrevWeek}>
          <MaterialIcons
            name="chevron-left"
            size={24}
            color={AppColors.textPrimary}
          />
        </TouchableOpacity>

        <Text style={styles.periodLabel}>{periodLabel}</Text>

        <TouchableOpacity
          style={[styles.arrowBtn, isLatestWeek && styles.arrowBtnDisabled]}
          onPress={onNextWeek}
          disabled={isLatestWeek}
        >
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={isLatestWeek ? AppColors.grey : AppColors.textPrimary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.background2,
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.08)",
  },
  sectionLabel: {
    fontSize: 11.5,
    color: AppColors.grey,
    marginBottom: 8,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: AppColors.background,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  arrowBtn: {
    padding: 6,
  },
  arrowBtnDisabled: {
    opacity: 0.35,
  },
  periodLabel: {
    fontSize: 13.5,
    color: AppColors.textPrimary,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
