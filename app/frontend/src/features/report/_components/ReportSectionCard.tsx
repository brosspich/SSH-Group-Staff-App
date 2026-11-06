import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { createElement } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ReportItemConfig } from "../_types/report.types";

interface ReportSectionCardProps {
  title: string;
  items: ReportItemConfig[];
  style?: any;
}

export const ReportSectionCard: React.FC<ReportSectionCardProps> = ({
  title,
  items,
  style,
}) => {
  return (
    <View style={[styles.section, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={item.title}>
              <Pressable
                onPress={() => router.push(item.route as any)}
                style={({ pressed }) => [
                  styles.conBtn,
                  {
                    backgroundColor: pressed
                      ? `${theme.colors.grey}33`
                      : theme.colors.transparent,
                  },
                ]}
              >
                <View style={styles.iconTxt}>
                  <View style={styles.conIcon}>
                    {createElement(item.icon, {
                      name: item.iconName,
                      size: 20,
                      color: theme.colors.textPrimary,
                    })}
                  </View>
                  <Text style={styles.txtTitle}>{item.title}</Text>
                </View>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color={theme.colors.textPrimary}
                />
              </Pressable>
              {!isLast && <View style={styles.border} />}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary ?? theme.colors.grey,
    textTransform: "uppercase",
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  card: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
  },
  conBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 7,
  },
  iconTxt: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  conIcon: {
    width: 35,
    height: 35,
    backgroundColor: `${theme.colors.grey}50`,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  txtTitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  border: {
    height: 0.3,
    flex: 1,
    backgroundColor: theme.colors.grey,
  },
});
