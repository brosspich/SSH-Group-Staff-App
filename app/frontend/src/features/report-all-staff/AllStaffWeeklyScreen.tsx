import AppbarBack from "@/components/appbar/appbarback";
import { AttendanceReportBody } from "@/components/report/AttendanceReportBody";
import { AttendanceReportPrintModal } from "@/components/report/AttendanceReportPrintModal";
import { AppColors } from "@/constants/appcolors";
import { ReportPrintFooter, WeeklyRangeSelectorCard } from "@/features/report";
import {
  formatDate,
  getWeekRange,
  useAttendanceReportData,
} from "@/hooks/useAttendanceReportData";
import { useResponsive } from "@/hooks/useResponsive";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function AllStaffWeeklyScreen() {
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
    activeStaffId,
    setActiveStaffId,
  } = useAttendanceReportData("all", "Weekly", start);

  const { isMobile } = useResponsive();

  return (
    <>
      <AppbarBack Title="All Staff Weekly Report" />
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
        reportType="Weekly"
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
  container: { flex: 1, backgroundColor: AppColors.background },
  content: { padding: 16, gap: 12, paddingBottom: 90 },
  wrapper: { flex: 1, width: "100%", gap: 12 },
});
