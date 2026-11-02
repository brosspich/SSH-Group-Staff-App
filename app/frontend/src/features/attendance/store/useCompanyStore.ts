import { create } from "zustand";
import {
  DynamicSystemItem,
  OfficialAttendanceConfig,
} from "@/constants/attendanceConfig";

export interface CompanyStoreState {
  config: OfficialAttendanceConfig | null;
  availableSystems: DynamicSystemItem[];
  isLoading: boolean;
  error: string | null;
}

export interface CompanyStoreActions {
  setConfig: (config: OfficialAttendanceConfig) => void;
  setAvailableSystems: (systems: DynamicSystemItem[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export type CompanyStore = CompanyStoreState & CompanyStoreActions;

export const useCompanyStore = create<CompanyStore>((set) => ({
  config: null,
  availableSystems: [],
  isLoading: false,
  error: null,

  setConfig: (config) => set({ config, isLoading: false, error: null }),
  setAvailableSystems: (availableSystems) => set({ availableSystems }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}));
