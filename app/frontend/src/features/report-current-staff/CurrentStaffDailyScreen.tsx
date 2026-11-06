import AppbarBack from "@/shared/components/appbar/appbarback";
import { AttendanceReportBody } from "@/shared/components/report/AttendanceReportBody";
import { TotalAttendanceReportPrintModal } from "@/shared/components/report/TotalAttendanceReportPrintModal";
import { theme } from "@/shared/styles/theme";
import { DailyDatePickerCard, ReportPrintFooter } from "@/features/report";
import {
  formatDateLabel,
  getTodayPP,
  useAttendanceReportData,
} from "@/shared/hooks/useAttendanceReportData";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function CurrentStaffDailyScreen() {
  const [selectedDate, setSelectedDate] = useState<Date>(getTodayPP());
  const [showPrintTotalModal, setShowPrintTotalModal] = useState(false);

  const {
    loading,
    summary,
    records,
    staffList,
    selectedStaff,
    activeStaffId,
    setActiveStaffId,
  } = useAttendanceReportData("current", "Daily", selectedDate);

  const { isMobile } = useResponsive();
  const periodLabel = formatDateLabel(selectedDate, "Daily");

  return (
    <>
      <AppbarBack Title="Current Staff Daily Report" />
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
        reportType="Daily"
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
