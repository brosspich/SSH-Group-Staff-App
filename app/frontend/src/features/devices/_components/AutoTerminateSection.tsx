import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { InactivePeriod } from "../_types/devices.types";

interface AutoTerminateSectionProps {
  inactivePeriod: InactivePeriod;
  onOpenSelector: () => void;
}

export default function AutoTerminateSection({
  inactivePeriod,
  onOpenSelector,
}: AutoTerminateSectionProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionHeader}>
        Automatically terminate old sessions
      </Text>
      <View style={styles.divider} />
      <Pressable
        style={({ pressed }) => [
          styles.actionRow,
          {
            backgroundColor: pressed
              ? `${AppColors.grey}33`
              : AppColors.transparent,
            paddingVertical: 16,
          },
        ]}
        onPress={onOpenSelector}
      >
        <View style={styles.sessionDetails}>
          <Text style={styles.optionTitleText}>If inactive for</Text>
        </View>
        <Text style={styles.optionValueText}>{inactivePeriod}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  sectionHeader: {
    fontSize: 14,
    color: AppColors.secondary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  sessionDetails: {
    flex: 1,
  },
  optionTitleText: {
    fontSize: 15,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    color: AppColors.textPrimary,
  },
  optionValueText: {
    fontSize: 15,
    color: AppColors.secondary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
