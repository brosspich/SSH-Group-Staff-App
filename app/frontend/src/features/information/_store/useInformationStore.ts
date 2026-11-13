import type { StaffUser } from "@/shared/services/userService";
import { create } from "zustand";

export interface InformationStoreState {
  user: StaffUser | null;
  lastSyncTimestamp: number | null;
  isLoading: boolean;
  error: string | null;
}

export interface InformationStoreActions {
  setUser: (user: StaffUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export type InformationStore = InformationStoreState & InformationStoreActions;

export const useInformationStore = create<InformationStore>((set) => ({
  user: null,
  lastSyncTimestamp: null,
  isLoading: false,
  error: null,

  setUser: (user) =>
    set({
      user,
      lastSyncTimestamp: Date.now(),
      isLoading: false,
      error: null,
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}));
