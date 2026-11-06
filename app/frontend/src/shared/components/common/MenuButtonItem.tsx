import { theme } from "@/shared/styles/theme";
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
  iconColor = theme.colors.textPrimary,
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
            ? `${theme.colors.grey}33`
            : theme.colors.transparent,
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
          color={theme.colors.textPrimary}
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
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
  },
  txtTitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  txtSubtitle: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },
  divider: {
    height: 0.5,
    backgroundColor: `${theme.colors.grey}40`,
    marginLeft: 60,
  },
});

export default MenuButtonItem;
