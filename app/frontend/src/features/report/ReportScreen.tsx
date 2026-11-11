import { useLanguage } from "@/features/language";
import Appbar from "@/shared/components/appbar/appbar";
import { useUser } from "@/shared/contexts/UserContext";
import { theme } from "@/shared/styles/theme";
import { hasAdminRole } from "@/utils/roleUtils";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { ReportSectionCard } from "./_components/ReportSectionCard";
import { ReportItemConfig } from "./_types/report.types";

export * from "./_types/report.types";

const currentStaffReports: ReportItemConfig[] = [
  {
    title: "Daily Report",
    route: "/report-current-staff/daily-report",
    iconName: "newspaper-outline",
    icon: Ionicons,
  },
  {
    title: "Weekly Report",
    route: "/report-current-staff/weekly-report",
    iconName: "newspaper-outline",
    icon: Ionicons,
  },
  {
    title: "Monthly Report",
    route: "/report-current-staff/monthly-report",
    iconName: "newspaper-outline",
    icon: Ionicons,
  },
  // {
  //   title: "Annual Report",
  //   route: "/report-current-staff/annual-report",
  //   iconName: "newspaper-outline",
  //   icon: Ionicons,
  // },
];

const requestCurrentStaffReports: ReportItemConfig[] = [
  {
    title: "Daily Report",
    route: "/report-request-current-staff/daily-report",
    iconName: "document-text-outline",
    icon: Ionicons,
  },
  {
    title: "Weekly Report",
    route: "/report-request-current-staff/weekly-report",
    iconName: "document-text-outline",
    icon: Ionicons,
  },
  {
    title: "Monthly Report",
    route: "/report-request-current-staff/monthly-report",
    iconName: "document-text-outline",
    icon: Ionicons,
  },
  // {
  //   title: "Annual Report",
  //   route: "/report-request-current-staff/annual-report",
  //   iconName: "document-text-outline",
  //   icon: Ionicons,
  // },
];

const individualStaffReports: ReportItemConfig[] = [
  {
    title: "Daily Report",
    route: "/report-individual-staff/daily-report",
    iconName: "newspaper-outline",
    icon: Ionicons,
  },
  {
    title: "Weekly Report",
    route: "/report-individual-staff/weekly-report",
    iconName: "newspaper-outline",
    icon: Ionicons,
  },
  {
    title: "Monthly Report",
    route: "/report-individual-staff/monthly-report",
    iconName: "newspaper-outline",
    icon: Ionicons,
  },
  // {
  //   title: "Annual Report",
  //   route: "/report-individual-staff/annual-report",
  //   iconName: "newspaper-outline",
  //   icon: Ionicons,
  // },
];

const requestIndividualStaffReports: ReportItemConfig[] = [
  {
    title: "Daily Report",
    route: "/report-request-individual-staff/daily-report",
    iconName: "document-text-outline",
    icon: Ionicons,
  },
  {
    title: "Weekly Report",
    route: "/report-request-individual-staff/weekly-report",
    iconName: "document-text-outline",
    icon: Ionicons,
  },
  {
    title: "Monthly Report",
    route: "/report-request-individual-staff/monthly-report",
    iconName: "document-text-outline",
    icon: Ionicons,
  },
  // {
  //   title: "Annual Report",
  //   route: "/report-request-individual-staff/annual-report",
  //   iconName: "document-text-outline",
  //   icon: Ionicons,
  // },
];

export default function ReportScreen() {
  const { t } = useLanguage();
  const { user } = useUser();
  const isAdmin = hasAdminRole(user?.role);

  const translateItems = (items: ReportItemConfig[]) =>
    items.map((item) => {
      let trTitle = item.title;
      if (item.title === "Daily Report") trTitle = t("report.daily");
      else if (item.title === "Weekly Report") trTitle = t("report.weekly");
      else if (item.title === "Monthly Report") trTitle = t("report.monthly");
      else if (item.title === "Annual Report") trTitle = t("report.annual");
      return { ...item, title: trTitle };
    });

  return (
    <View style={styles.safe}>
      <StatusBar
        backgroundColor={theme.colors.background}
        barStyle="light-content"
      />
      <Appbar />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        <View style={styles.container}>
          {/* ── Report Current Staff ── */}
          <ReportSectionCard
            title={t("report.myReports").toUpperCase()}
            items={translateItems(currentStaffReports)}
            style={{ marginTop: 0 }}
          />

          {/* ── Report Request Current Staff ── */}
          <ReportSectionCard
            title={t("report.requestReports").toUpperCase()}
            items={translateItems(requestCurrentStaffReports)}
          />

          {/* ── Admin Only: Report Individual Staff & Request Individual Staff ── */}
          {isAdmin && (
            <>
              <ReportSectionCard
                title={t("report.individualStaffReports").toUpperCase()}
                items={translateItems(individualStaffReports)}
              />
              <ReportSectionCard
                title={t("report.individualRequestReports").toUpperCase()}
                items={translateItems(requestIndividualStaffReports)}
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {},
});
