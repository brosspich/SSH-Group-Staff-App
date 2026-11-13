import { create } from "zustand";
import type { SubscriptionInfo } from "../_types/subscription.types";

export interface SubscriptionStoreState {
  subscription: SubscriptionInfo | null;
  selectedSystemId: string;
  cachedAt: number | null;
  isLoading: boolean;
  error: string | null;
}

export interface SubscriptionStoreActions {
  setSubscription: (sub: SubscriptionInfo | null) => void;
  setSelectedSystemId: (sysId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export type SubscriptionStore = SubscriptionStoreState &
  SubscriptionStoreActions;

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  subscription: null,
  selectedSystemId: "system-0001",
  cachedAt: null,
  isLoading: false,
  error: null,

  setSubscription: (subscription) =>
    set({
      subscription,
      cachedAt: Date.now(),
      isLoading: false,
      error: null,
    }),
  setSelectedSystemId: (selectedSystemId) =>
    set({ selectedSystemId: selectedSystemId.toLowerCase() }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  clear: () =>
    set({
      subscription: null,
      cachedAt: null,
      isLoading: false,
      error: null,
    }),
}));
