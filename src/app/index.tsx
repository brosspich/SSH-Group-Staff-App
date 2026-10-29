import Loading from "@/components/loading/loading";
import { AppColors } from "@/constants/appcolors";
import { userService } from "@/services/userService";
import { router, useRootNavigationState } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StatusBar, View } from "react-native";

export default function Index() {
  const navState = useRootNavigationState();
  const [checkingUser, setCheckingUser] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const user = await userService.get();
      if (ignore || !isMounted.current) return;

      if (!user) {
        setLoggedIn(false);
        setCheckingUser(false);
        return;
      }
      setLoggedIn(true);
      setCheckingUser(false);
    })();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!checkingUser && navState?.key && isMounted.current) {
      if (!loggedIn) {
        router.replace("/login/login" as any);
      } else {
        router.replace("/(tabs)" as any);
      }
    }
  }, [checkingUser, loggedIn, navState?.key]);

  return (
    <>
      <StatusBar
        backgroundColor={AppColors.secondary}
        barStyle="light-content"
      />
      <View
        style={{
          flex: 1,
          backgroundColor: AppColors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loading />
      </View>
    </>
  );
}
