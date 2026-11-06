// components/privacypolicy/PrivacyPolicyModal.tsx
import {
  PRIVACY_POLICY_DATA,
  PolicyLang,
} from "@/features/privacy-policy/_utils/privacyPolicyData";
import { theme } from "@/shared/styles/theme";

import { useResponsive } from "@/shared/hooks/useResponsive";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
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
  onAccept: () => void;
}

export const PrivacyPolicyModal = ({ visible, onAccept }: Props) => {
  const [lang, setLang] = useState<PolicyLang>("en");
  const { isMobile } = useResponsive();

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
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={onAccept}
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
    backgroundColor: "#fff",
    borderRadius: theme.borderRadius.xl,
    padding: 24,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
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
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  langText: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  langTextActive: {
    color: "#fff",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    fontWeight: "bold",
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    color: theme.colors.primary,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "bold",
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
    fontWeight: "700",
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
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  acceptText: {
    color: "#fff",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    fontSize: theme.fontSizes.md,
    fontWeight: "bold",
  },
});
