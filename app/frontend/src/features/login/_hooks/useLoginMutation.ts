import { fetchSubscriptionBySystemId } from "@/features/subscription/_api/subscriptionApi";
import { extractSystemKey } from "@/shared/constants/attendanceConfig";
import { useUser } from "@/shared/contexts/UserContext";
import { secureStorage } from "@/shared/services/storage/secureStore.service";
import { userService } from "@/shared/services/userService";
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
        secureStorage.setItem("auth_token", data.token).catch(() => null);
      }

      // 1. Immediately save the newly authenticated user & update context
      await userService.save(data.user);
      setUser(data.user);

      // 2. Check subscription status matching companyId to Subscription table system_id:
      // => subscription => tabs
      // => non subscription / not have data in table => non subscription screen
      const companyId =
        data.user.companyId ||
        (data.user as any)?.company_id ||
        data.user.details?.companyId ||
        extractSystemKey(data.user.system_id || data.user.id) ||
        "system-0001";

      try {
        const sub = await fetchSubscriptionBySystemId(companyId, true);
        if (!sub || sub.isExpired || sub.hasSubscription === false) {
          router.replace("/subscription/non-subscription" as any);
        } else {
          router.replace("/(tabs)/" as any);
        }
      } catch {
        router.replace("/subscription/non-subscription" as any);
      }

      // 3. Background Sync: sync device session & hydrate fresh config asynchronously
      syncDeviceSession(data.user.system_id || data.user.id, true, true)
        .then(() => refresh(false))
        .catch((err) => {
          console.warn("Failed to sync device session in background:", err);
        });
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
