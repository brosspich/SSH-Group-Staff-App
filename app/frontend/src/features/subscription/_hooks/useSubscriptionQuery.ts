import { queryKeys } from "@/shared/services/api/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchSubscriptionBySystemId } from "../_api/subscriptionApi";
import { useSubscriptionStore } from "../_store/useSubscriptionStore";

/**
 * TanStack Query Hook: Server data caching for Subscription Status
 * Connects TanStack Query (Server State) with Zustand (Client Cache)
 */
export function useSubscriptionQuery(
  systemId?: string,
  force: boolean = false,
) {
  const cleanId = (systemId || "").trim().toLowerCase();
  const setSubscription = useSubscriptionStore(
    (state) => state.setSubscription,
  );
  const setError = useSubscriptionStore((state) => state.setError);

  const query = useQuery({
    queryKey: queryKeys.subscription.check(cleanId),
    queryFn: () => fetchSubscriptionBySystemId(cleanId, force),
    enabled: Boolean(cleanId),
    staleTime: 1000 * 60 * 3, // 3 minutes fresh cache
    gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
    retry: 1,
  });

  useEffect(() => {
    if (query.data) {
      setSubscription(query.data);
    } else if (query.error) {
      setError(
        query.error instanceof Error
          ? query.error.message
          : "Subscription query error",
      );
    }
  }, [query.data, query.error, setSubscription, setError]);

  return query;
}
