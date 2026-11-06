import { theme } from "@/shared/styles/theme";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { PolicyLang } from "../_types/privacyPolicy.types";
import { POLICY_LANGUAGES } from "../_utils/privacyPolicyConstants";

interface PolicyLanguageSelectorProps {
  currentLang: PolicyLang;
  onSelectLang: (lang: PolicyLang) => void;
}

export default function PolicyLanguageSelector({
  currentLang,
  onSelectLang,
}: PolicyLanguageSelectorProps) {
  return (
    <View style={styles.langSelectorContainer}>
      <View style={styles.langSegmentControl}>
        {POLICY_LANGUAGES.map(({ key, label }) => {
          const isActive = currentLang === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => onSelectLang(key)}
              style={[styles.langBtn, isActive && styles.langBtnActive]}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.langText, isActive && styles.langTextActive]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  langSelectorContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background2,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
    alignItems: "center",
  },
  langSegmentControl: {
    flexDirection: "row",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xs,
    width: "100%",
    maxWidth: 420,
    justifyContent: "space-between",
  },
  langBtn: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  langBtnActive: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  langText: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  langTextActive: {
    color: "#ffffff",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    fontWeight: "bold",
  },
});
