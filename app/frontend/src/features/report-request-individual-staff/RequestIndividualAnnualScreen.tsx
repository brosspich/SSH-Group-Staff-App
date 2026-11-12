import { AnnualSelectorCard, ReportPrintFooter } from "@/features/report";
import AppbarBack from "@/shared/components/appbar/appbarback";
import { RequestReportBody } from "@/shared/components/report-request/RequestReportBody";
import { RequestReportPrintModal } from "@/shared/components/report-request/RequestReportPrintModal";
import { useAttendanceRequestReportData } from "@/shared/hooks/useAttendanceRequestReportData";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { theme } from "@/shared/styles/theme";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useLanguage } from "../language";

export default function RequestIndividualAnnualScreen() {
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
    selectedStaff,
    activeStaffId,
    setActiveStaffId,
  } = useAttendanceRequestReportData("individual", "Annual", selectedDate);

  const { isMobile } = useResponsive();
  const periodLabel = `${year}`;
  const { t } = useLanguage();

  return (
    <>
      <AppbarBack Title={t("report.individualStaffAnnualRequestReport")} />
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

          <RequestReportBody
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
        onPressPrint={() => setShowPrintModal(true)}
        disabled={loading}
      />

      <RequestReportPrintModal
        visible={showPrintModal}
        periodLabel={periodLabel}
        reportType="Annual"
        reportMode="individual"
        summary={summary}
        records={records}
        targetStaff={selectedStaff}
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
