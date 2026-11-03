import AppbarBack from "@/components/appbar/appbarback";
import { RequestReportBody } from "@/components/report-request/RequestReportBody";
import { RequestReportPrintModal } from "@/components/report-request/RequestReportPrintModal";
import { AppColors } from "@/constants/appcolors";
import { ReportPrintFooter, WeeklyRangeSelectorCard } from "@/features/report";
import {
  formatDate,
  getWeekRange,
  useAttendanceRequestReportData,
} from "@/hooks/useAttendanceRequestReportData";
import { useResponsive } from "@/hooks/useResponsive";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function RequestIndividualWeeklyScreen() {
  const [weekOffset, setWeekOffset] = useState(0);
  const { start, end } = useMemo(() => getWeekRange(weekOffset), [weekOffset]);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const prevWeek = () => setWeekOffset((prev) => prev - 1);
  const nextWeek = () => {
    if (weekOffset >= 0) return;
    setWeekOffset((prev) => prev + 1);
  };

  const periodLabel = useMemo(
    () =>
      `${formatDate(start)} – ${formatDate(new Date(end.getTime() - 24 * 60 * 60 * 1000))}`,
    [start, end],
  );

  const {
    loading,
    summary,
    records,
    staffList,
    selectedStaff,
    activeStaffId,
    setActiveStaffId,
  } = useAttendanceRequestReportData("individual", "Weekly", start);

  const { isMobile } = useResponsive();

  return (
    <>
      <AppbarBack Title="Individual Staff Request Weekly Report" />
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
          <WeeklyRangeSelectorCard
            periodLabel={periodLabel}
            weekOffset={weekOffset}
            onPrevWeek={prevWeek}
            onNextWeek={nextWeek}
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
        reportType="Weekly"
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
  container: { flex: 1, backgroundColor: AppColors.background },
  content: { padding: 16, gap: 12, paddingBottom: 90 },
  wrapper: { flex: 1, width: "100%", gap: 12 },
});
