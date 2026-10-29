import AppbarBack from "@/components/appbar/appbarback";
import { AttendanceReportBody } from "@/components/report/AttendanceReportBody";
import { TotalAttendanceReportPrintModal } from "@/components/report/TotalAttendanceReportPrintModal";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import {
  formatDate,
  getWeekRange,
  useAttendanceReportData,
} from "@/hooks/useAttendanceReportData";
import { useResponsive } from "@/hooks/useResponsive";
import { MaterialIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function IndividualWeeklyReportScreen() {
  const [weekOffset, setWeekOffset] = useState(0);
  const { start, end } = useMemo(() => getWeekRange(weekOffset), [weekOffset]);
  // const [showPrintModal, setShowPrintModal] = useState(false);
  const [showPrintTotalModal, setShowPrintTotalModal] = useState(false);

  const prevWeek = () => {
    setWeekOffset((prev) => prev - 1);
  };

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
  } = useAttendanceReportData("individual", "Weekly", start);

  const { isMobile } = useResponsive();

  return (
    <>
      <AppbarBack Title="Individual Staff Weekly Report" />
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            { flex: 1, width: "100%", gap: 12 },
            !isMobile && { maxWidth: "80%", alignSelf: "center" },
          ]}
        >
          {/* Week Selector Card */}
          <View style={s.card}>
            <Text style={s.sectionLabel}>This week</Text>
            <View style={s.weekNav}>
              <TouchableOpacity onPress={prevWeek} style={s.navBtn}>
                <MaterialIcons
                  name="arrow-back-ios-new"
                  size={18}
                  color={AppColors.textPrimary}
                />
              </TouchableOpacity>
              <Text style={s.weekRange}>{periodLabel}</Text>
              <TouchableOpacity
                onPress={nextWeek}
                style={s.navBtn}
                disabled={weekOffset >= 0}
              >
                <MaterialIcons
                  name="arrow-forward-ios"
                  size={18}
                  color={
                    weekOffset >= 0 ? AppColors.grey : AppColors.textPrimary
                  }
                />
              </TouchableOpacity>
            </View>
          </View>

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

      {/* Footer Print / PDF */}
      <View style={s.printBtnCon}>
        <View
          style={[
            { width: "100%", gap: 10 },
            !isMobile && { maxWidth: "80%", alignSelf: "center" },
          ]}
        >
          {/* <TouchableOpacity
            style={[s.printBtn, { backgroundColor: AppColors.transparent }]}
            onPress={() => setShowPrintModal(true)}
            disabled={loading}
          >
            <Text style={[s.printBtnText, { color: AppColors.secondary }]}>
              Print Report / Save PDF
            </Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            style={s.printBtn}
            onPress={() => setShowPrintTotalModal(true)}
            disabled={loading}
          >
            <Text style={s.printBtnText}>Print Total Report / Save PDF</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* <AttendanceReportPrintModal
        visible={showPrintModal}
        periodLabel={periodLabel}
        reportType="Weekly"
        reportMode="individual"
        summary={summary}
        records={records}
        targetStaff={selectedStaff}
        onClose={() => setShowPrintModal(false)}
        isMobile={isMobile}
      /> */}

      <TotalAttendanceReportPrintModal
        visible={showPrintTotalModal}
        periodLabel={periodLabel}
        reportType="Weekly"
        reportMode="individual"
        summary={summary}
        records={records}
        targetStaff={selectedStaff}
        onClose={() => setShowPrintTotalModal(false)}
        isMobile={isMobile}
      />

      <SafeAreaView
        edges={["bottom"]}
        style={{ backgroundColor: AppColors.background2 }}
      />
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  content: { padding: 16, gap: 12, paddingBottom: 90 },
  card: {
    backgroundColor: AppColors.background2,
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.08)",
  },
  sectionLabel: {
    fontSize: 11.5,
    color: AppColors.grey,
    marginBottom: 8,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  weekNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  weekRange: {
    fontSize: 15,
    fontWeight: "500",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  navBtn: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.grey,
    alignItems: "center",
    justifyContent: "center",
  },
  printBtnCon: {
    backgroundColor: AppColors.background2,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderColor: AppColors.grey,
    borderTopWidth: 0.5,
  },
  printBtn: {
    backgroundColor: AppColors.secondary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: AppColors.secondary,
  },
  printBtnText: {
    fontSize: 14,
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
