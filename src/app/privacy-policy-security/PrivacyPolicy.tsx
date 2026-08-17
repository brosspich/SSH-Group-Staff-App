import AppbarBack from "@/components/appbar/appbarback";
import {
  PRIVACY_POLICY_DATA,
  PolicyLang,
} from "@/components/privacypolicy/privacyPolicyData";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PrivacyPolicy = () => {
  const [lang, setLang] = useState<PolicyLang>("en");

  const titleMap = {
    en: "Privacy Policy",
    zh: "隐私政策",
    km: "គោលការណ៍ឯកជនភាព",
  };

  return (
    <SafeAreaView
      edges={Platform.OS === "ios" ? ["top", "left", "right"] : undefined}
      style={styles.safe}
    >
      <View style={styles.container}>
        <AppbarBack Title={titleMap[lang]} />

        {/* Premium Language Selector Row */}
        <View style={styles.langSelectorContainer}>
          <View style={styles.langSegmentControl}>
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
                English
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
                ភាសាខ្មែរ
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {PRIVACY_POLICY_DATA[lang].map((section, idx) => (
              <View key={idx} style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.accentBar} />
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>
                <Text style={styles.sectionBody}>{section.body}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.background2,
  },
  container: {
    flex: 1,
  },
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
    maxWidth: 400,
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  accentBar: {
    width: 4,
    height: 18,
    backgroundColor: AppColors.primary ?? "#2e3191",
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    color: AppColors.primary ?? "#2e3191",
    fontWeight: "bold",
  },
  sectionBody: {
    fontSize: 13.5,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    color: AppColors.textSecondary ?? "#6B7280",
    lineHeight: 20,
    paddingLeft: 12,
  },
});
