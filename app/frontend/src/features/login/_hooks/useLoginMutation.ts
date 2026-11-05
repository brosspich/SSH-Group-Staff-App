import { useUser } from "@/contexts/UserContext";
import { secureStorage } from "@/services/storage/secureStore.service";
import { userService } from "@/services/userService";
import { syncDeviceSession } from "@/utils/deviceSession";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { loginUserApi } from "../_api/loginApi";
import { useLoginStore } from "../_store/useLoginStore";
import type { LoginCredentials, LoginResult } from "../_types/login.types";

/**
 * TanStack Query Mutation: Handles login request, error dispatching,
 * device session sync, and cache invalidation.
 */
export function useLoginMutation() {
  const queryClient = useQueryClient();
  const { setUser, refresh } = useUser();
  const setError = useLoginStore((state) => state.setError);
  const setIsLoading = useLoginStore((state) => state.setIsLoading);
  const cacheUsername = useLoginStore((state) => state.cacheUsername);

  return useMutation<LoginResult, Error, LoginCredentials>({
    mutationFn: loginUserApi,
    onMutate: () => {
      setError(null);
      setIsLoading(true);
    },
    onSuccess: async (data, variables) => {
      setError(null);
      setIsLoading(false);

      // Clear any prior user's queries
      queryClient.clear();

      if (data.token) {
        await secureStorage.setItem("auth_token", data.token).catch(() => null);
      }

      // Persist the newly authenticated user to storage and immediately update context
      await userService.save(data.user);
      setUser(data.user);

      try {
        await syncDeviceSession(data.user.id, true);
      } catch (err) {
        console.warn("Failed to sync device session during login:", err);
      }

      await refresh(true);
      router.replace("/");
    },
    onError: (err) => {
      setIsLoading(false);
      setError(
        err.message ||
          "An unexpected error occurred during login. Please try again.",
      );
    },
  });
}
