import DatePickerModal from "@/components/daterangpicker/DatePickerModal";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
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
  dateField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.background,
    borderRadius: 8,
    padding: 10,
  },
  dateFieldText: {
    fontSize: 14,
    color: AppColors.textPrimary,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
