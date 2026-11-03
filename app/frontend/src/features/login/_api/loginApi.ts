import { apiClient } from "@/services/api";
import type { StaffUser } from "@/services/userService";
import { isLeaveRole } from "@/utils/roleUtils";
import type { LoginCredentials, LoginResult } from "../_types/login.types";

interface LoginApiResponse {
  user: StaffUser;
  token?: string;
}

/**
 * Dispatches login request against Backend API and validates credentials securely on server
 */
export async function loginUserApi(
  credentials: LoginCredentials,
): Promise<LoginResult> {
  const cleanInput = credentials.username.trim();
  const cleanInputPassword = credentials.password.trim();

  let response: LoginApiResponse | null = null;
  try {
    response = await apiClient.post<LoginApiResponse>(
      "/auth/login",
      {
        username: cleanInput,
        password: cleanInputPassword,
      },
      {
        timeout: 10000,
      },
    );
  } catch (err: any) {
    console.warn("Login API error:", err);
    throw new Error(
      err?.message ||
        "Cannot connect to server. Please check your network or try again.",
    );
  }

  if (!response || !response.user) {
    throw new Error("Invalid username or password.");
  }

  const user = response.user;

  if (isLeaveRole(user.role)) {
    throw new Error("Your account is on leave. Contact admin.");
  }

  if ((user as any).is_active === false || (user as any).isActive === false) {
    throw new Error("Your account is inactive. Contact admin.");
  }

  return {
    user,
    token: response.token,
  };
}
