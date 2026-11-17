import { apiClient } from "@/shared/services/api/apiClient";
import type { PolicyLang, PolicySection } from "../_types/privacyPolicy.types";

export interface PrivacyPolicyResponse {
  success: boolean;
  version: string;
  language: PolicyLang;
  lastUpdated: string;
  sections: PolicySection[];
  allData?: Record<PolicyLang, PolicySection[]>;
  allLastUpdated?: Record<PolicyLang, string>;
}

export async function fetchPrivacyPolicy(
  lang: PolicyLang = "km",
): Promise<PrivacyPolicyResponse> {
  const data = await apiClient.get<PrivacyPolicyResponse>("/privacy-policy", {
    params: {
      format: "json",
      lang,
    },
  });
  return data;
}
