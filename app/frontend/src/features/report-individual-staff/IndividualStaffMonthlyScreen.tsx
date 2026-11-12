import {
  MONTH_NAMES,
  MonthlySelectorCard,
  ReportPrintFooter,
} from "@/features/report";
import AppbarBack from "@/shared/components/appbar/appbarback";
import { AttendanceReportBody } from "@/shared/components/report/AttendanceReportBody";
import { TotalAttendanceReportPrintModal } from "@/shared/components/report/TotalAttendanceReportPrintModal";
import { useAttendanceReportData } from "@/shared/hooks/useAttendanceReportData";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { theme } from "@/shared/styles/theme";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useLanguage } from "../language";

export default function IndividualStaffMonthlyScreen() {
  const [currentYear] = useState(() => {
    const pp = new Date(Date.now() + 7 * 60 * 60 * 1000);
    return pp.getUTCFullYear();
  });
  const [currentMonth] = useState(() => {
    const pp = new Date(Date.now() + 7 * 60 * 60 * 1000);
    return pp.getUTCMonth();
  });
  const [viewYear, setViewYear] = useState(currentYear);
  const [viewMonth, setViewMonth] = useState(currentMonth);
  const [showPrintTotalModal, setShowPrintTotalModal] = useState(false);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (
      viewYear > currentYear ||
      (viewYear === currentYear && viewMonth >= currentMonth)
    )
      return;
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  };

  const selectedDate = useMemo(
    () => new Date(viewYear, viewMonth, 1),
    [viewYear, viewMonth],
  );

  const {
    loading,
    summary,
    records,
    staffList,
    selectedStaff,
    activeStaffId,
    setActiveStaffId,
  } = useAttendanceReportData("individual", "Monthly", selectedDate);

  const { isMobile } = useResponsive();
  const periodLabel = `${MONTH_NAMES[viewMonth]} ${viewYear}`;
  const { t } = useLanguage();

  return (
    <>
      <AppbarBack Title={t("report.individualStaffMonthlyReport")} />
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
          <MonthlySelectorCard
            viewYear={viewYear}
            viewMonth={viewMonth}
            currentYear={currentYear}
            currentMonth={currentMonth}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
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
        reportType="Monthly"
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
