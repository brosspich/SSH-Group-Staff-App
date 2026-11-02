export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  name?: string;
  role?: string;
  position?: string;
  staff_id?: string;
  is_active?: boolean;
}

export interface LoginCredentials {
  username: string;
  password?: string;
  deviceSessionId?: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
  refreshToken?: string;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
