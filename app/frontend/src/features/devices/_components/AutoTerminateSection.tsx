import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
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
  const { t } = useLanguage();

  return (
    <View style={styles.card}>
      <Text style={styles.sectionHeader}>
        {t(
          "devices.autoTerminateTitle",
          "Automatically terminate old sessions",
        )}
      </Text>
      <View style={styles.divider} />
      <Pressable
        style={({ pressed }) => [
          styles.actionRow,
          {
            backgroundColor: pressed
              ? `${theme.colors.grey}33`
              : theme.colors.transparent,
            paddingVertical: 16,
          },
        ]}
        onPress={onOpenSelector}
      >
        <View style={styles.sessionDetails}>
          <Text style={styles.optionTitleText}>
            {t("devices.ifInactiveFor", "If inactive for")}
          </Text>
        </View>
        <Text style={styles.optionValueText}>{inactivePeriod}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  sectionHeader: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.secondary,
    fontFamily: theme.fonts.bold,
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
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    color: theme.colors.textPrimary,
  },
  optionValueText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.secondary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
