import { useActivationStatus } from "@/hooks/useActivationStatus";
import { userService } from "@/services/userService";
import { router, usePathname, useRootNavigationState } from "expo-router";
import { useEffect, useRef, useState } from "react";

export default function ActivationGuard() {
  const pathname = usePathname();
  const navState = useRootNavigationState();
  const [systemId, setSystemId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Sync user state on pathname changes
  useEffect(() => {
    let ignore = false;
    (async () => {
      const user = await userService.get();
      if (ignore || !isMounted.current) return;
      setSystemId(user ? user.system_id : null);
      setLoadingUser(false);
    })();

    return () => {
      ignore = true;
    };
  }, [pathname]);

  const { activated, checking: checkingActivation } =
    useActivationStatus(systemId);

  useEffect(() => {
    // Only redirect if:
    // 1. Navigation is ready (navState?.key is set)
    // 2. User info load attempt is completed and we have a valid logged-in user (systemId)
    // 3. Activation check is completed and user is not activated
    // 4. We are not already on the NonActivation screen or login screen
    if (
      navState?.key &&
      !loadingUser &&
      systemId &&
      !checkingActivation &&
      !activated
    ) {
      if (
        pathname !== "/activation/NonActivation" &&
        pathname !== "/login/login"
      ) {
        router.replace("/activation/NonActivation");
      }
    }
  }, [
    navState?.key,
    loadingUser,
    systemId,
    checkingActivation,
    activated,
    pathname,
  ]);

  return null;
}
