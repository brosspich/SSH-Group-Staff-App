import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
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
            color={AppColors.background2}
          />
          <Text style={styles.txt}>{platform.name}</Text>
        </View>
        <Ionicons
          name="chevron-forward-outline"
          size={20}
          color={AppColors.background2}
        />
      </View>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  btn: {
    marginBottom: 10,
    borderRadius: 15,
  },
  btnGrid: {
    width: "48%",
    marginBottom: 0,
  },
  conBoxRow: {
    flexDirection: "row",
    paddingLeft: 20,
    paddingRight: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    borderRadius: 15,
  },
  icon_txt: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
  },
  txt: {
    color: AppColors.background2,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
