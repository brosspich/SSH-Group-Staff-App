import { zustandStorage } from "@/shared/services/storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { UserProfile } from "../types/auth.types";

export interface AuthStoreState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthStoreActions {
  setSession: (user: UserProfile, token: string) => void;
  clearSession: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export type AuthStore = AuthStoreState & AuthStoreActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setSession: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }),

      clearSession: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),
    }),
    {
      name: "ssh_auth_storage",
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// Backward-compatibility bridge for any non-hook callers
export const authStore = {
  getState: () => useAuthStore.getState(),
  setState: (partial: Partial<AuthStoreState>) =>
    useAuthStore.setState(partial),
  subscribe: (listener: (state: AuthStoreState) => void) =>
    useAuthStore.subscribe(listener),
  setSession: (user: UserProfile, token: string) =>
    useAuthStore.getState().setSession(user, token),
  clearSession: () => useAuthStore.getState().clearSession(),
};
