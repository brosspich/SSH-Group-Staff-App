import { useUser } from "@/shared/contexts/UserContext";
import {
  autoTerminateInactiveSessions,
  getSessionId,
  syncDeviceSession,
} from "@/utils/deviceSession";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import { useDevicesStore } from "../_store/useDevicesStore";
import type { AlertConfig, InactivePeriod } from "../_types/devices.types";
import {
  INACTIVE_PERIODS,
  INACTIVE_PERIOD_STORAGE_KEY,
} from "../_utils/devicesConstants";
import { useDevicesQuery } from "./useDevicesQuery";
import { useTerminateDeviceMutation } from "./useTerminateDeviceMutation";

export function useDevicesData() {
  const { user, refresh } = useUser();
  const targetUserId = user?.system_id || user?.id;

  // TanStack Query + Zustand Store
  const {
    data: queryDevices,
    isLoading: loadingQuery,
    refetch,
  } = useDevicesQuery(targetUserId);

  const cachedDevices = useDevicesStore((state) => state.devices);
  const currentSessionId = useDevicesStore((state) => state.currentSessionId);
  const setCurrentSessionId = useDevicesStore(
    (state) => state.setCurrentSessionId,
  );
  const inactivePeriod = useDevicesStore((state) => state.inactivePeriod);
  const setInactivePeriod = useDevicesStore((state) => state.setInactivePeriod);
  const selectedSession = useDevicesStore((state) => state.selectedSession);
  const setSelectedSession = useDevicesStore(
    (state) => state.setSelectedSession,
  );

  const terminateMutation = useTerminateDeviceMutation();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [addDeviceModalVisible, setAddDeviceModalVisible] = useState(false);
  const [selfDestructModalVisible, setSelfDestructModalVisible] =
    useState(false);

  // Alert State
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    visible: false,
    title: "",
    body: "",
    type: "destructive",
    confirmText: "Terminate",
    onConfirm: null,
  });

  const devices = queryDevices || cachedDevices;

  // 1. Initialize current session & sync
  useEffect(() => {
    let isMounted = true;
    const initSession = async () => {
      try {
        const sessionId = await getSessionId();
        if (isMounted) {
          setCurrentSessionId(sessionId);
        }
        if (targetUserId) {
          await syncDeviceSession(targetUserId);
          await refetch();
        }
      } catch (e) {
        console.error("Failed to get session ID:", e);
      }
    };
    initSession();
    return () => {
      isMounted = false;
    };
  }, [targetUserId, refetch, setCurrentSessionId]);

  // 2. Load saved inactive period
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
  }, [setInactivePeriod]);

  // 3. Auto-terminate sessions older than threshold
  useEffect(() => {
    if (user?.id && currentSessionId) {
      autoTerminateInactiveSessions(
        user.id,
        currentSessionId,
        inactivePeriod,
      ).then((updated) => {
        if (updated) {
          refetch();
          refresh();
        }
      });
    }
  }, [user?.id, currentSessionId, inactivePeriod, refetch, refresh]);

  // Pull-To-Refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (targetUserId) {
      await syncDeviceSession(targetUserId);
      await refetch();
      await refresh(true);
    }
    setRefreshing(false);
  }, [targetUserId, refetch, refresh]);

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
            refetch();
            refresh();
          }
        }
      } catch (e) {
        console.warn("Failed to save inactive period setting:", e);
      }
    },
    [user?.id, currentSessionId, refetch, refresh, setInactivePeriod],
  );

  // Terminate a single device session using TanStack Query useMutation
  const requestTerminateSession = useCallback(
    (sessionId: string) => {
      if (!targetUserId) return;
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
            await terminateMutation.mutateAsync({
              userId: targetUserId,
              sessionId,
            });
            setModalVisible(false);
            setSelectedSession(null);
            await refetch();
          } catch (e) {
            setAlertConfig({
              visible: true,
              title: "Error",
              body: "Could not terminate this session. Please try again.",
              type: "destructive",
              confirmText: "OK",
              onConfirm: null,
            });
          }
        },
      });
    },
    [targetUserId, devices, terminateMutation, refetch, setSelectedSession],
  );

  // Terminate all other sessions using TanStack Query useMutation
  const requestTerminateAllOtherSessions = useCallback(() => {
    if (!targetUserId || !currentSessionId) return;

    setAlertConfig({
      visible: true,
      title: "Terminate Sessions",
      body: "Are you sure you want to terminate all other sessions? This will log out all other devices.",
      type: "destructive",
      confirmText: "Terminate",
      onConfirm: async () => {
        try {
          await terminateMutation.mutateAsync({
            userId: targetUserId,
            keepDeviceId: currentSessionId || "",
            terminateAllOthers: true,
          });
          await refetch();
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
  }, [targetUserId, currentSessionId, terminateMutation, refetch]);

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

  const activeSessions = nonTerminatedDevices.filter(
    (d) => d.id !== (thisDevice?.id || currentSessionId),
  );

  return {
    user,
    devices: nonTerminatedDevices,
    thisDevice,
    activeSessions,
    loading: loadingQuery && devices.length === 0,
    refreshing,
    currentSessionId,
    selectedSession,
    setSelectedSession,
    modalVisible,
    setModalVisible,
    addDeviceModalVisible,
    setAddDeviceModalVisible,
    selfDestructModalVisible,
    setSelfDestructModalVisible,
    inactivePeriod,
    alertConfig,
    onRefresh,
    handleSelectInactivePeriod,
    requestTerminateSession,
    requestTerminateAllOtherSessions,
    closeAlert,
  };
}
