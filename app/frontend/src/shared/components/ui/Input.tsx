import { theme } from "@/shared/styles/theme";
import React, { forwardRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      containerStyle,
      inputStyle,
      style,
      ...rest
    },
    ref,
  ) => {
    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View
          style={[
            styles.inputWrapper,
            error ? styles.inputError : styles.inputNormal,
          ]}
        >
          {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
          <TextInput
            ref={ref}
            placeholderTextColor="#8E8E93"
            style={[styles.input, inputStyle, style]}
            {...rest}
          />
          {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
        </View>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : helperText ? (
          <Text style={styles.helperText}>{helperText}</Text>
        ) : null}
      </View>
    );
  },
);

Input.displayName = "Input";

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    width: "100%",
  },
  label: {
    fontSize: theme.fontSizes.sm,
    fontWeight: "500",
    marginBottom: 6,
    color: "#333333",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: "#FAFAFA",
    minHeight: 48,
    paddingHorizontal: 12,
  },
  inputNormal: {
    borderColor: "#E5E5EA",
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  input: {
    flex: 1,
    fontSize: theme.fontSizes.md,
    color: "#000000",
    paddingVertical: 8,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  errorText: {
    fontSize: theme.fontSizes.xs,
    color: "#FF3B30",
    marginTop: 4,
  },
  helperText: {
    fontSize: theme.fontSizes.xs,
    color: "#8E8E93",
    marginTop: 4,
  },
});
