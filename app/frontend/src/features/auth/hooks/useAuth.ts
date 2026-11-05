import { useLoginStore } from "@/features/login/_store/useLoginStore";
import { logger } from "@/services/logger";
import { useCallback } from "react";
import { authApi } from "../api/authApi";
import { useAuthStore } from "../store/authStore";
import { LoginCredentials } from "../types/auth.types";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authApi.login(credentials);
        setSession(response.user, response.token);
        return response.user;
      } catch (err: any) {
        const message =
          err?.message || "Login failed. Please check your credentials.";
        logger.error("Login error", err);
        setError(message);
        throw err;
      }
    },
    [setLoading, setError, setSession],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      logger.warn("Failed to invalidate server session during logout", { err });
    } finally {
      clearSession();
      useLoginStore.getState().resetForm();
    }
  }, [clearSession]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  };
}
