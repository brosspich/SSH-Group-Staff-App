import { apiClient } from "@/services/api";
import type { StaffUser } from "@/services/userService";
import type { LoginCredentials, LoginResult } from "../_types/login.types";

interface LoginApiResponse {
  user: StaffUser;
  token?: string;
}

/**
 * Dispatches login credentials to Backend API (Backend 70% handles password matching, account status, roles, token generation).
 */
export async function loginUserApi(
  credentials: LoginCredentials,
): Promise<LoginResult> {
  const cleanUsername = credentials.username.trim();
  const cleanPassword = credentials.password.trim();

  let response: LoginApiResponse | null = null;
  try {
    response = await apiClient.post<LoginApiResponse>(
      "/auth/login",
      {
        username: cleanUsername,
        password: cleanPassword,
      },
      {
        timeout: 10000,
      },
    );
  } catch (err: any) {
    const serverMessage =
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.message;

    throw new Error(
      serverMessage || "Cannot connect to server. Please check your network.",
    );
  }

  if (!response || !response.user) {
    throw new Error("Invalid username or password.");
  }

  return {
    user: response.user,
    token: response.token,
  };
}
