import type { DeviceSession, InactivePeriod } from "@/utils/deviceSession";
import { create } from "zustand";

export interface DevicesStoreState {
  devices: DeviceSession[];
  currentSessionId: string | null;
  inactivePeriod: InactivePeriod;
  selectedSession: DeviceSession | null;
  lastSyncTimestamp: number | null;
  isLoading: boolean;
  error: string | null;
}

export interface DevicesStoreActions {
  setDevices: (devices: DeviceSession[]) => void;
  setCurrentSessionId: (id: string | null) => void;
  setInactivePeriod: (period: InactivePeriod) => void;
  setSelectedSession: (session: DeviceSession | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export type DevicesStore = DevicesStoreState & DevicesStoreActions;

export const useDevicesStore = create<DevicesStore>((set) => ({
  devices: [],
  currentSessionId: null,
  inactivePeriod: "6 months",
  selectedSession: null,
  lastSyncTimestamp: null,
  isLoading: false,
  error: null,

  setDevices: (devices) =>
    set({
      devices,
      lastSyncTimestamp: Date.now(),
      isLoading: false,
      error: null,
    }),
  setCurrentSessionId: (currentSessionId) => set({ currentSessionId }),
  setInactivePeriod: (inactivePeriod) => set({ inactivePeriod }),
  setSelectedSession: (selectedSession) => set({ selectedSession }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  clear: () =>
    set({
      devices: [],
      selectedSession: null,
      lastSyncTimestamp: null,
      isLoading: false,
      error: null,
    }),
}));
