import { AppColors } from "@/constants/appcolors";
import React from "react";
import {
  ActivityIndicator,
  ActivityIndicatorProps,
  StyleSheet,
  View,
} from "react-native";

export interface SpinnerProps extends ActivityIndicatorProps {
  fullScreen?: boolean;
}

export const Spinner: React.FC<SpinnerProps> = ({
  fullScreen = false,
  color = AppColors.primary || "#007AFF",
  size = "large",
  ...rest
}) => {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={color} {...rest} />
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      <ActivityIndicator size={size} color={color} {...rest} />
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  inline: {
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
