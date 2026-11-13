import { useLanguage } from "@/features/language";
import AppbarBack from "@/shared/components/appbar/appbarback";
import Loading from "@/shared/components/loading/loading";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { theme } from "@/shared/styles/theme";
import { router } from "expo-router";
import { useEffect } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SubscriptionCard } from "./_components/SubscriptionCard";
import { useSubscription } from "./_hooks/useSubscription";

const SYSTEM_BRANCHES = [
  "system-0001",
  "system-0002",
  "system-0003",
  "system-0004",
  "system-0005",
];

export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsive();
  const { t } = useLanguage();

  const {
    isOwner,
    selectedSystemId,
    setSelectedSystemId,
    subscription,
    loading,
    refreshing,
    onRefresh,
  } = useSubscription();

  useEffect(() => {
    if (
      !loading &&
      !refreshing &&
      (!subscription ||
        subscription.isExpired ||
        subscription.hasSubscription === false)
    ) {
      router.replace("/subscription/non-subscription" as any);
    }
  }, [loading, refreshing, subscription]);

  return (
    <View style={styles.safe}>
      {/* ── App Header ── */}
      <AppbarBack
        Title={t("subscription.title", "Subscription")}
        fallbackRoute="/(tabs)/setting"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          !isMobile && styles.webContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* ── Owner Branch Switcher (If owner has multiple systems) ── */}
        {isOwner && (
          <View style={styles.branchSwitcher}>
            <Text style={styles.branchTitle}>
              {t("changeInfoStaff.allSystems", "Switch Branch / System")}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.branchRow}
            >
              {SYSTEM_BRANCHES.map((sysId) => {
                const isSelected = sysId === selectedSystemId;
                return (
                  <TouchableOpacity
                    key={sysId}
                    style={[
                      styles.branchChip,
                      isSelected && styles.branchChipActive,
                    ]}
                    onPress={() => setSelectedSystemId(sysId)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.branchChipText,
                        isSelected && styles.branchChipTextActive,
                      ]}
                    >
                      {sysId}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ── Card Content ── */}
        {loading && !refreshing ? (
          <View style={styles.loadingWrap}>
            <Loading />
          </View>
        ) : subscription &&
          !subscription.isExpired &&
          subscription.hasSubscription !== false ? (
          <SubscriptionCard subscription={subscription} />
        ) : (
          <View style={styles.loadingWrap}>
            <Loading />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  webContent: {
    maxWidth: 540,
    width: "100%",
    alignSelf: "center",
  },
  branchSwitcher: {
    marginBottom: 16,
  },
  branchTitle: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.bold,
    marginBottom: 8,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  branchRow: {
    gap: 8,
  },
  branchChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background2,
    borderWidth: 1,
    borderColor: `${theme.colors.grey}30`,
  },
  branchChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  branchChipText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  branchChipTextActive: {
    color: theme.colors.background2,
  },
  loadingWrap: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyWrap: {
    padding: 30,
    alignItems: "center",
  },
  emptyText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.medium,
  },
});
