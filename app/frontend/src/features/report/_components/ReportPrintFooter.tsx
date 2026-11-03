import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useResponsive } from "@/hooks/useResponsive";
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
            <Text style={styles.printBtnText}>Print Report / Save PDF</Text>
          </TouchableOpacity>
        </View>
      </View>
      <SafeAreaView
        edges={["bottom"]}
        style={{ backgroundColor: AppColors.background2 }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  printBtnCon: {
    backgroundColor: AppColors.background2,
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderColor: AppColors.grey,
    borderTopWidth: 0.5,
  },
  wrapper: {
    width: "100%",
  },
  printBtn: {
    backgroundColor: AppColors.secondary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  printBtnDisabled: {
    opacity: 0.6,
  },
  printBtnText: {
    fontSize: 14,
    fontWeight: "bold",
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
