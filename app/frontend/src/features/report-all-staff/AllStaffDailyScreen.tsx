import AppbarBack from "@/components/appbar/appbarback";
import { AttendanceReportBody } from "@/components/report/AttendanceReportBody";
import { AttendanceReportPrintModal } from "@/components/report/AttendanceReportPrintModal";
import { AppColors } from "@/constants/appcolors";
import { DailyDatePickerCard, ReportPrintFooter } from "@/features/report";
import {
  formatDateLabel,
  getTodayPP,
  useAttendanceReportData,
} from "@/hooks/useAttendanceReportData";
import { useResponsive } from "@/hooks/useResponsive";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function AllStaffDailyScreen() {
  const [selectedDate, setSelectedDate] = useState<Date>(getTodayPP());
  const [showPrintModal, setShowPrintModal] = useState(false);

  const {
    loading,
    summary,
    records,
    staffList,
    activeStaffId,
    setActiveStaffId,
  } = useAttendanceReportData("all", "Daily", selectedDate);

  const { isMobile } = useResponsive();
  const periodLabel = formatDateLabel(selectedDate, "Daily");

  return (
    <>
      <AppbarBack Title="All Staff Daily Report" />
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
          <DailyDatePickerCard
            selectedDate={selectedDate}
            periodLabel={periodLabel}
            onSelectDate={setSelectedDate}
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
        reportType="Daily"
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
