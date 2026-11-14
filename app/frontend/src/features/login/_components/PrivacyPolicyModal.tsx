// components/privacypolicy/PrivacyPolicyModal.tsx
import { useLanguage } from "@/features/language";
import {
  PRIVACY_POLICY_DATA,
  PolicyLang,
} from "@/features/privacy-policy/_utils/privacyPolicyData";
import { useSystemConfigQuery } from "@/features/system-config";
import { theme } from "@/shared/styles/theme";

import { useResponsive } from "@/shared/hooks/useResponsive";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PRIVACY_ACCEPTED_KEY = "privacy_policy_accepted";

export const usePrivacyModal = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PRIVACY_ACCEPTED_KEY).then((val) => {
      if (!val) setShowModal(true);
    });
  }, []);

  const accept = async () => {
    await AsyncStorage.setItem(PRIVACY_ACCEPTED_KEY, "true");
    setShowModal(false);
  };

  return { showModal, accept };
};

interface Props {
  visible: boolean;
  onAccept: (lang?: PolicyLang) => void;
}

export const PrivacyPolicyModal = ({ visible, onAccept }: Props) => {
  const { currentLang } = useLanguage();
  const [lang, setLang] = useState<PolicyLang>(
    currentLang === "km" ? "km" : currentLang === "zh" ? "zh" : "en",
  );
  const { isMobile } = useResponsive();
  const { config } = useSystemConfigQuery();
  const { support, social } = config;

  useEffect(() => {
    if (visible) {
      setLang(currentLang === "km" ? "km" : currentLang === "zh" ? "zh" : "en");
    }
  }, [visible, currentLang]);

  const titleMap = {
    en: "Privacy Policy",
    zh: "隐私政策",
    km: "គោលការណ៍ឯកជនភាព",
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              maxHeight: isMobile ? "80%" : "85%",
              height: isMobile ? "80%" : "85%",
              maxWidth: isMobile ? "100%" : 520,
              width: isMobile ? "100%" : 520,
            },
          ]}
        >
          {/* Header row with shield icon & language selectors */}
          <View style={styles.headerRow}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${theme.colors.primary}15` },
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.langRow}>
              <TouchableOpacity
                onPress={() => setLang("en")}
                style={[styles.langBtn, lang === "en" && styles.langBtnActive]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.langText,
                    lang === "en" && styles.langTextActive,
                  ]}
                >
                  EN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setLang("zh")}
                style={[styles.langBtn, lang === "zh" && styles.langBtnActive]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.langText,
                    lang === "zh" && styles.langTextActive,
                  ]}
                >
                  中文
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setLang("km")}
                style={[styles.langBtn, lang === "km" && styles.langBtnActive]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.langText,
                    lang === "km" && styles.langTextActive,
                  ]}
                >
                  KH
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.title}>{titleMap[lang]}</Text>

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {PRIVACY_POLICY_DATA[lang].map((section, idx) => (
              <View key={idx} style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.accentBar} />
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>
                <Text style={styles.sectionBody}>{section.body}</Text>

                {/* Dynamic Support Links for Contact Section (Backend 70%) */}
                {idx === PRIVACY_POLICY_DATA[lang].length - 1 && (
                  <View style={styles.contactButtonsRow}>
                    {support?.telegramUrl ? (
                      <TouchableOpacity
                        style={[
                          styles.contactPill,
                          { backgroundColor: "#229ED9" },
                        ]}
                        onPress={() => Linking.openURL(support.telegramUrl)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="paper-plane"
                          size={13}
                          color="#FFFFFF"
                        />
                        <Text style={styles.contactPillText}>Telegram</Text>
                      </TouchableOpacity>
                    ) : null}

                    {support?.email ? (
                      <TouchableOpacity
                        style={[
                          styles.contactPill,
                          { backgroundColor: theme.colors.primary },
                        ]}
                        onPress={() =>
                          Linking.openURL(`mailto:${support.email}`)
                        }
                        activeOpacity={0.8}
                      >
                        <Ionicons name="mail" size={13} color="#FFFFFF" />
                        <Text style={styles.contactPillText}>
                          {support.email}
                        </Text>
                      </TouchableOpacity>
                    ) : null}

                    {social?.website ? (
                      <TouchableOpacity
                        style={[
                          styles.contactPill,
                          styles.contactPillSecondary,
                        ]}
                        onPress={() => Linking.openURL(social.website)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="globe-outline"
                          size={13}
                          color={theme.colors.textPrimary}
                        />
                        <Text
                          style={[
                            styles.contactPillText,
                            { color: theme.colors.textPrimary },
                          ]}
                        >
                          Website
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => onAccept(lang)}
            activeOpacity={0.9}
          >
            <Text style={styles.acceptText}>
              {lang === "en"
                ? "I Agree & Continue"
                : lang === "zh"
                  ? "同意并继续"
                  : "យល់ព្រម និងបន្ត"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.xl,
    padding: 24,
    width: "100%",
    borderWidth: 1,
    borderColor: `${theme.colors.textPrimary}0D`,
    ...theme.shadows.lg,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  langRow: {
    flexDirection: "row",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: 3,
    gap: 2,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
  },
  langBtnActive: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  langText: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    color: theme.colors.textSecondary,
    // fontWeight: "600",
  },
  langTextActive: {
    color: theme.colors.background2,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    // fontWeight: "bold",
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    color: theme.colors.primary,
    marginBottom: 16,
    textAlign: "center",
    // fontWeight: "bold",
  },
  scroll: {
    flex: 1,
    marginVertical: 4,
  },
  scrollContent: {
    paddingRight: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  accentBar: {
    width: 3.5,
    height: 15,
    backgroundColor: theme.colors.primary,
    borderRadius: 1.5,
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    color: theme.colors.textPrimary,
    // fontWeight: "700",
  },
  sectionBody: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    paddingLeft: 10,
  },
  acceptBtn: {
    marginTop: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 14,
    alignItems: "center",
    ...theme.shadows.md,
  },
  acceptText: {
    color: theme.colors.background2,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    fontSize: theme.fontSizes.md,
    // fontWeight: "bold",
  },
  contactButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
    paddingLeft: 10,
  },
  contactPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  contactPillSecondary: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: `${theme.colors.textPrimary}1A`,
  },
  contactPillText: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    color: "#FFFFFF",
  },
});
