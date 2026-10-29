import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "serviceuser";

export interface StaffUser {
  id: string;
  system_id?: string;
  staff_id?: string;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  position?: string;
  role?: any;
  is_active?: boolean;
  joined?: string;
  created_at?: string;
  devices?: any;
  attendance?: any;
  request_attendance_rules?: any;
}

export const userService = {
  async save(user: StaffUser): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async get(): Promise<StaffUser | null> {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StaffUser) : null;
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
