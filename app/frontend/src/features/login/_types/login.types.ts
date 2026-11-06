import type { StaffUser } from "@/shared/services/userService";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResult {
  user: StaffUser;
  token?: string;
}

export interface LoginFormState {
  username: string;
  password: string;
  showPassword: boolean;
  showPrivacy: boolean;
  error: string | null;
  loading: boolean;
}
