import { activationService } from "@/services/activationService";
import { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

const POLL_INTERVAL_MS = 60_000; // catches natural end_date expiry

export function useActivationStatus(system_id: string | null) {
  const [activated, setActivated] = useState(false);
  const [checking, setChecking] = useState(true);
  const isMounted = useRef(false);
  const [prevSystemId, setPrevSystemId] = useState<string | null>(null);

  if (system_id !== prevSystemId) {
    setPrevSystemId(system_id);
    setActivated(false);
    setChecking(system_id ? true : false);
  }

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!system_id) {
      setChecking(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const check = async () => {
      const isActive = await activationService.checkActivation(system_id, true);
      if (isMounted.current) {
        setActivated(isActive);
        setChecking(false);
      }
    };

    check();

    // Realtime: fires on admin changes to the row (renewal, revoke, edit)
    unsubscribe = activationService.subscribeToActivation(
      system_id,
      (isActive) => {
        if (isMounted.current) setActivated(isActive);
      },
    );

    // Polling: fires on natural expiry (end_date passes with no DB write)
    intervalId = setInterval(check, POLL_INTERVAL_MS);

    // AppState: fires when app comes back to foreground
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        await check();
      }
    };
    const appStateSub = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      unsubscribe?.();
      if (intervalId) clearInterval(intervalId);
      appStateSub.remove();
    };
  }, [system_id]);

  return { activated, checking };
}
