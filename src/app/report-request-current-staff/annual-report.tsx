import AppbarBack from "@/components/appbar/appbarback";
import { RequestReportBody } from "@/components/report-request/RequestReportBody";
import { RequestReportPrintModal } from "@/components/report-request/RequestReportPrintModal";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useAttendanceRequestReportData } from "@/hooks/useAttendanceRequestReportData";
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

export default function CurrentStaffRequestAnnualReportScreen() {
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
    selectedStaff,
    activeStaffId,
    setActiveStaffId,
  } = useAttendanceRequestReportData("current", "Annual", selectedDate);

  const { isMobile } = useResponsive();
  const periodLabel = `${year}`;

  return (
    <>
      {/* <SafeAreaView
      edges={Platform.OS === "ios" ? ["top", "left", "right"] : undefined}
      style={{ flex: 1, backgroundColor: AppColors.background2 }}
    > */}
      <AppbarBack Title="Current Staff Request Annual Report" />
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
            <Text style={s.sectionLabel}>Select Year</Text>
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

          <RequestReportBody
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

      <RequestReportPrintModal
        visible={showPrintModal}
        periodLabel={periodLabel}
        reportType="Annual"
        reportMode="current"
        summary={summary}
        records={records}
        targetStaff={selectedStaff}
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
    fontSize: 13,
    fontWeight: "bold",
    color: AppColors.textSecondary,
    fontFamily: AppFonts.bold,
    marginBottom: 8,
  },
  yearNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: `${AppColors.grey}20`,
  },
  yearLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
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
