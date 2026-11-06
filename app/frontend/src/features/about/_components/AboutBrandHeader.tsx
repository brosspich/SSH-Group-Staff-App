import { theme } from "@/shared/styles/theme";
import { AppImages } from "@/shared/constants/appImages";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export const AboutBrandHeader: React.FC = () => {
  return (
    <>
      {/* Logo and Brand Section */}
      <View style={styles.conLogo}>
        <Image source={AppImages.logoSSH} style={styles.logo} />
        <Text style={{ color: theme.colors.secondary }}>|</Text>
        <Image source={AppImages.logoStaffW} style={styles.logo} />
      </View>

      {/* Description Card */}
      <View style={styles.card}>
        <Text style={styles.txt}>
          At SSH GROUP, we specialize in providing high-quality plastic products
          and barcode solutions to help businesses streamline their operations.
          With a diverse range of offerings, including Plastic Pallets, Wood
          Pallets, Basket Pallets, various types of shrink films (POF, PE, PVC),
          and top-of-the-line Barcode Printers and Scanners, we’re committed to
          meeting the needs of industries in Cambodia. Whether you're looking
          for durable packaging solutions or advanced labeling technology, we
          are your trusted partner in ensuring your products are delivered
          efficiently and securely.
        </Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  conLogo: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: "contain",
    borderRadius: theme.borderRadius.sm,
    borderColor: theme.colors.secondary,
    borderWidth: 1.5,
  },
  card: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  txt: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    lineHeight: 24,
    color: theme.colors.textPrimary,
  },
});
