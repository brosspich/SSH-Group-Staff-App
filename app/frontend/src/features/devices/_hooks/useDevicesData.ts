import { useUser } from "@/contexts/UserContext";
import {
  autoTerminateInactiveSessions,
  fetchUserDeviceSessions,
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
        const targetUserId = user?.system_id || user?.id;
        if (targetUserId) {
          await syncDeviceSession(targetUserId);
          const freshSessions = await fetchUserDeviceSessions(targetUserId);
          if (isMounted && freshSessions.length > 0) {
            setDevices(freshSessions);
          }
          await refresh(true);
        }
      } catch (e) {
        console.error("Failed to get session ID:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    initSession();
    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.system_id]);

  // 2. Synchronize devices state with user context fallback
  useEffect(() => {
    if (user?.devices && Array.isArray(user.devices) && devices.length === 0) {
      setDevices(user.devices as DeviceSession[]);
    }
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
    const targetUserId = user?.system_id || user?.id;
    if (targetUserId) {
      await syncDeviceSession(targetUserId);
      const freshSessions = await fetchUserDeviceSessions(targetUserId);
      if (freshSessions.length > 0) {
        setDevices(freshSessions);
      }
      await refresh(true);
    }
    setRefreshing(false);
  }, [user?.id, user?.system_id, refresh]);

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
            const targetUserId = user?.system_id || user?.id;
            const ok = await terminateDeviceSession(targetUserId, sessionId);
            if (!ok) throw new Error("Termination failed");
            setModalVisible(false);
            setSelectedSession(null);
            const fresh = await fetchUserDeviceSessions(targetUserId);
            setDevices(fresh);
            await refresh(true);
          } catch (e) {
            Alert.alert(
              "Error",
              "Could not terminate this session. Please try again.",
            );
          }
        },
      });
    },
    [user?.id, user?.system_id, devices, refresh],
  );

  // Terminate all other sessions
  const requestTerminateAllOtherSessions = useCallback(() => {
    const targetUserId = user?.system_id || user?.id;
    if (!targetUserId || !currentSessionId) return;

    setAlertConfig({
      visible: true,
      title: "Terminate Sessions",
      body: "Are you sure you want to terminate all other sessions? This will log out all other devices.",
      type: "destructive",
      confirmText: "Terminate",
      onConfirm: async () => {
        try {
          const ok = await terminateOtherDeviceSessions(
            targetUserId,
            currentSessionId,
          );
          if (!ok) throw new Error("Termination failed");
          const fresh = await fetchUserDeviceSessions(targetUserId);
          setDevices(fresh);
          await refresh(true);
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
  }, [user?.id, user?.system_id, currentSessionId, refresh]);

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
        d.os?.toLowerCase().includes("harmony") ||
        d.os?.toLowerCase().includes("android") ||
        d.os?.toLowerCase() === Platform.OS.toLowerCase(),
    ) ||
    nonTerminatedDevices[0];

  const activeSessions = nonTerminatedDevices.filter((d) => {
    if (d.id === (thisDevice?.id ?? currentSessionId)) return false;
    // Exclude older duplicate entries of the current physical device
    if (
      thisDevice &&
      d.device_type === thisDevice.device_type &&
      d.os === thisDevice.os &&
      (d.device_name === thisDevice.device_name ||
        d.model_name === thisDevice.model_name)
    ) {
      return false;
    }
    return true;
  });

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
