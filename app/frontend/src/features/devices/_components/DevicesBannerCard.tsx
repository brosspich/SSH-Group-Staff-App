import LaptopGraphic from "@/features/devices/_components/LaptopGraphic";
import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import { StyleSheet, Text, View } from "react-native";

export default function DevicesBannerCard() {
  const { t } = useLanguage();

  return (
    <View style={styles.card}>
      <View style={styles.graphicContainer}>
        <LaptopGraphic />
        <Text style={styles.graphicTitle}>
          {t(
            "devices.bannerDesc",
            "The official SSH Group Staff app is available for Android, iPhone, Tablet and Website.",
          )}
        </Text>
      </View>
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
  graphicContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    paddingBottom: 16,
  },
  graphicTitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    maxWidth: 290,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  highlightText: {
    color: theme.colors.secondary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
