import { create } from "zustand";
import { SshKey } from "../types/key.types";

export interface KeyStoreState {
  keys: SshKey[];
  isLoading: boolean;
  error: string | null;
}

export interface KeyStoreActions {
  setKeys: (keys: SshKey[]) => void;
  addKey: (key: SshKey) => void;
  removeKey: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export type KeyStore = KeyStoreState & KeyStoreActions;

export const useKeyStore = create<KeyStore>((set) => ({
  keys: [],
  isLoading: false,
  error: null,

  setKeys: (keys) => set({ keys, isLoading: false, error: null }),
  addKey: (key) => set((state) => ({ keys: [key, ...state.keys] })),
  removeKey: (id) =>
    set((state) => ({ keys: state.keys.filter((k) => k.id !== id) })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}));
