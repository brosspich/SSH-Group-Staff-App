import { AppColors } from "@/constants/appcolors";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "danger"
  | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends TouchableOpacityProps {
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  textStyle?: TextStyle;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  disabled,
  children,
  ...rest
}) => {
  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case "secondary":
        return styles.secondary;
      case "outline":
        return styles.outline;
      case "danger":
        return styles.danger;
      case "ghost":
        return styles.ghost;
      case "primary":
      default:
        return styles.primary;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case "sm":
        return styles.sizeSm;
      case "lg":
        return styles.sizeLg;
      case "md":
      default:
        return styles.sizeMd;
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case "outline":
      case "ghost":
        return styles.textDark;
      case "secondary":
        return styles.textSecondary;
      case "danger":
      case "primary":
      default:
        return styles.textLight;
    }
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.7}
      disabled={disabled || isLoading}
      style={[
        styles.base,
        getContainerStyle(),
        getSizeStyle(),
        disabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "outline" || variant === "ghost"
              ? AppColors.primary
              : "#FFFFFF"
          }
        />
      ) : (
        <>
          {leftIcon}
          {label ? (
            <Text style={[styles.textBase, getTextStyle(), textStyle]}>
              {label}
            </Text>
          ) : (
            children
          )}
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    gap: 8,
  },
  primary: {
    backgroundColor: AppColors.primary || "#007AFF",
  },
  secondary: {
    backgroundColor: AppColors.secondary || "#5856D6",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: AppColors.primary || "#007AFF",
  },
  danger: {
    backgroundColor: "#FF3B30",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  disabled: {
    opacity: 0.5,
  },
  sizeSm: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  sizeMd: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sizeLg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  textBase: {
    fontWeight: "600",
    fontSize: 16,
  },
  textLight: {
    color: "#FFFFFF",
  },
  textDark: {
    color: AppColors.primary || "#007AFF",
  },
  textSecondary: {
    color: "#FFFFFF",
  },
});
