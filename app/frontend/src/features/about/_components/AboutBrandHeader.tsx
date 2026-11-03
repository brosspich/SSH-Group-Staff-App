import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { AppImages } from "@/constants/appImages";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export const AboutBrandHeader: React.FC = () => {
  return (
    <>
      {/* Logo and Brand Section */}
      <View style={styles.conLogo}>
        <Image source={AppImages.logoSSH} style={styles.logo} />
        <Text style={{ color: AppColors.secondary }}>|</Text>
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
    marginBottom: 20,
    marginTop: 10,
    gap: 10,
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: "contain",
    borderRadius: 10,
    borderColor: AppColors.secondary,
    borderWidth: 1.5,
  },
  card: {
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  txt: {
    fontSize: 15,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    lineHeight: 24,
    color: AppColors.textPrimary,
  },
});
