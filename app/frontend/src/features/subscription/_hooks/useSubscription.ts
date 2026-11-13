import { extractSystemKey } from "@/shared/constants/attendanceConfig";
import { useUser } from "@/shared/contexts/UserContext";
import { isOwnerRole } from "@/utils/roleUtils";
import { useEffect } from "react";
import { useSubscriptionStore } from "../_store/useSubscriptionStore";
import { useSubscriptionQuery } from "./useSubscriptionQuery";

export function useSubscription() {
  const { user } = useUser();
  const role = (user?.role || "").toLowerCase().trim();
  const isOwner = role === "owner" || isOwnerRole(role);

  // Determine current companyId to match system_id in Subscription table
  const rawSys =
    user?.companyId ||
    (user as any)?.company_id ||
    user?.details?.companyId ||
    extractSystemKey(user?.system_id || (user as any)?.systemId || user?.id) ||
    "system-0001";
  const userSystemId = (
    extractSystemKey(rawSys) || "system-0001"
  ).toLowerCase();

  const selectedSystemId = useSubscriptionStore(
    (state) => state.selectedSystemId || userSystemId,
  );
  const setSelectedSystemId = useSubscriptionStore(
    (state) => state.setSelectedSystemId,
  );
  const cachedSub = useSubscriptionStore((state) => state.subscription);

  useEffect(() => {
    if (userSystemId && userSystemId !== selectedSystemId) {
      setSelectedSystemId(userSystemId);
    }
  }, [userSystemId, selectedSystemId, setSelectedSystemId]);

  const {
    data: querySub,
    isLoading,
    isRefetching,
    error: queryError,
    refetch,
  } = useSubscriptionQuery(selectedSystemId, true);

  const subscription = querySub ?? cachedSub;

  return {
    user,
    isOwner,
    selectedSystemId,
    setSelectedSystemId,
    subscription,
    loading: isLoading && !subscription,
    refreshing: isRefetching,
    error: queryError instanceof Error ? queryError.message : null,
    onRefresh: refetch,
    reload: refetch,
  };
}
