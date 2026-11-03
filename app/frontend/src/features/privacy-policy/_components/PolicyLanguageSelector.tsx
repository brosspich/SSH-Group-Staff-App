import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: AppColors.background2,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
    alignItems: "center",
  },
  langSegmentControl: {
    flexDirection: "row",
    backgroundColor: AppColors.background,
    borderRadius: 12,
    padding: 4,
    width: "100%",
    maxWidth: 420,
    justifyContent: "space-between",
  },
  langBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  langBtnActive: {
    backgroundColor: AppColors.primary ?? "#2e3191",
    shadowColor: AppColors.primary ?? "#2e3191",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  langText: {
    fontSize: 13,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    color: AppColors.textSecondary ?? "#6B7280",
    fontWeight: "500",
  },
  langTextActive: {
    color: "#ffffff",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    fontWeight: "bold",
  },
});
