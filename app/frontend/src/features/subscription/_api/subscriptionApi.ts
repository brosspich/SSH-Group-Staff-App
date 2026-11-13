import { apiClient } from "@/shared/services/api";
import type { SubscriptionInfo } from "../_types/subscription.types";

/**
 * Check subscription status for a specific branch (e.g. "system-0001")
 */
export async function fetchSubscriptionBySystemId(
  systemId: string,
  force: boolean = true,
): Promise<SubscriptionInfo | null> {
  try {
    const cleanId = (systemId || "").trim().toLowerCase();
    const query = force ? `?force=true&_t=${Date.now()}` : "";
    const res = await apiClient.get<any>(
      `/subscription/check/${encodeURIComponent(cleanId)}${query}`,
      { timeout: 8000 },
    );
    if (!res) return null;
    if (res.data) return res.data;
    if (res.id || res.systemId || res.hasSubscription !== undefined) return res;
    return null;
  } catch (err) {
    console.warn(`[subscriptionApi] Check subscription error:`, err);
    return null;
  }
}

/**
 * Fetch all subscriptions across branches (Admin / Owner)
 */
export async function fetchAllSubscriptions(): Promise<SubscriptionInfo[]> {
  try {
    const res = await apiClient.get<any>(`/subscription`, { timeout: 10000 });
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    return [];
  } catch (err) {
    console.warn(`[subscriptionApi] Fetch all subscriptions error:`, err);
    return [];
  }
}

/**
 * Upsert or renew a subscription
 */
export async function upsertSubscriptionApi(
  payload: Partial<SubscriptionInfo>,
): Promise<SubscriptionInfo | null> {
  try {
    const res = await apiClient.post<any>(`/subscription`, payload, {
      timeout: 10000,
    });
    if (!res) return null;
    if (res.data) return res.data;
    if (res.id || res.systemId) return res;
    return null;
  } catch (err) {
    console.error(`[subscriptionApi] Upsert subscription error:`, err);
    throw err;
  }
}
