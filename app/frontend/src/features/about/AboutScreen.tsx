import { useLanguage } from "@/features/language";
import AppbarBack from "@/shared/components/appbar/appbarback";
import Copyright from "@/shared/components/copyright/copyright";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { theme } from "@/shared/styles/theme";
import { ScrollView, StyleSheet, View } from "react-native";
import { AboutBrandHeader } from "./_components/AboutBrandHeader";
import { AboutCoreValues } from "./_components/AboutCoreValues";
import { AboutMissionVision } from "./_components/AboutMissionVision";
import { CORE_VALUES } from "./_utils/aboutConstants";

export default function AboutScreen() {
  const { t } = useLanguage();
  const { isMobile } = useResponsive();

  return (
    <View style={styles.container}>
      <AppbarBack Title={t("about.title")} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <AboutBrandHeader />
        <AboutMissionVision isMobile={isMobile} />
        <AboutCoreValues coreValues={CORE_VALUES} />
        <Copyright />
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 16,
  },
});
