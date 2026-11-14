import { useLanguage } from "@/features/language";
import AppbarBack from "@/shared/components/appbar/appbarback";
import { theme } from "@/shared/styles/theme";
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
  initialLang,
}: PrivacyPolicyProps) {
  const { currentLang } = useLanguage();
  const [lang, setLang] = useState<PolicyLang>(
    initialLang ??
      (currentLang === "km" ? "km" : currentLang === "zh" ? "zh" : "en"),
  );

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
    backgroundColor: theme.colors.background,
  },
});
