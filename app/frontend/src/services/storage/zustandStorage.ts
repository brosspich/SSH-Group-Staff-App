import { StateStorage } from 'zustand/middleware';
import { appStorage } from './asyncStorage.service';

/**
 * Zustand StateStorage adapter backed by appStorage (Dependency Inversion).
 * Allows persistent Zustand slices across iOS, Android, and Web seamlessly.
 */
export const zustandStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await appStorage.getItem(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await appStorage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await appStorage.removeItem(name);
  },
};
