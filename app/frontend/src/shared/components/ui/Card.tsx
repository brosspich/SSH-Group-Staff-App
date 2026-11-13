import { theme } from "@/shared/styles/theme";
import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";

export interface CardProps extends ViewProps {
  padding?: number;
  elevation?: number;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  padding = 16,
  elevation = 2,
  children,
  style,
  ...rest
}) => {
  return (
    <View
      style={[styles.card, { padding }, elevation > 0 && styles.shadow, style]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
});
