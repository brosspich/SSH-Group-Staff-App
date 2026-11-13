export interface SubscriptionInfo {
  id: string; // e.g. "SUB-0001"
  systemId: string; // e.g. "system-0001"
  plan: string; // e.g. "1 Year", "6 Months", "3 Months", "1 Month"
  startDate: string; // ISO date string e.g. "2026-07-01"
  endDate: string; // ISO date string e.g. "2027-07-01"
  createdAt?: string;
  status: "Active" | "Inactive" | "Expired";
  daysRemaining: number;
  isExpired: boolean;
}

export interface SubscriptionApiResponse {
  success: boolean;
  data: SubscriptionInfo;
  message?: string;
}

export interface AllSubscriptionsApiResponse {
  success: boolean;
  count: number;
  data: SubscriptionInfo[];
  message?: string;
}
