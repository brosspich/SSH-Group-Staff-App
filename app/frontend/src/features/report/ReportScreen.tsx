import Appbar from "@/components/appbar/appbar";
import { AppColors } from "@/constants/appcolors";
import { useUser } from "@/contexts/UserContext";
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
  {
    title: "Annual Report",
    route: "/report-current-staff/annual-report",
    iconName: "newspaper-outline",
    icon: Ionicons,
  },
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
  {
    title: "Annual Report",
    route: "/report-request-current-staff/annual-report",
    iconName: "document-text-outline",
    icon: Ionicons,
  },
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
  {
    title: "Annual Report",
    route: "/report-individual-staff/annual-report",
    iconName: "newspaper-outline",
    icon: Ionicons,
  },
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
  {
    title: "Annual Report",
    route: "/report-request-individual-staff/annual-report",
    iconName: "document-text-outline",
    icon: Ionicons,
  },
];

export default function ReportScreen() {
  const { user } = useUser();
  const isAdmin = hasAdminRole(user?.role);

  return (
    <View style={styles.safe}>
      <StatusBar
        backgroundColor={AppColors.background}
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
            title="REPORT CURRENT STAFF"
            items={currentStaffReports}
            style={{ marginTop: 0 }}
          />

          {/* ── Report Request Current Staff ── */}
          <ReportSectionCard
            title="REPORT REQUEST CURRENT STAFF"
            items={requestCurrentStaffReports}
          />

          {/* ── Admin Only: Report Individual Staff & Request Individual Staff ── */}
          {isAdmin && (
            <>
              <ReportSectionCard
                title="REPORT INDIVIDUAL STAFF"
                items={individualStaffReports}
              />
              <ReportSectionCard
                title="REPORT REQUEST INDIVIDUAL STAFF"
                items={requestIndividualStaffReports}
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
    backgroundColor: AppColors.background,
  },
  container: {},
});
