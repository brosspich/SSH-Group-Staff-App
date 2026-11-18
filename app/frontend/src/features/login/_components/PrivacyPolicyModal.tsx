// components/privacypolicy/PrivacyPolicyModal.tsx
import { useLanguage } from "@/features/language";
import {
  PRIVACY_POLICY_DATA,
  PolicyLang,
  usePrivacyPolicyQuery,
} from "@/features/privacy-policy";
import { useSystemConfigQuery } from "@/features/system-config";
import { theme } from "@/shared/styles/theme";

import { useResponsive } from "@/shared/hooks/useResponsive";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
    currentLang === "km"
      ? "km"
      : currentLang === "zh"
        ? "zh"
        : currentLang === "fr"
          ? "fr"
          : "en",
  );
  const { isMobile } = useResponsive();
  const insets = useSafeAreaInsets();
  const { config } = useSystemConfigQuery();
  const { support, social } = config;

  // Dynamic backend fetch (Backend 70% architecture) with strict language match
  const { data: policyData, isLoading } = usePrivacyPolicyQuery(lang);
  const sections =
    (policyData?.language === lang ? policyData?.sections : null) ||
    PRIVACY_POLICY_DATA[lang] ||
    [];

  useEffect(() => {
    if (visible) {
      setLang(
        currentLang === "km"
          ? "km"
          : currentLang === "zh"
            ? "zh"
            : currentLang === "fr"
              ? "fr"
              : "en",
      );
    }
  }, [visible, currentLang]);

  const titleMap = {
    en: "Privacy Policy",
    zh: "隐私政策",
    km: "គោលការណ៍ឯកជនភាព",
    fr: "Politique de confidentialité",
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              maxHeight: isMobile ? "87%" : "85%",
              height: isMobile ? "87%" : "85%",
              maxWidth: isMobile ? "100%" : 520,
              width: isMobile ? "100%" : 520,
            },
          ]}
        >
          {/* Header row with shield icon & Title */}
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

            <Text style={styles.title}>{titleMap[lang]}</Text>
          </View>

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {isLoading && !policyData ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.primary}
                style={{ marginVertical: 20 }}
              />
            ) : null}
            {sections.map((section, idx) => (
              <View key={idx} style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.accentBar} />
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>
                <Text style={styles.sectionBody}>{section.body}</Text>

                {/* Dynamic Support Links for Contact Section (Backend 70%) */}
                {idx === sections.length - 1 && (
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
                          color={theme.colors.background2}
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
                        <Ionicons
                          name="mail"
                          size={13}
                          color={theme.colors.background2}
                        />
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

          <View
            style={[
              styles.conBtn,
              { paddingBottom: theme.spacing.base + insets.bottom },
            ]}
          >
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
                    : lang === "fr"
                      ? "J'accepte et continuer"
                      : "យល់ព្រម និងបន្ត"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
    alignItems: "center",
    // paddingHorizontal: 16,
  },
  card: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.xl,
    width: "100%",
    borderWidth: 1,
    borderColor: `${theme.colors.textPrimary}0D`,
    ...theme.shadows.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    gap: theme.spacing.sm,
    borderColor: theme.colors.grey + 70,
    borderBottomWidth: 0.5,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    color: theme.colors.primary,
    textAlign: "center",
  },
  scroll: {
    flex: 1,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.base,
  },
  scrollContent: {
    paddingRight: theme.spacing.xs,
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
  },
  sectionBody: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    paddingLeft: 10,
  },
  conBtn: {
    borderColor: theme.colors.grey + 70,
    borderTopWidth: 0.5,
    padding: theme.spacing.base,
  },
  acceptBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
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
    marginVertical: theme.spacing.md,
    paddingLeft: theme.spacing.xs,
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
    color: theme.colors.background2,
  },
});
