import { theme } from "@/shared/styles/theme";
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
      <View style={[styles.cardHeader, { marginBottom: theme.spacing.md }]}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: `${theme.colors.secondary}15`,
              borderRadius: theme.borderRadius.md,
            },
          ]}
        >
          <Ionicons name="star-outline" size={24} color={theme.colors.secondary} />
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
  valuesGrid: {
    gap: theme.spacing.md,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  valueIconContainer: {
    width: 38,
    height: 38,
    borderRadius: theme.borderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  valueTextContainer: {
    flex: 1,
  },
  valueTitle: {
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  valueDesc: {
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});
