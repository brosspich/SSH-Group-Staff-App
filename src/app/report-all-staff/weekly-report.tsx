import AppbarBack from "@/components/appbar/appbarback";
import { AttendanceReportBody } from "@/components/report/AttendanceReportBody";
import { AttendanceReportPrintModal } from "@/components/report/AttendanceReportPrintModal";
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

export default function AllStaffWeeklyReportScreen() {
  const [weekOffset, setWeekOffset] = useState(0);
  const { start, end } = useMemo(() => getWeekRange(weekOffset), [weekOffset]);
  const [showPrintModal, setShowPrintModal] = useState(false);

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
    activeStaffId,
    setActiveStaffId,
  } = useAttendanceReportData("all", "Weekly", start);

  const { isMobile } = useResponsive();

  return (
    <>
      <AppbarBack Title="All Staff Weekly Report" />
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
            reportMode="all"
            staffList={staffList}
            activeStaffId={activeStaffId}
            onSelectStaff={(id) => setActiveStaffId(id)}
          />
        </View>
      </ScrollView>

      {/* Footer Print / PDF */}
      <View style={s.printBtnCon}>
        <View
          style={[
            { width: "100%" },
            !isMobile && { maxWidth: "80%", alignSelf: "center" },
          ]}
        >
          <TouchableOpacity
            style={s.printBtn}
            onPress={() => setShowPrintModal(true)}
            disabled={loading}
          >
            <Text style={s.printBtnText}>Print Report / Save PDF</Text>
          </TouchableOpacity>
        </View>
      </View>

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
    paddingVertical: 14,
    borderColor: AppColors.grey,
    borderTopWidth: 0.5,
  },
  printBtn: {
    backgroundColor: AppColors.secondary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  printBtnText: {
    fontSize: 14,
    fontWeight: "bold",
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
