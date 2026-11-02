import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { Ionicons } from "@expo/vector-icons";
import React, { ComponentType, createElement } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export interface MenuButtonItemProps {
  title: string;
  subtitle?: string;
  iconName: string;
  icon: ComponentType<any>;
  iconColor?: string;
  onPress: () => void;
  showChevron?: boolean;
  rightElement?: React.ReactNode;
}

export function MenuButtonItem({
  title,
  subtitle,
  iconName,
  icon,
  iconColor = AppColors.textPrimary,
  onPress,
  showChevron = true,
  rightElement,
}: MenuButtonItemProps) {
  return (
    <Pressable
      onPress={onPress}
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
          {createElement(icon, {
            name: iconName,
            size: 20,
            color: iconColor,
          })}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.txtTitle}>{title}</Text>
          {subtitle ? <Text style={styles.txtSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {rightElement ? (
        rightElement
      ) : showChevron ? (
        <Ionicons
          name="chevron-forward-outline"
          size={20}
          color={AppColors.textPrimary}
        />
      ) : null}
    </Pressable>
  );
}

export function MenuDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  conBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  iconTxt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  conIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
  },
  txtTitle: {
    fontSize: 14,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
  },
  txtSubtitle: {
    fontSize: 12,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    marginTop: 2,
  },
  divider: {
    height: 0.5,
    backgroundColor: `${AppColors.grey}40`,
    marginLeft: 60,
  },
});

export default MenuButtonItem;
