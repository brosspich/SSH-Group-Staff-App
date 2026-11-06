import { apiClient } from "@/shared/services/api";
import {
  AuthResponse,
  LoginCredentials,
  UserProfile,
} from "../types/auth.types";

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return await apiClient.post<AuthResponse>("/auth/login", credentials);
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  async getProfile(): Promise<UserProfile> {
    return await apiClient.get<UserProfile>("/auth/me");
  },

  async refreshToken(token: string): Promise<{ token: string }> {
    return await apiClient.post<{ token: string }>("/auth/refresh", { token });
  },
};
