import { queryKeys } from "@/shared/services/api/queryKeys";
import { useQuery } from "@tanstack/react-query";
import {
  fetchPrivacyPolicy,
  type PrivacyPolicyResponse,
} from "../_api/privacyPolicyApi";
import type { PolicyLang } from "../_types/privacyPolicy.types";

/**
 * TanStack Query Hook: Fetches and caches dynamic Privacy Policy directly from the Backend API
 */
export function usePrivacyPolicyQuery(lang: PolicyLang = "km") {
  return useQuery<PrivacyPolicyResponse>({
    queryKey: queryKeys.privacyPolicy.byLang(lang),
    queryFn: () => fetchPrivacyPolicy(lang),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
