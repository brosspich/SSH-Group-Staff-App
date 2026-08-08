import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
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
        <MaterialIcons name="refresh" size={18} color={AppColors.background2} />
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
    backgroundColor: AppColors.background,
    gap: 12,
    padding: 24,
  },

  // Error
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },

  errorSub: {
    fontSize: 12,
    color: AppColors.textSecondary,
    textAlign: "center",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },

  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: AppColors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 4,
  },

  retryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
