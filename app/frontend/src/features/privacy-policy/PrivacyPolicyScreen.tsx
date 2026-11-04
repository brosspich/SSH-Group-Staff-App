import AppbarBack from "@/shared/components/appbar/appbarback";
import { AppColors } from "@/constants/appcolors";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import PolicyLanguageSelector from "./_components/PolicyLanguageSelector";
import PolicySectionList from "./_components/PolicySectionList";
import type {
  PolicyLang,
  PrivacyPolicyProps,
} from "./_types/privacyPolicy.types";
import { POLICY_TITLE_MAP } from "./_utils/privacyPolicyConstants";

export default function PrivacyPolicyScreen({
  initialLang = "en",
}: PrivacyPolicyProps) {
  const [lang, setLang] = useState<PolicyLang>(initialLang);

  return (
    <View style={styles.container}>
      <AppbarBack Title={POLICY_TITLE_MAP[lang]} />
      <PolicyLanguageSelector currentLang={lang} onSelectLang={setLang} />
      <PolicySectionList lang={lang} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
});
