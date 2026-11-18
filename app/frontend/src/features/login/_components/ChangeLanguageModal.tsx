import { useLanguage } from "@/features/language/hooks/useLanguage";
import type { SupportedLanguage } from "@/features/language/i18n/i18n";
import { theme } from "@/shared/styles/theme";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface LanguageItem {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: LanguageItem[] = [
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

export default function ChangeLanguageModal() {
  const insets = useSafeAreaInsets();
  const { currentLang, changeLanguage, t } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);

  // Find active language data
  const activeLang =
    LANGUAGES.find((item) => item.code === currentLang) || LANGUAGES[0];

  const handleSelectLanguage = async (code: SupportedLanguage) => {
    try {
      Haptics.selectionAsync().catch(() => {});
    } catch {}
    await changeLanguage(code);
    setModalVisible(false);
  };

  return (
    <>
      {/* Top right language button */}
      <View
        style={[styles.pillContainer, { top: theme.spacing.base + insets.top }]}
      >
        <TouchableHighlight
          onPress={() => setModalVisible(true)}
          underlayColor="rgba(255, 255, 255, 0.35)"
          style={styles.pillButton}
          activeOpacity={0.8}
        >
          <View style={styles.pillContent}>
            <Text style={styles.pillFlag}>{activeLang.flag}</Text>
            <Text style={styles.pillText}>{activeLang.nativeName}</Text>
            <MaterialIcons
              name="keyboard-arrow-down"
              size={18}
              color={theme.colors.background2}
            />
          </View>
        </TouchableHighlight>
      </View>

      {/* Language selection modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={styles.modalCard}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle bar indicator for bottom sheet */}
            <View style={styles.handleBar} />

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.headerTitleRow}>
                <Ionicons
                  name="globe-outline"
                  size={20}
                  color={theme.colors.primary}
                  style={styles.headerIcon}
                />
                <Text style={styles.modalTitle}>
                  {t("language.title") || "ជ្រើសរើសភាសា / Language"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
                hitSlop={{
                  top: theme.spacing.sm,
                  bottom: theme.spacing.sm,
                  left: theme.spacing.sm,
                  right: theme.spacing.sm,
                }}
              >
                <Feather
                  name="x"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Language Options List */}
            <View style={styles.langList}>
              {LANGUAGES.map((item) => {
                const isSelected = item.code === currentLang;
                return (
                  <TouchableOpacity
                    key={item.code}
                    onPress={() => handleSelectLanguage(item.code)}
                    activeOpacity={0.7}
                    style={[
                      styles.langOption,
                      isSelected && styles.langOptionSelected,
                    ]}
                  >
                    <View style={styles.langOptionLeft}>
                      <Text style={styles.optionFlag}>{item.flag}</Text>
                      <View style={styles.optionTextCol}>
                        <Text
                          style={[
                            styles.optionNativeName,
                            isSelected && styles.optionTextSelected,
                          ]}
                        >
                          {item.nativeName}
                        </Text>
                        <Text style={styles.optionEnglishName}>
                          {item.name}
                        </Text>
                      </View>
                    </View>

                    {isSelected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={theme.colors.primary}
                      />
                    ) : (
                      <View style={styles.unselectedRadio} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Close Button */}
            <TouchableOpacity
              style={[
                styles.cancelButton,
                { marginBottom: Math.max(insets.bottom, theme.spacing.base) },
              ]}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>
                {t("common.cancel") || "បោះបង់"}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pillContainer: {
    position: "absolute",
    right: theme.spacing.base,
    zIndex: 1000,
  },
  pillButton: {
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    paddingVertical: theme.spacing.xs2,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.sm,
  },
  pillContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs2,
  },
  pillFlag: {
    fontSize: theme.fontSizes.base,
  },
  pillText: {
    color: theme.colors.background2,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalCard: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: theme.colors.background2,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    ...theme.shadows.lg,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.border,
    alignSelf: "center",
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.06)",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  headerIcon: {
    marginRight: theme.spacing.xs,
  },
  modalTitle: {
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textPrimary,
    includeFontPadding: false,
  },
  closeBtn: {
    padding: theme.spacing.xs,
  },
  langList: {
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.base,
    gap: theme.spacing.sm,
  },
  langOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.base,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  langOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(28, 149, 86, 0.08)",
  },
  langOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  optionFlag: {
    fontSize: theme.fontSizes.xxl,
  },
  optionTextCol: {
    gap: theme.spacing.xs,
  },
  optionNativeName: {
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.textPrimary,
    includeFontPadding: false,
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  optionEnglishName: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
    includeFontPadding: false,
  },
  unselectedRadio: {
    width: 20,
    height: 20,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  cancelButton: {
    marginHorizontal: theme.spacing.base,
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.medium,
    color: theme.colors.textSecondary,
    includeFontPadding: false,
  },
});
