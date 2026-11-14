import { fetchSubscriptionBySystemId } from "@/features/subscription/_api/subscriptionApi";
import Loading from "@/shared/components/loading/loading";
import { extractSystemKey } from "@/shared/constants/attendanceConfig";
import { useUser } from "@/shared/contexts/UserContext";
import { theme } from "@/shared/styles/theme";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StatusBar, View } from "react-native";

export default function Index() {
  const { user, loading } = useUser();
  const [checkingSub, setCheckingSub] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const navigatedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    if (!loading && user) {
      const companyId =
        user.companyId ||
        (user as any)?.company_id ||
        user.details?.companyId ||
        extractSystemKey(
          user.system_id || (user as any)?.systemId || user.id,
        ) ||
        "system-0001";
      fetchSubscriptionBySystemId(companyId, true)
        .then((sub) => {
          if (isMounted) {
            const hasNoValidSub =
              !sub || sub.isExpired || sub.hasSubscription === false;
            setIsExpired(hasNoValidSub);
            setCheckingSub(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setIsExpired(true);
            setCheckingSub(false);
          }
        });
    } else if (!loading && !user) {
      setCheckingSub(false);
    }
    return () => {
      isMounted = false;
    };
  }, [loading, user]);

  // Navigate imperatively without unmounting to null or flashing blank screen
  useEffect(() => {
    if (!loading && !checkingSub && !navigatedRef.current) {
      navigatedRef.current = true;
      if (!user) {
        router.replace("/login/login");
      } else if (isExpired) {
        router.replace("/subscription/non-subscription" as any);
      } else {
        router.replace("/(tabs)");
      }
    }
  }, [loading, checkingSub, user, isExpired]);

  // Always keep Loading component visible until the target screen has mounted!
  // Avoids returning null or Redirect component which caused the white blank screen flash.
  return (
    <>
      <StatusBar
        backgroundColor={theme.colors.secondary}
        barStyle="light-content"
      />
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loading />
      </View>
    </>
  );
}
