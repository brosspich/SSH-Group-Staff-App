import { theme } from "@/shared/styles/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  bannerContainer: {
    borderBottomLeftRadius: theme.borderRadius.xl || 24,
    borderBottomRightRadius: theme.borderRadius.xl || 24,
    overflow: "hidden",
  },
  bottomSpacer: {
    paddingBottom: 90,
  },
});
