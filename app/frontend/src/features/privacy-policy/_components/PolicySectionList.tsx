import { theme } from "@/shared/styles/theme";
import { useResponsive } from "@/shared/hooks/useResponsive";
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
    padding: theme.spacing.md,
  },
  wrapper: {
    width: "100%",
  },
  updatedBadge: {
    alignSelf: "flex-start",
    backgroundColor: `${theme.colors.primary}12`,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  updatedBadgeText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  card: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  accentBar: {
    width: 4,
    height: 18,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
    marginRight: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    color: theme.colors.primary,
    fontWeight: "bold",
  },
  sectionBody: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    paddingLeft: theme.spacing.md,
  },
});
