import { Platform, Pressable, StyleSheet, Text } from "react-native";

type AppleButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "filled" | "tinted" | "gray" | "plain";
  size?: "regular" | "large" | "capsule";
  disabled?: boolean;
};

export const AppleButton = ({
  title,
  onPress,
  variant = "filled",
  size = "regular",
  disabled = false,
}: AppleButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        styles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.textBase,
          styles[`${size}Text`],
          styles[`${variant}Text`],
          disabled && styles.disabledText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  // Sizing (Following Apple standard sizes)
  regular: {
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  large: {
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: "100%",
  },
  capsule: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 9999, // Pill shape common in watchOS/iOS sheets
  },

  // Apple HIG Style Variants
  // 1. Filled: Accent solid background (Apple Blue #007AFF)
  filled: {
    backgroundColor: "#007AFF",
    // backgroundColor: AppColors.secondary,
  },
  // 2. Tinted: Translucent fill with saturated text
  tinted: {
    backgroundColor: "rgba(0, 122, 255, 0.12)",
  },
  // 3. Gray: Subtle neutral background
  gray: {
    backgroundColor: Platform.select({
      ios: "#F2F2F7",
      default: "#E5E5EA",
    }),
  },
  // 4. Plain: Text-only with touch targets
  plain: {
    backgroundColor: "transparent",
    paddingHorizontal: 8,
  },

  // Press feedback (subtle scale + opacity drop)
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.35,
    transform: [{ scale: 1 }],
  },

  // Typography
  textBase: {
    fontWeight: "600",
    letterSpacing: -0.3,
    ...Platform.select({
      ios: { fontFamily: "System" },
      android: { fontFamily: "sans-serif-medium" },
    }),
  },
  regularText: {
    fontSize: 16,
    lineHeight: 20,
  },
  largeText: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
  },
  capsuleText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600",
  },

  // Text colors per variant
  filledText: {
    color: "#FFFFFF",
  },
  tintedText: {
    color: "#007AFF",
  },
  grayText: {
    color: "#007AFF",
  },
  plainText: {
    color: "#007AFF",
  },
  disabledText: {
    color: "#8E8E93",
  },
});
