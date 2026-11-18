import AppbarBack from "@/shared/components/appbar/appbarback";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { theme } from "@/shared/styles/theme";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLanguage } from "./hooks/useLanguage";
import type { SupportedLanguage } from "./i18n/i18n";

interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  {
    code: "km",
    name: "Khmer",
    nativeName: "ភាសាខ្មែរ",
    flag: "🇰🇭",
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
  },
  {
    code: "zh",
    name: "Chinese",
    nativeName: "中文 (简体)",
    flag: "🇨🇳",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
  },
];

export default function LanguageScreen() {
  const { t, currentLang, changeLanguage, isKhmer } = useLanguage();
  const { isMobile } = useResponsive();

  const handleSelectLanguage = async (code: SupportedLanguage) => {
    if (code === currentLang) return;
    try {
      Haptics.selectionAsync().catch(() => {});
    } catch {}
    await changeLanguage(code);
  };

  return (
    <View style={styles.safe}>
      <StatusBar
        backgroundColor={theme.colors.background}
        barStyle="light-content"
      />
      <AppbarBack Title={t("language.title")} fallbackRoute="/setting" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          !isMobile && styles.webContainer,
        ]}
      >
        {/* Section Header */}
        <View style={styles.headerBox}>
          <Text style={styles.headerTitle}>{t("language.title")}</Text>
          <Text style={styles.headerSubtitle}>{t("language.subtitle")}</Text>
        </View>

        {/* Language Selection Card */}
        <View style={styles.card}>
          {LANGUAGES.map((item, index) => {
            const isSelected = currentLang === item.code;
            return (
              <React.Fragment key={item.code}>
                <TouchableOpacity
                  style={[
                    styles.langItem,
                    isSelected && styles.langItemSelected,
                  ]}
                  onPress={() => handleSelectLanguage(item.code)}
                  activeOpacity={0.7}
                >
                  <View style={styles.leftInfo}>
                    <Text style={styles.flagEmoji}>{item.flag}</Text>
                    <View style={styles.textColumn}>
                      <Text
                        style={[
                          styles.langNativeText,
                          isSelected && styles.langTextSelected,
                        ]}
                      >
                        {item.nativeName}
                      </Text>
                      <Text style={styles.langSubText}>{item.name}</Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleActive,
                    ]}
                  >
                    {isSelected && (
                      <Ionicons
                        name="checkmark-sharp"
                        size={16}
                        color={theme.colors.background2}
                      />
                    )}
                  </View>
                </TouchableOpacity>

                {index < LANGUAGES.length - 1 && (
                  <View style={styles.divider} />
                )}
              </React.Fragment>
            );
          })}
        </View>

        {/* Live Translation Preview Card */}
        <View style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <MaterialIcons
              name="translate"
              size={20}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.previewHeaderTitle}>
              {t("language.previewTitle")}
            </Text>
          </View>
          <Text style={styles.previewDescription}>
            {t("language.previewDesc")}
          </Text>

          <View style={styles.previewBox}>
            <View style={styles.previewRow}>
              <Text style={styles.previewKey}>{t("home.welcomeBack")}</Text>
              <Text style={styles.previewTag}>
                {currentLang === "km"
                  ? "ភាសាខ្មែរ"
                  : currentLang === "zh"
                    ? "中文"
                    : "English"}
              </Text>
            </View>

            <View style={styles.previewRow}>
              <View style={styles.previewIconRow}>
                <Feather
                  name="check-circle"
                  size={15}
                  color={theme.colors.primary}
                />
                <Text style={styles.previewLabel}>
                  {t("attendance.checkIn")}
                </Text>
              </View>
              <Text style={styles.previewValue}>{t("home.currentStatus")}</Text>
            </View>

            <View style={styles.previewRow}>
              <View style={styles.previewIconRow}>
                <Feather
                  name="settings"
                  size={15}
                  color={theme.colors.primary}
                />
                <Text style={styles.previewLabel}>
                  {t("navigation.setting")}
                </Text>
              </View>
              <Text style={styles.previewValue}>
                {t("setting.privacySecurity")}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  webContainer: {
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },
  headerBox: {
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.fontSizes.lg,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    marginBottom: theme.spacing.lg,
  },
  langItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  langItemSelected: {
    backgroundColor: `${theme.colors.primary}0D`,
  },
  leftInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  flagEmoji: {
    fontSize: 28,
  },
  textColumn: {
    justifyContent: "center",
  },
  langNativeText: {
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    color: theme.colors.textPrimary,
  },
  langTextSelected: {
    color: theme.colors.primary,
  },
  langSubText: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.grey,
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  divider: {
    height: 0.5,
    backgroundColor: `${theme.colors.grey}33`,
    marginLeft: 60,
  },
  previewContainer: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: `${theme.colors.grey}22`,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  previewHeaderTitle: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    color: theme.colors.textPrimary,
  },
  previewDescription: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    color: theme.colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  previewBox: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    gap: 10,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  previewKey: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    color: theme.colors.textPrimary,
  },
  previewTag: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.medium,
    includeFontPadding: false,
    color: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}1A`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  previewIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  previewLabel: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    color: theme.colors.textSecondary,
  },
  previewValue: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.medium,
    includeFontPadding: false,
    color: theme.colors.textPrimary,
  },
});
