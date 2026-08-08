import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "serviceuser";

export interface PosAdminUser {
  id: string;
  system_id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  created_at: string;
  devices?: any;
}

export const userService = {
  async save(user: PosAdminUser): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async get(): Promise<PosAdminUser | null> {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as PosAdminUser) : null;
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem("pos_device_session_id");
    await AsyncStorage.removeItem(USER_KEY);
  },

  async isLoggedIn(): Promise<boolean> {
    const user = await this.get();
    return user !== null;
  },
};

export const serviceUser = userService;
