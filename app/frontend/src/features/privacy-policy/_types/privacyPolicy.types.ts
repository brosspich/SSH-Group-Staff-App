import type {
  PolicyLang,
  PolicySection,
} from "@/features/privacy-policy/_utils/privacyPolicyData";

export type { PolicyLang, PolicySection };

export interface PrivacyPolicyProps {
  initialLang?: PolicyLang;
}
