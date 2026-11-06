import AppbarBack from "@/shared/components/appbar/appbarback";
import { AttendanceReportBody } from "@/shared/components/report/AttendanceReportBody";
import { TotalAttendanceReportPrintModal } from "@/shared/components/report/TotalAttendanceReportPrintModal";
import { theme } from "@/shared/styles/theme";
import { ReportPrintFooter, WeeklyRangeSelectorCard } from "@/features/report";
import {
  formatDate,
  getWeekRange,
  useAttendanceReportData,
} from "@/shared/hooks/useAttendanceReportData";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function CurrentStaffWeeklyScreen() {
  const [weekOffset, setWeekOffset] = useState(0);
  const { start, end } = useMemo(() => getWeekRange(weekOffset), [weekOffset]);
  const [showPrintTotalModal, setShowPrintTotalModal] = useState(false);

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
  } = useAttendanceReportData("current", "Weekly", start);

  const { isMobile } = useResponsive();

  return (
    <>
      <AppbarBack Title="Current Staff Weekly Report" />
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

          <AttendanceReportBody
            loading={loading}
            summary={summary}
            records={records}
            reportMode="current"
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
        reportType="Weekly"
        reportMode="current"
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
