import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface AboutMissionVisionProps {
  isMobile: boolean;
}

export const AboutMissionVision: React.FC<AboutMissionVisionProps> = ({
  isMobile,
}) => {
  return (
    <View style={isMobile ? styles.rowMobile : styles.rowTablet}>
      {/* Mission Card */}
      <View style={[styles.card, !isMobile && styles.cardHalf]}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${theme.colors.primary}15` },
            ]}
          >
            <Ionicons
              name="rocket-outline"
              size={24}
              color={theme.colors.secondary}
            />
          </View>
          <Text style={styles.title}>Mission</Text>
        </View>
        <Text style={styles.cardTxt}>
          Our mission is to provide businesses with innovative, reliable, and
          cost-effective plastic products and barcode solutions that improve
          logistics, packaging, and inventory management. We aim to be a key
          enabler of efficiency and productivity for our clients by offering
          high-quality products and outstanding customer service, ensuring
          businesses can operate seamlessly and effectively.
        </Text>
      </View>

      {/* Vision Card */}
      <View style={[styles.card, !isMobile && styles.cardHalf]}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${theme.colors.secondary}15` },
            ]}
          >
            <Ionicons
              name="eye-outline"
              size={24}
              color={theme.colors.secondary}
            />
          </View>
          <Text style={styles.title}>Vision</Text>
        </View>
        <Text style={styles.cardTxt}>
          Our vision is to become a leading provider of high-quality plastic
          products and barcode solutions in the global market. We aim to
          continuously innovate and expand our product offerings, enabling our
          customers to maximize operational efficiency and stay ahead of
          industry trends. We strive to be recognized for our commitment to
          excellence, reliability, and sustainable business practices.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  title: {
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.primary,
  },
  cardTxt: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  rowMobile: {
    flexDirection: "column",
  },
  rowTablet: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  cardHalf: {
    flex: 1,
    marginBottom: 0,
  },
});
