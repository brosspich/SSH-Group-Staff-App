import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";
import type { SocialPlatformItem } from "../_types/contact.types";

interface ContactItemButtonProps {
  platform: SocialPlatformItem;
  onPress: () => void;
  isGrid?: boolean;
}

export const ContactItemButton: React.FC<ContactItemButtonProps> = ({
  platform,
  onPress,
  isGrid = false,
}) => {
  const IconComp = platform.iconComponent;

  return (
    <TouchableHighlight
      onPress={onPress}
      style={[styles.btn, isGrid && styles.btnGrid]}
      underlayColor="transparent"
    >
      <View
        style={[
          styles.conBoxRow,
          { backgroundColor: platform.backgroundColor },
        ]}
      >
        <View style={styles.icon_txt}>
          <IconComp
            name={platform.iconName}
            size={platform.iconSize ?? 24}
            color={theme.colors.background2}
          />
          <Text style={styles.txt}>{platform.name}</Text>
        </View>
        <Ionicons
          name="chevron-forward-outline"
          size={20}
          color={theme.colors.background2}
        />
      </View>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  btn: {
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  btnGrid: {
    width: "48%",
    marginBottom: 0,
  },
  conBoxRow: {
    flexDirection: "row",
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    borderRadius: theme.borderRadius.lg,
  },
  icon_txt: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.md,
  },
  txt: {
    color: theme.colors.background2,
    // fontWeight: "bold",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
