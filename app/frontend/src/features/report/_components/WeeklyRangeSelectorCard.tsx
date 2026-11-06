import { theme } from "@/shared/styles/theme";
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
            color={theme.colors.textPrimary}
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
            color={isLatestWeek ? theme.colors.grey : theme.colors.textPrimary}
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
