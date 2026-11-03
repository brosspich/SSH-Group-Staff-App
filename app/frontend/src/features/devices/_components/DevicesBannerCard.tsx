import LaptopGraphic from "@/components/laptopgraphic/LaptopGraphic";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { StyleSheet, Text, View } from "react-native";

export default function DevicesBannerCard() {
  return (
    <View style={styles.card}>
      <View style={styles.graphicContainer}>
        <LaptopGraphic />
        <Text style={styles.graphicTitle}>
          The official <Text style={styles.highlightText}>SSH Group POS</Text>{" "}
          app is available for Android, iPhone, Tablet and Website.
        </Text>
      </View>
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
  graphicContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    paddingBottom: 16,
  },
  graphicTitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    maxWidth: 290,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  highlightText: {
    color: AppColors.secondary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
