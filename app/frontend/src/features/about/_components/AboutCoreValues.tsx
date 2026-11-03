import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { CoreValueItem } from "../_types/about.types";

interface AboutCoreValuesProps {
  coreValues: CoreValueItem[];
}

export const AboutCoreValues: React.FC<AboutCoreValuesProps> = ({
  coreValues,
}) => {
  return (
    <View style={styles.card}>
      <View style={[styles.cardHeader, { marginBottom: 16 }]}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: `${AppColors.secondary}15`,
              borderRadius: 12,
            },
          ]}
        >
          <Ionicons name="star-outline" size={24} color={AppColors.secondary} />
        </View>
        <Text style={styles.title}>Core Values</Text>
      </View>

      <View style={styles.valuesGrid}>
        {coreValues.map((val, index) => (
          <View key={index} style={styles.valueRow}>
            <View
              style={[
                styles.valueIconContainer,
                { backgroundColor: `${val.color}15` },
              ]}
            >
              <Ionicons name={val.icon} size={20} color={val.color} />
            </View>
            <View style={styles.valueTextContainer}>
              <Text style={styles.valueTitle}>{val.title}</Text>
              <Text style={styles.valueDesc}>{val.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: {
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    fontSize: 18,
    color: AppColors.primary,
  },
  valuesGrid: {
    gap: 16,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  valueIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  valueTextContainer: {
    flex: 1,
  },
  valueTitle: {
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    fontSize: 15,
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  valueDesc: {
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    fontSize: 13,
    color: AppColors.textSecondary,
    lineHeight: 18,
  },
});
