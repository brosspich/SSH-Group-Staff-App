import {
  PRIVACY_POLICY_DATA,
  PRIVACY_POLICY_LAST_UPDATED,
  type PolicyLang,
} from "@/features/privacy-policy/_utils/privacyPolicyData";

export const POLICY_TITLE_MAP: Record<PolicyLang, string> = {
  en: "Privacy Policy",
  zh: "隐私政策",
  km: "គោលការណ៍ឯកជនភាព",
  fr: "Politique de confidentialité",
};

export const POLICY_LANGUAGES: { key: PolicyLang; label: string }[] = [
  { key: "en", label: "English" },
  { key: "zh", label: "中文" },
  { key: "km", label: "ភាសាខ្មែរ" },
  { key: "fr", label: "Français" },
];

export { PRIVACY_POLICY_DATA, PRIVACY_POLICY_LAST_UPDATED };
