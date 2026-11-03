import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useResponsive } from "@/hooks/useResponsive";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { PolicyLang } from "../_types/privacyPolicy.types";
import {
  PRIVACY_POLICY_DATA,
  PRIVACY_POLICY_LAST_UPDATED,
} from "../_utils/privacyPolicyConstants";

interface PolicySectionListProps {
  lang: PolicyLang;
}

export default function PolicySectionList({ lang }: PolicySectionListProps) {
  const { isMobile } = useResponsive();
  const insets = useSafeAreaInsets();
  const sections = PRIVACY_POLICY_DATA[lang] || [];
  const lastUpdated = PRIVACY_POLICY_LAST_UPDATED[lang];

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.wrapper,
          !isMobile && { maxWidth: 750, alignSelf: "center", width: "100%" },
        ]}
      >
        {/* Last Updated Badge */}
        {lastUpdated ? (
          <View style={styles.updatedBadge}>
            <Text style={styles.updatedBadgeText}>{lastUpdated}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          {sections.map((section, idx) => (
            <View key={idx} style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.accentBar} />
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <Text style={styles.sectionBody}>{section.body}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  wrapper: {
    width: "100%",
  },
  updatedBadge: {
    alignSelf: "flex-start",
    backgroundColor: `${AppColors.primary}12`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  updatedBadgeText: {
    fontSize: 12,
    color: AppColors.primary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
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
    lineHeight: 22,
    paddingLeft: 12,
  },
});
