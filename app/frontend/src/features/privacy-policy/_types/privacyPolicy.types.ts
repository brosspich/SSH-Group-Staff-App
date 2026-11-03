import type {
  PolicyLang,
  PolicySection,
} from "@/components/privacypolicy/privacyPolicyData";

export type { PolicyLang, PolicySection };

export interface PrivacyPolicyProps {
  initialLang?: PolicyLang;
}
