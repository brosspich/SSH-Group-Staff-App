import AppbarBack from "@/shared/components/appbar/appbarback";
import { AttendanceReportBody } from "@/shared/components/report/AttendanceReportBody";
import { TotalAttendanceReportPrintModal } from "@/shared/components/report/TotalAttendanceReportPrintModal";
import { theme } from "@/shared/styles/theme";
import { AnnualSelectorCard, ReportPrintFooter } from "@/features/report";
import { useAttendanceReportData } from "@/shared/hooks/useAttendanceReportData";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function IndividualStaffAnnualScreen() {
  const [currentYear] = useState(() => {
    const pp = new Date(Date.now() + 7 * 60 * 60 * 1000);
    return pp.getUTCFullYear();
  });
  const [year, setYear] = useState(currentYear);
  const [showPrintTotalModal, setShowPrintTotalModal] = useState(false);

  const selectedDate = useMemo(() => new Date(year, 0, 1), [year]);

  const {
    loading,
    summary,
    records,
    staffList,
    selectedStaff,
    activeStaffId,
    setActiveStaffId,
  } = useAttendanceReportData("individual", "Annual", selectedDate);

  const { isMobile } = useResponsive();
  const periodLabel = `${year}`;

  return (
    <>
      <AppbarBack Title="Individual Staff Annual Report" />
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
            reportMode="individual"
            staffList={staffList}
            selectedStaff={selectedStaff}
            activeStaffId={activeStaffId}
            onSelectStaff={(id) => setActiveStaffId(id)}
          />
        </View>
      </ScrollView>

      <ReportPrintFooter
        onPressPrint={() => setShowPrintTotalModal(true)}
        disabled={loading}
      />

      <TotalAttendanceReportPrintModal
        visible={showPrintTotalModal}
        periodLabel={periodLabel}
        reportType="Annual"
        reportMode="individual"
        summary={summary}
        records={records}
        targetStaff={selectedStaff}
        onClose={() => setShowPrintTotalModal(false)}
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
