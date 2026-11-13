import { fetchSubscriptionBySystemId } from "@/features/subscription/_api/subscriptionApi";
import Loading from "@/shared/components/loading/loading";
import { useUser } from "@/shared/contexts/UserContext";
import { theme } from "@/shared/styles/theme";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { StatusBar, View } from "react-native";

export default function Index() {
  const { user, loading } = useUser();
  const [checkingSub, setCheckingSub] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!loading && user) {
      const sysId = user.system_id || (user as any).systemId || user.companyId;
      fetchSubscriptionBySystemId(sysId)
        .then((sub) => {
          if (isMounted) {
            setIsExpired(!!sub?.isExpired);
            setCheckingSub(false);
          }
        })
        .catch(() => {
          if (isMounted) setCheckingSub(false);
        });
    } else if (!loading && !user) {
      setCheckingSub(false);
    }
    return () => {
      isMounted = false;
    };
  }, [loading, user]);

  if (loading || (user && checkingSub)) {
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

  if (!user) {
    return <Redirect href={"/login/login" as any} />;
  }

  if (isExpired) {
    return <Redirect href={"/subscription/non-subscription" as any} />;
  }

  return <Redirect href={"/(tabs)" as any} />;
}
