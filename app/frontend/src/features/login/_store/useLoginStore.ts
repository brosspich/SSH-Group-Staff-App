import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const REMEMBERED_USERNAME_KEY = "ssh_remembered_username";

export interface LoginStoreState {
  username: string;
  showPassword: boolean;
  showPrivacy: boolean;
  error: string | null;
  isLoading: boolean;
}

export interface LoginStoreActions {
  setUsername: (username: string) => void;
  setShowPassword: (showPassword: boolean) => void;
  toggleShowPassword: () => void;
  setShowPrivacy: (showPrivacy: boolean) => void;
  setError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  loadCachedUsername: () => Promise<void>;
  cacheUsername: (username: string) => Promise<void>;
  resetForm: () => void;
}

export type LoginStore = LoginStoreState & LoginStoreActions;

export const useLoginStore = create<LoginStore>((set) => ({
  username: "",
  showPassword: false,
  showPrivacy: false,
  error: null,
  isLoading: false,

  setUsername: (username: string) => set({ username, error: null }),
  setShowPassword: (showPassword: boolean) => set({ showPassword }),
  toggleShowPassword: () =>
    set((state) => ({ showPassword: !state.showPassword })),
  setShowPrivacy: (showPrivacy: boolean) => set({ showPrivacy }),
  setError: (error: string | null) => set({ error, isLoading: false }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),

  loadCachedUsername: async () => {
    try {
      const cached = await AsyncStorage.getItem(REMEMBERED_USERNAME_KEY);
      if (cached) set({ username: cached });
    } catch {}
  },

  cacheUsername: async (username: string) => {
    try {
      if (username) {
        await AsyncStorage.setItem(REMEMBERED_USERNAME_KEY, username.trim());
      }
    } catch {}
  },

  resetForm: () => set({ error: null, isLoading: false }),
}));
