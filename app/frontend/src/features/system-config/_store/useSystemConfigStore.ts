import { create } from "zustand";
import {
  DEFAULT_SYSTEM_CONFIG,
  type SystemConfig,
} from "../_types/systemConfig.types";

export interface SystemConfigStoreState {
  config: SystemConfig;
  lastSyncTimestamp: number | null;
  isLoading: boolean;
  error: string | null;
}

export interface SystemConfigStoreActions {
  setConfig: (config: SystemConfig) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export type SystemConfigStore = SystemConfigStoreState &
  SystemConfigStoreActions;

export const useSystemConfigStore = create<SystemConfigStore>((set) => ({
  config: DEFAULT_SYSTEM_CONFIG,
  lastSyncTimestamp: null,
  isLoading: false,
  error: null,

  setConfig: (config) =>
    set({
      config,
      lastSyncTimestamp: Date.now(),
      isLoading: false,
      error: null,
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}));
