import { useLanguage } from "@/features/language";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { theme } from "@/shared/styles/theme";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ReportPrintFooterProps {
  onPressPrint: () => void;
  disabled?: boolean;
}

export function ReportPrintFooter({
  onPressPrint,
  disabled = false,
}: ReportPrintFooterProps) {
  const { isMobile } = useResponsive();
  const { t } = useLanguage();

  return (
    <>
      <View style={styles.printBtnCon}>
        <View
          style={[
            styles.wrapper,
            !isMobile && { maxWidth: "80%", alignSelf: "center" },
          ]}
        >
          <TouchableOpacity
            style={[styles.printBtn, disabled && styles.printBtnDisabled]}
            onPress={onPressPrint}
            disabled={disabled}
            activeOpacity={0.8}
          >
            <Text style={styles.printBtnText}>
              {t("report.printReportOrPdf", "Print Report / Save PDF")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <SafeAreaView
        edges={["bottom"]}
        style={{ backgroundColor: theme.colors.background2 }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  printBtnCon: {
    backgroundColor: theme.colors.background2,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderColor: theme.colors.grey,
    borderTopWidth: 0.5,
  },
  wrapper: {
    width: "100%",
  },
  printBtn: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: theme.colors.secondary,
  },
  printBtnDisabled: {
    opacity: 0.6,
  },
  printBtnText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.background2,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
