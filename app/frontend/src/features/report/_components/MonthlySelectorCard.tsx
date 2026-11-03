import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface MonthlySelectorCardProps {
  viewYear: number;
  viewMonth: number;
  currentYear: number;
  currentMonth: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function MonthlySelectorCard({
  viewYear,
  viewMonth,
  currentYear,
  currentMonth,
  onPrevMonth,
  onNextMonth,
}: MonthlySelectorCardProps) {
  const isLatestMonth =
    viewYear > currentYear ||
    (viewYear === currentYear && viewMonth >= currentMonth);

  const displayLabel = `${MONTH_NAMES[viewMonth]} ${viewYear}`;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>Select Month</Text>
      <View style={styles.stepperRow}>
        <TouchableOpacity style={styles.arrowBtn} onPress={onPrevMonth}>
          <MaterialIcons
            name="chevron-left"
            size={24}
            color={AppColors.textPrimary}
          />
        </TouchableOpacity>

        <Text style={styles.periodLabel}>{displayLabel}</Text>

        <TouchableOpacity
          style={[styles.arrowBtn, isLatestMonth && styles.arrowBtnDisabled]}
          onPress={onNextMonth}
          disabled={isLatestMonth}
        >
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={isLatestMonth ? AppColors.grey : AppColors.textPrimary}
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
    fontSize: 14,
    color: AppColors.textPrimary,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
