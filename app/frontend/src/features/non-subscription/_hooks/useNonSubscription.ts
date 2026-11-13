import { useLanguage } from "@/features/language";
import { useSubscriptionQuery } from "@/features/subscription/_hooks/useSubscriptionQuery";
import { useSubscriptionStore } from "@/features/subscription/_store/useSubscriptionStore";
import { useSystemConfigQuery } from "@/features/system-config";
import { extractSystemKey } from "@/shared/constants/attendanceConfig";
import { useUser } from "@/shared/contexts/UserContext";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Linking } from "react-native";
import type { NonSubscriptionAlertConfig } from "../_types/nonSubscription.types";

export function useNonSubscription() {
  const { t } = useLanguage();
  const { user } = useUser();

  const [checking, setChecking] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<NonSubscriptionAlertConfig>({
    visible: false,
    title: "",
    message: "",
    hideCancel: true,
  });

  // Match user companyId to Subscription table system_id
  const rawCompanyId =
    user?.companyId ||
    (user as any)?.company_id ||
    user?.details?.companyId ||
    extractSystemKey(user?.system_id || (user as any)?.systemId || user?.id) ||
    "system-0001";
  const companyId = extractSystemKey(rawCompanyId) || "system-0001";
  const staffName = user?.name || user?.username || "---";

  const { data: querySub, refetch } = useSubscriptionQuery(companyId, true);
  const cachedSub = useSubscriptionStore((state) => state.subscription);
  const subInfo = querySub ?? cachedSub;

  // Auto-redirect to (tabs) if active
  useEffect(() => {
    if (subInfo && !subInfo.isExpired && subInfo.hasSubscription !== false) {
      router.replace("/(tabs)");
    }
  }, [subInfo]);

  // Re-check subscription status manually using custom AlertModal & TanStack Query refetch
  const handleCheckAgain = useCallback(async () => {
    setChecking(true);
    try {
      const res = await refetch();
      const data = res.data;
      if (data && !data.isExpired && data.hasSubscription !== false) {
        setAlertConfig({
          visible: true,
          title: t("common.success", "Success"),
          message: t(
            "subscription.renewedSuccess",
            "Subscription is active! You can now use the application.",
          ),
          iconName: "checkmark-circle-outline",
          hideCancel: true,
          onPress: () => router.replace("/(tabs)"),
        });
      } else {
        setAlertConfig({
          visible: true,
          title: t("subscription.stillExpiredTitle", "Still Expired"),
          message: t(
            "subscription.stillExpiredDesc",
            "Your subscription has not been renewed yet. Please contact your administrator.",
          ),
          iconName: "alert-circle-outline",
          hideCancel: true,
        });
      }
    } catch {
      setAlertConfig({
        visible: true,
        title: t("common.error", "Error"),
        message: t(
          "common.somethingWentWrong",
          "Could not verify subscription at this moment.",
        ),
        iconName: "close-circle-outline",
        hideCancel: true,
      });
    } finally {
      setChecking(false);
    }
  }, [refetch, t]);

  const { supportLinks } = useSystemConfigQuery();

  const handleContactSupport = useCallback(() => {
    const telegramUrl = supportLinks?.telegramUrl || "https://t.me/sshgroup168";
    const fallbackUrl =
      supportLinks?.telegramFallbackUrl || "https://telegram.org";

    Linking.canOpenURL(telegramUrl).then((supported) => {
      if (supported) {
        Linking.openURL(telegramUrl);
      } else {
        Linking.openURL(fallbackUrl);
      }
    });
  }, [supportLinks]);

  const handleLogout = useCallback(() => {
    setLogoutModalVisible(true);
  }, []);

  return {
    user,
    companyId,
    staffName,
    checking,
    subInfo,
    logoutModalVisible,
    setLogoutModalVisible,
    alertConfig,
    setAlertConfig,
    handleCheckAgain,
    handleContactSupport,
    handleLogout,
  };
}
