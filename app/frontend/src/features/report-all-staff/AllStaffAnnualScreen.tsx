import AppbarBack from "@/shared/components/appbar/appbarback";
import { AttendanceReportBody } from "@/shared/components/report/AttendanceReportBody";
import { AttendanceReportPrintModal } from "@/shared/components/report/AttendanceReportPrintModal";
import { theme } from "@/shared/styles/theme";
import { AnnualSelectorCard, ReportPrintFooter } from "@/features/report";
import { useAttendanceReportData } from "@/shared/hooks/useAttendanceReportData";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function AllStaffAnnualScreen() {
  const [currentYear] = useState(() => {
    const pp = new Date(Date.now() + 7 * 60 * 60 * 1000);
    return pp.getUTCFullYear();
  });
  const [year, setYear] = useState(currentYear);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const selectedDate = useMemo(() => new Date(year, 0, 1), [year]);

  const {
    loading,
    summary,
    records,
    staffList,
    activeStaffId,
    setActiveStaffId,
  } = useAttendanceReportData("all", "Annual", selectedDate);

  const { isMobile } = useResponsive();
  const periodLabel = `${year}`;

  return (
    <>
      <AppbarBack Title="All Staff Annual Report" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.wrapper,
            !isMobile && { maxWidth: "80%", alignSelf: "center" },
          ]}
        >
          <AnnualSelectorCard
            year={year}
            currentYear={currentYear}
            onPrevYear={() => setYear((y) => y - 1)}
            onNextYear={() => {
              if (year >= currentYear) return;
              setYear((y) => y + 1);
            }}
          />

          <AttendanceReportBody
            loading={loading}
            summary={summary}
            records={records}
            reportMode="all"
            staffList={staffList}
            activeStaffId={activeStaffId}
            onSelectStaff={(id) => setActiveStaffId(id)}
          />
        </View>
      </ScrollView>

      <ReportPrintFooter
        onPressPrint={() => setShowPrintModal(true)}
        disabled={loading}
      />

      <AttendanceReportPrintModal
        visible={showPrintModal}
        periodLabel={periodLabel}
        reportType="Annual"
        reportMode="all"
        summary={summary}
        records={records}
        onClose={() => setShowPrintModal(false)}
        isMobile={isMobile}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, gap: 12, paddingBottom: 90 },
  wrapper: { flex: 1, width: "100%", gap: 12 },
});
