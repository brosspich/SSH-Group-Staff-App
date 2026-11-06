import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, Pressable, StyleSheet, View } from "react-native";

type AppleGlassBackButtonProps = {
  onPress: () => void;
  size?: number;
  dark?: boolean;
};

export const AppleGlassBackButton = ({
  onPress,
  size = 40, // 44pt is Apple's recommended minimum touch target
  dark = false,
}: AppleGlassBackButtonProps) => {
  const iconColor = dark ? "#FFFFFF" : "#000000";
  const blurTint = dark
    ? "systemUltraThinMaterialDark"
    : "systemUltraThinMaterialLight";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Back"
      hitSlop={8}
      style={({ pressed }) => [
        styles.outerContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        pressed && styles.pressed,
      ]}
    >
      <BlurView
        intensity={Platform.OS === "ios" ? 70 : 100}
        tint={blurTint}
        style={[
          styles.blurFill,
          dark ? styles.darkOverlay : styles.lightOverlay,
        ]}
      >
        {/* Apple's SF back chevron is slightly visually offset to the left */}
        <View style={styles.iconShift}>
          <Ionicons
            name="chevron-back"
            size={Math.round(size * 0.52)}
            color={iconColor}
          />
        </View>
      </BlurView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    overflow: "hidden",
    // Apple ultra-thin perimeter highlight
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: Platform.select({
      ios: "rgba(255, 255, 255, 0.35)",
      default: "rgba(0, 0, 0, 0.08)",
    }),
    // Subtle float elevation / shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  blurFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  lightOverlay: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  darkOverlay: {
    backgroundColor: "rgba(30, 30, 30, 0.45)",
  },
  iconShift: {
    // Left-shift by 1-2px so the chevron optically centers inside the circle
    transform: [{ translateX: -1 }],
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.94 }],
  },
});
