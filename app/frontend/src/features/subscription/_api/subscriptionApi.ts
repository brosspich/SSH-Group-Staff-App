import { apiClient } from "@/shared/services/api";
import type {
  AllSubscriptionsApiResponse,
  SubscriptionApiResponse,
  SubscriptionInfo,
} from "../_types/subscription.types";

/**
 * Check subscription status for a specific branch (e.g. "system-0001")
 */
export async function fetchSubscriptionBySystemId(
  systemId: string,
): Promise<SubscriptionInfo | null> {
  try {
    const cleanId = (systemId || "").trim().toLowerCase();
    const res = await apiClient.get<SubscriptionApiResponse>(
      `/subscription/check/${encodeURIComponent(cleanId)}`,
      { timeout: 8000 },
    );
    if (res && res.success && res.data) {
      return res.data;
    }
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
    const res = await apiClient.get<AllSubscriptionsApiResponse>(
      `/subscription`,
      { timeout: 10000 },
    );
    if (res && res.success && Array.isArray(res.data)) {
      return res.data;
    }
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
    const res = await apiClient.post<SubscriptionApiResponse>(
      `/subscription`,
      payload,
      { timeout: 10000 },
    );
    if (res && res.success && res.data) {
      return res.data;
    }
    return null;
  } catch (err) {
    console.error(`[subscriptionApi] Upsert subscription error:`, err);
    throw err;
  }
}
