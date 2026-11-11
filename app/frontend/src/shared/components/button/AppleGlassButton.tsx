import { theme } from "@/shared/styles/theme";
import { BlurView } from "expo-blur";
import { Pressable, StyleSheet, Text } from "react-native";

export const AppleGlassButton = ({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.glassWrapper,
        pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] },
      ]}
    >
      <BlurView
        intensity={65}
        tint="systemMaterial"
        style={styles.blurContainer}
      >
        <Text style={styles.glassText}>{title}</Text>
      </BlurView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  glassWrapper: {
    borderRadius: theme.borderRadius.xl,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.25)",
    zIndex: 10,
  },
  blurContainer: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  glassText: {
    fontSize: theme.fontSizes.md,
    // fontWeight: "600",
    color: theme.colors.background2,
    letterSpacing: -0.2,
    fontFamily: theme.fonts.semibold,
    includeFontPadding: false,
  },
});
