import AppbarBack from "@/components/appbar/appbarback";
import { AttendanceReportBody } from "@/components/report/AttendanceReportBody";
import { AttendanceReportPrintModal } from "@/components/report/AttendanceReportPrintModal";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useAttendanceReportData } from "@/hooks/useAttendanceReportData";
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

export default function AllStaffAnnualReportScreen() {
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
    activeStaffId,
    setActiveStaffId,
  } = useAttendanceReportData("all", "Annual", selectedDate);

  const { isMobile } = useResponsive();
  const periodLabel = `${year}`;

  return (
    <>
      {/* <SafeAreaView
      edges={Platform.OS === "ios" ? ["top", "left", "right"] : undefined}
      style={{ flex: 1, backgroundColor: AppColors.background2 }}
    > */}
      <AppbarBack Title="All Staff Annual Report" />
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
          {/* Year Selector Card */}
          <View style={s.card}>
            <Text style={s.sectionLabel}>Select year</Text>
            <View style={s.yearNav}>
              <TouchableOpacity
                onPress={() => setYear((y) => y - 1)}
                style={s.navBtn}
              >
                <MaterialIcons
                  name="arrow-back-ios-new"
                  size={18}
                  color={AppColors.textPrimary}
                />
              </TouchableOpacity>
              <Text style={s.yearLabel}>{year}</Text>
              <TouchableOpacity
                onPress={() => setYear((y) => y + 1)}
                style={s.navBtn}
                disabled={year >= currentYear}
              >
                <MaterialIcons
                  name="arrow-forward-ios"
                  size={18}
                  color={
                    year >= currentYear ? AppColors.grey : AppColors.textPrimary
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
        reportType="Annual"
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
      {/* </SafeAreaView> */}
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  content: { padding: 16, gap: 12, paddingBottom: 90 },
  card: {
    backgroundColor: AppColors.background2,
    borderRadius: 12,
    padding: 16,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.1)",
  },
  sectionLabel: {
    fontSize: 12,
    color: AppColors.textPrimary,
    marginBottom: 6,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  yearNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  yearLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: AppColors.textSecondary,
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
