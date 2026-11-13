import { useLanguage } from "@/features/language";
import { useUser } from "@/shared/contexts/UserContext";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { theme } from "@/shared/styles/theme";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchSubscriptionBySystemId } from "../subscription/_api/subscriptionApi";

export default function NonSubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsive();
  const { t } = useLanguage();
  const { user, setUser } = useUser();

  const [checking, setChecking] = useState(false);

  const systemId =
    user?.system_id ||
    (user as any)?.systemId ||
    user?.companyId ||
    "system-0001";

  // Re-check subscription status manually
  const handleCheckAgain = async () => {
    setChecking(true);
    try {
      const data = await fetchSubscriptionBySystemId(systemId);
      if (data && !data.isExpired) {
        Alert.alert(
          t("common.success", "Success"),
          t(
            "subscription.renewedSuccess",
            "Subscription is active! You can now use the application.",
          ),
          [
            {
              text: "OK",
              onPress: () => router.replace("/(tabs)"),
            },
          ],
        );
      } else {
        Alert.alert(
          t("subscription.stillExpiredTitle", "Still Expired"),
          t(
            "subscription.stillExpiredDesc",
            "Your subscription has not been renewed yet. Please contact your administrator.",
          ),
        );
      }
    } catch {
      Alert.alert(
        t("common.error", "Error"),
        t(
          "common.somethingWentWrong",
          "Could not verify subscription at this moment.",
        ),
      );
    } finally {
      setChecking(false);
    }
  };

  const handleContactSupport = () => {
    const telegramUrl = "https://t.me/sshgroup";
    Linking.canOpenURL(telegramUrl).then((supported) => {
      if (supported) {
        Linking.openURL(telegramUrl);
      } else {
        Linking.openURL("https://telegram.org");
      }
    });
  };

  const handleLogout = () => {
    Alert.alert(
      t("setting.logoutTitle", "Confirm Logout"),
      t("setting.logoutConfirm", "Are you sure you want to log out?"),
      [
        { text: t("common.cancel", "Cancel"), style: "cancel" },
        {
          text: t("common.logout", "Log Out"),
          style: "destructive",
          onPress: () => {
            setUser(null);
            router.replace("/login/login");
          },
        },
      ],
    );
  };

  return (
    <View style={styles.safe}>
      <StatusBar
        backgroundColor={theme.colors.background2}
        barStyle="dark-content"
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          !isMobile && styles.webContent,
          {
            paddingTop: insets.top + 30,
            paddingBottom: insets.bottom + 30,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Warning Illustration Icon ── */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircleOuter}>
            <View style={styles.iconCircleInner}>
              <MaterialCommunityIcons
                name="clock-alert-outline"
                size={54}
                color={theme.colors.red}
              />
            </View>
          </View>
        </View>

        {/* ── Title & Message ── */}
        <Text style={styles.title}>
          {t("subscription.expiredTitle", "Subscription Expired")}
        </Text>
        <Text style={styles.subtitle}>
          {t(
            "subscription.expiredDesc",
            "The subscription service for your company branch has expired. Please renew your plan to continue using the system.",
          )}
        </Text>

        {/* ── Details Card ── */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderTitle}>
              {t("subscription.details", "Subscription Details")}
            </Text>
            <View style={styles.expiredBadge}>
              <Text style={styles.expiredBadgeText}>
                {t("subscription.inactive", "Expired")}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>
              {t("subscription.systemId", "Branch System ID")}
            </Text>
            <Text style={styles.rowValue}>{systemId}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>
              {t("subscription.staffName", "Staff Member")}
            </Text>
            <Text style={styles.rowValue}>
              {user?.name || user?.username || "---"}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>
              {t("subscription.daysRemaining", "Days Remaining")}
            </Text>
            <Text style={[styles.rowValue, { color: theme.colors.red }]}>
              0 {t("subscription.days", "days")}
            </Text>
          </View>
        </View>

        {/* ── Actions ── */}
        <View style={styles.actionGroup}>
          {/* Check Again Button */}
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={handleCheckAgain}
            disabled={checking}
            activeOpacity={0.85}
          >
            {checking ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.background2}
              />
            ) : (
              <>
                <Ionicons
                  name="refresh-outline"
                  size={18}
                  color={theme.colors.background2}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.btnPrimaryText}>
                  {t("subscription.checkAgain", "Check Again")}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Contact Support Telegram */}
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={handleContactSupport}
            activeOpacity={0.85}
          >
            <Ionicons
              name="paper-plane-outline"
              size={18}
              color={theme.colors.primary}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.btnSecondaryText}>
              {t("subscription.contactSupport", "Contact Support / Telegram")}
            </Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.btnLogout}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Feather
              name="log-out"
              size={16}
              color={theme.colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.btnLogoutText}>
              {t("common.logout", "Log Out")}
            </Text>
          </TouchableOpacity>
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
  content: {
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  webContent: {
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  iconContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  iconCircleOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(229, 57, 53, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(229, 57, 53, 0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    textAlign: "center",
    marginBottom: 10,
    includeFontPadding: false,
  },
  subtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 26,
    includeFontPadding: false,
  },
  infoCard: {
    width: "100%",
    backgroundColor: theme.colors.background2,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: `${theme.colors.grey}20`,
    marginBottom: 26,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardHeaderTitle: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  expiredBadge: {
    backgroundColor: "rgba(229, 57, 53, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  expiredBadgeText: {
    fontSize: 11,
    color: theme.colors.red,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  divider: {
    height: 1,
    backgroundColor: `${theme.colors.grey}15`,
    width: "100%",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  rowLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  rowValue: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  actionGroup: {
    width: "100%",
    gap: 12,
  },
  btnPrimary: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: {
    color: theme.colors.background2,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  btnSecondary: {
    backgroundColor: `${theme.colors.primary}12`,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}30`,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondaryText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  btnLogout: {
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnLogoutText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.medium,
    includeFontPadding: false,
  },
});
