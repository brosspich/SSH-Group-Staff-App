import { useSystemConfigQuery } from "@/features/system-config";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePrivacyPolicyQuery } from "../_hooks/usePrivacyPolicyQuery";
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
  const { config } = useSystemConfigQuery();
  const { support, social } = config;

  // Dynamic backend fetch (Backend 70% architecture)
  const { data: policyData, isLoading } = usePrivacyPolicyQuery(lang);

  const sections = policyData?.sections || PRIVACY_POLICY_DATA[lang] || [];
  const lastUpdated =
    policyData?.lastUpdated || PRIVACY_POLICY_LAST_UPDATED[lang];

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
          {isLoading && !policyData ? (
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
              style={{ marginVertical: 24 }}
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
                        size={15}
                        color={theme.colors.background2}
                      />
                      <Text style={styles.contactPillText}>
                        Telegram Support
                      </Text>
                    </TouchableOpacity>
                  ) : null}

                  {support?.email ? (
                    <TouchableOpacity
                      style={[
                        styles.contactPill,
                        { backgroundColor: theme.colors.primary },
                      ]}
                      onPress={() => Linking.openURL(`mailto:${support.email}`)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="mail"
                        size={15}
                        color={theme.colors.background2}
                      />
                      <Text style={styles.contactPillText}>
                        {support.email}
                      </Text>
                    </TouchableOpacity>
                  ) : null}

                  {social?.website ? (
                    <TouchableOpacity
                      style={[styles.contactPill, styles.contactPillSecondary]}
                      onPress={() => Linking.openURL(social.website)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="globe-outline"
                        size={15}
                        color={theme.colors.textPrimary}
                      />
                      <Text
                        style={[
                          styles.contactPillText,
                          { color: theme.colors.textPrimary },
                        ]}
                      >
                        Official Website
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              )}
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
    borderColor: `${theme.colors.textPrimary}0D`,
    ...theme.shadows.sm,
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
  },
  sectionBody: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    paddingLeft: theme.spacing.md,
  },
  contactButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: theme.spacing.md,
    paddingLeft: theme.spacing.md,
  },
  contactPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
