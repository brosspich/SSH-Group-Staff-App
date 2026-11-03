import { useUser } from "@/contexts/UserContext";
import {
  autoTerminateInactiveSessions,
  getSessionId,
  syncDeviceSession,
  terminateDeviceSession,
  terminateOtherDeviceSessions,
} from "@/utils/deviceSession";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import type {
  AlertConfig,
  DeviceSession,
  InactivePeriod,
} from "../_types/devices.types";
import {
  INACTIVE_PERIODS,
  INACTIVE_PERIOD_STORAGE_KEY,
} from "../_utils/devicesConstants";

export function useDevicesData() {
  const { user, refresh } = useUser();

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [devices, setDevices] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [selectedSession, setSelectedSession] = useState<DeviceSession | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [addDeviceModalVisible, setAddDeviceModalVisible] = useState(false);
  const [selfDestructModalVisible, setSelfDestructModalVisible] =
    useState(false);

  // Inactive period state
  const [inactivePeriod, setInactivePeriod] =
    useState<InactivePeriod>("6 months");

  // Alert State
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    visible: false,
    title: "",
    body: "",
    type: "destructive",
    confirmText: "Terminate",
    onConfirm: null,
  });

  // 1. Initialize current session & sync
  useEffect(() => {
    let isMounted = true;
    const initSession = async () => {
      try {
        const sessionId = await getSessionId();
        if (isMounted) {
          setCurrentSessionId(sessionId);
        }
        if (user?.id) {
          await syncDeviceSession(user.id);
          await refresh();
        }
      } catch (e) {
        console.error("Failed to get session ID:", e);
      }
    };
    initSession();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // 2. Synchronize devices state with user context
  useEffect(() => {
    if (user?.devices && Array.isArray(user.devices)) {
      setDevices(user.devices as DeviceSession[]);
    } else {
      setDevices([]);
    }
    setLoading(false);
  }, [user?.devices]);

  // 3. Load saved inactive period
  useEffect(() => {
    const loadInactivePeriod = async () => {
      try {
        const stored = await AsyncStorage.getItem(INACTIVE_PERIOD_STORAGE_KEY);
        if (stored && INACTIVE_PERIODS.includes(stored as InactivePeriod)) {
          setInactivePeriod(stored as InactivePeriod);
        }
      } catch (e) {
        console.warn("Failed to load inactive period setting:", e);
      }
    };
    loadInactivePeriod();
  }, []);

  // 4. Auto-terminate sessions older than threshold
  useEffect(() => {
    if (user?.id && currentSessionId) {
      autoTerminateInactiveSessions(
        user.id,
        currentSessionId,
        inactivePeriod,
      ).then((updated) => {
        if (updated) {
          refresh();
        }
      });
    }
  }, [user?.id, currentSessionId, inactivePeriod]);

  // 5. Background polling every 5s while viewing this screen
  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(() => {
      refresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [user?.id, refresh]);

  // Pull-To-Refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (user?.id) {
      await syncDeviceSession(user.id);
      await refresh();
    }
    setRefreshing(false);
  }, [user?.id, refresh]);

  // Save inactive period
  const handleSelectInactivePeriod = useCallback(
    async (period: InactivePeriod) => {
      setInactivePeriod(period);
      setSelfDestructModalVisible(false);
      try {
        await AsyncStorage.setItem(INACTIVE_PERIOD_STORAGE_KEY, period);
        if (user?.id && currentSessionId) {
          const updated = await autoTerminateInactiveSessions(
            user.id,
            currentSessionId,
            period,
          );
          if (updated) {
            refresh();
          }
        }
      } catch (e) {
        console.warn("Failed to save inactive period setting:", e);
      }
    },
    [user?.id, currentSessionId, refresh],
  );

  // Terminate a single device session
  const requestTerminateSession = useCallback(
    (sessionId: string) => {
      if (!user?.id) return;
      const targetSession = devices.find((d) => d.id === sessionId);
      const name = targetSession?.device_name || "this device";

      setAlertConfig({
        visible: true,
        title: "Terminate Session",
        body: `Are you sure you want to terminate the session for "${name}"?`,
        type: "destructive",
        confirmText: "Terminate",
        onConfirm: async () => {
          try {
            const ok = await terminateDeviceSession(user.id, sessionId);
            if (!ok) throw new Error("Termination failed");
            setModalVisible(false);
            setSelectedSession(null);
            await refresh();
          } catch (e) {
            Alert.alert(
              "Error",
              "Could not terminate this session. Please try again.",
            );
          }
        },
      });
    },
    [user?.id, devices, refresh],
  );

  // Terminate all other sessions
  const requestTerminateAllOtherSessions = useCallback(() => {
    if (!user?.id || !currentSessionId) return;

    setAlertConfig({
      visible: true,
      title: "Terminate Sessions",
      body: "Are you sure you want to terminate all other sessions? This will log out all other devices.",
      type: "destructive",
      confirmText: "Terminate",
      onConfirm: async () => {
        try {
          const ok = await terminateOtherDeviceSessions(
            user.id,
            currentSessionId,
          );
          if (!ok) throw new Error("Termination failed");
          await refresh();
        } catch (e) {
          setAlertConfig({
            visible: true,
            title: "Error",
            body: "Failed to terminate other sessions.",
            type: "destructive",
            confirmText: "OK",
            onConfirm: null,
          });
        }
      },
    });
  }, [user?.id, currentSessionId, refresh]);

  const closeAlert = useCallback(() => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  // Filter non-terminated devices
  const nonTerminatedDevices = devices.filter(
    (d) =>
      d.terminate !== true &&
      d.terminate !== "true" &&
      String(d.terminate).toLowerCase() !== "true",
  );

  const thisDevice =
    nonTerminatedDevices.find((d) => d.id === currentSessionId) ||
    nonTerminatedDevices.find(
      (d) =>
        d.device_type === (Platform.OS === "web" ? "web" : "phone") &&
        d.os === (Platform.OS === "web" ? "Windows" : "HarmonyOS"),
    );

  const activeSessions = nonTerminatedDevices.filter(
    (d) => d.id !== (thisDevice?.id ?? currentSessionId),
  );

  return {
    loading,
    refreshing,
    onRefresh,
    currentSessionId,
    devices,
    thisDevice,
    activeSessions,
    selectedSession,
    setSelectedSession,
    modalVisible,
    setModalVisible,
    addDeviceModalVisible,
    setAddDeviceModalVisible,
    selfDestructModalVisible,
    setSelfDestructModalVisible,
    inactivePeriod,
    handleSelectInactivePeriod,
    alertConfig,
    closeAlert,
    requestTerminateSession,
    requestTerminateAllOtherSessions,
  };
}
