import DatePickerModal from "@/shared/components/daterangpicker/DatePickerModal";
import { theme } from "@/shared/styles/theme";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface DailyDatePickerCardProps {
  selectedDate: Date;
  periodLabel: string;
  onSelectDate: (date: Date) => void;
}

export function DailyDatePickerCard({
  selectedDate,
  periodLabel,
  onSelectDate,
}: DailyDatePickerCardProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Select Date</Text>
        <Pressable style={styles.dateField} onPress={() => setShowPicker(true)}>
          <Text style={styles.dateFieldText}>{periodLabel}</Text>
        </Pressable>
      </View>

      <DatePickerModal
        visible={showPicker}
        value={selectedDate}
        onClose={() => setShowPicker(false)}
        onChange={(date) => {
          onSelectDate(date);
          setShowPicker(false);
        }}
      />
    </>
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
  dateField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
  },
  dateFieldText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
    fontWeight: "bold",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
