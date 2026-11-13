import { useUser } from "@/shared/contexts/UserContext";
import { isOwnerRole } from "@/utils/roleUtils";
import { useCallback, useEffect, useState } from "react";
import { fetchSubscriptionBySystemId } from "../_api/subscriptionApi";
import type { SubscriptionInfo } from "../_types/subscription.types";

export function useSubscription() {
  const { user } = useUser();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const role = (user?.role || "").toLowerCase().trim();
  const isOwner = role === "owner" || isOwnerRole(role);

  // Determine current system_id
  const userSystemId =
    user?.system_id ||
    (user as any)?.systemId ||
    user?.companyId ||
    user?.details?.companyId ||
    "system-0001";

  const [selectedSystemId, setSelectedSystemId] = useState<string>(
    userSystemId.toLowerCase(),
  );

  const loadSubscription = useCallback(async (targetSysId: string) => {
    if (!targetSysId) return;
    setError(null);

    try {
      const data = await fetchSubscriptionBySystemId(targetSysId);
      if (data) {
        setSubscription(data);
      } else {
        // Fallback default info if network issue or record missing
        setSubscription({
          id: `SUB-${targetSysId.replace("system-", "")}`,
          systemId: targetSysId,
          plan: "1 Year",
          startDate: "2026-07-01",
          endDate: "2027-07-01",
          status: "Active",
          daysRemaining: 230,
          isExpired: false,
        });
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load subscription");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSystemId) {
      loadSubscription(selectedSystemId);
    }
  }, [selectedSystemId, loadSubscription]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (selectedSystemId) {
      loadSubscription(selectedSystemId);
    } else {
      setRefreshing(false);
    }
  }, [selectedSystemId, loadSubscription]);

  return {
    user,
    isOwner,
    selectedSystemId,
    setSelectedSystemId,
    subscription,
    loading,
    refreshing,
    error,
    onRefresh,
    reload: () => loadSubscription(selectedSystemId),
  };
}
