import { theme } from "@/shared/styles/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ErrorProps = {
  title: string;
  txtError: string;
  onPress: () => void;
};

export default function Error({ title, txtError, onPress }: ErrorProps) {
  return (
    <View style={styles.centered}>
      <MaterialIcons name="error-outline" size={48} color="#ef9a9a" />
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorSub}>{txtError}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={onPress}>
        <MaterialIcons
          name="refresh"
          size={18}
          color={theme.colors.background2}
        />
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
    gap: 12,
    padding: 24,
  },

  // Error
  errorTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },

  errorSub: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    textAlign: "center",
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },

  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    marginTop: 4,
  },

  retryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
