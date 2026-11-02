import React from "react";
import { StyleSheet, Text, TextProps, TextStyle } from "react-native";

export type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "body"
  | "bodySmall"
  | "caption"
  | "button";

export interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  weight?: "normal" | "medium" | "semibold" | "bold";
  align?: "auto" | "left" | "right" | "center" | "justify";
}

export const Typography: React.FC<TypographyProps> = ({
  variant = "body",
  color = "#1A1A1A",
  weight,
  align = "left",
  style,
  children,
  ...rest
}) => {
  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case "h1":
        return styles.h1;
      case "h2":
        return styles.h2;
      case "h3":
        return styles.h3;
      case "bodySmall":
        return styles.bodySmall;
      case "caption":
        return styles.caption;
      case "button":
        return styles.button;
      case "body":
      default:
        return styles.body;
    }
  };

  const getFontWeight = (): TextStyle["fontWeight"] => {
    if (weight === "bold") return "700";
    if (weight === "semibold") return "600";
    if (weight === "medium") return "500";
    if (weight === "normal") return "400";
    return undefined;
  };

  return (
    <Text
      style={[
        getVariantStyle(),
        { color, textAlign: align },
        weight && { fontWeight: getFontWeight() },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "600",
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
  },
  bodySmall: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
  },
  caption: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "400",
    color: "#8E8E93",
  },
  button: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600",
  },
});
