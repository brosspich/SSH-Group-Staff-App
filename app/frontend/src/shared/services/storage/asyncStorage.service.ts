import AsyncStorage from '@react-native-async-storage/async-storage';
import { IStorageService } from './storage.interface';

export class AsyncStorageAdapter implements IStorageService {
  async getItem(key: string): Promise<string | null> {
    return await AsyncStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  }
}

export const appStorage: IStorageService = new AsyncStorageAdapter();
