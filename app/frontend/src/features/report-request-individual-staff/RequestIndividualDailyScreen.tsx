import AppbarBack from "@/components/appbar/appbarback";
import { RequestReportBody } from "@/components/report-request/RequestReportBody";
import { RequestReportPrintModal } from "@/components/report-request/RequestReportPrintModal";
import { AppColors } from "@/constants/appcolors";
import { DailyDatePickerCard, ReportPrintFooter } from "@/features/report";
import {
  formatDateLabel,
  getTodayPP,
  useAttendanceRequestReportData,
} from "@/hooks/useAttendanceRequestReportData";
import { useResponsive } from "@/hooks/useResponsive";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function RequestIndividualDailyScreen() {
  const [selectedDate, setSelectedDate] = useState<Date>(getTodayPP());
  const [showPrintModal, setShowPrintModal] = useState(false);

  const {
    loading,
    summary,
    records,
    staffList,
    selectedStaff,
    activeStaffId,
    setActiveStaffId,
  } = useAttendanceRequestReportData("individual", "Daily", selectedDate);

  const { isMobile } = useResponsive();
  const periodLabel = formatDateLabel(selectedDate, "Daily");

  return (
    <>
      <AppbarBack Title="Individual Staff Request Daily Report" />
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
        reportType="Daily"
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
