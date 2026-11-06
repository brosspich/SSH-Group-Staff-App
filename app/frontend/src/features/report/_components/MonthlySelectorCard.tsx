import { theme } from "@/shared/styles/theme";
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
            color={theme.colors.textPrimary}
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
            color={isLatestMonth ? theme.colors.grey : theme.colors.textPrimary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.08)",
  },
  sectionLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  arrowBtn: {
    padding: 6,
  },
  arrowBtnDisabled: {
    opacity: 0.35,
  },
  periodLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
    fontWeight: "bold",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
