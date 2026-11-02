import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
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
                      ? `${AppColors.grey}33`
                      : AppColors.transparent,
                  },
                ]}
              >
                <View style={styles.iconTxt}>
                  <View style={styles.conIcon}>
                    {createElement(item.icon, {
                      name: item.iconName,
                      size: 20,
                      color: AppColors.textPrimary,
                    })}
                  </View>
                  <Text style={styles.txtTitle}>{item.title}</Text>
                </View>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color={AppColors.textPrimary}
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
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    color: AppColors.textSecondary ?? AppColors.grey,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 10,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  card: {
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    overflow: "hidden",
  },
  conBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  iconTxt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  conIcon: {
    width: 35,
    height: 35,
    backgroundColor: `${AppColors.grey}50`,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  txtTitle: {
    fontSize: 16,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  border: {
    height: 0.3,
    flex: 1,
    backgroundColor: AppColors.grey,
  },
});
