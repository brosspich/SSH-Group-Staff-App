import { appStorage, IStorageService } from './storage';
import { STORAGE_KEYS } from '@/utils/constants';

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

export class UserService {
  constructor(private readonly storage: IStorageService = appStorage) {}

  async save(user: StaffUser): Promise<void> {
    await this.storage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
  }

  async get(): Promise<StaffUser | null> {
    const raw = await this.storage.getItem(STORAGE_KEYS.USER_PROFILE);
    return raw ? (JSON.parse(raw) as StaffUser) : null;
  }

  async clear(): Promise<void> {
    await this.storage.removeItem(STORAGE_KEYS.DEVICE_SESSION_ID);
    await this.storage.removeItem(STORAGE_KEYS.USER_PROFILE);
  }

  async isLoggedIn(): Promise<boolean> {
    const user = await this.get();
    return user !== null;
  }
}

export const userService = new UserService(appStorage);
export const serviceUser = userService;
