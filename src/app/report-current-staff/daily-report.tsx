import AppbarBack from "@/components/appbar/appbarback";
import DatePickerModal from "@/components/daterangpicker/DatePickerModal";
import { AttendanceReportBody } from "@/components/report/AttendanceReportBody";
import { AttendanceReportPrintModal } from "@/components/report/AttendanceReportPrintModal";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import {
  formatDateLabel,
  getTodayPP,
  useAttendanceReportData,
} from "@/hooks/useAttendanceReportData";
import { useResponsive } from "@/hooks/useResponsive";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CurrentStaffDailyReportScreen() {
  const [selectedDate, setSelectedDate] = useState<Date>(getTodayPP());
  const [showPicker, setShowPicker] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.background2 }}>
      <AppbarBack Title="Current Staff Daily Report" />
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
          {/* Date Selector Card */}
          <View style={s.card}>
            <Text style={s.sectionLabel}>Select Date</Text>
            <Pressable style={s.dateField} onPress={() => setShowPicker(true)}>
              <Text style={s.dateFieldText}>{periodLabel}</Text>
            </Pressable>
          </View>

          <DatePickerModal
            visible={showPicker}
            value={selectedDate}
            onClose={() => setShowPicker(false)}
            onChange={(date) => {
              setSelectedDate(date);
              setShowPicker(false);
            }}
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
        reportType="Daily"
        reportMode="current"
        summary={summary}
        records={records}
        targetStaff={selectedStaff}
        onClose={() => setShowPrintModal(false)}
        isMobile={isMobile}
      />
    </SafeAreaView>
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
  dateField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.background,
    borderRadius: 8,
    padding: 10,
  },
  dateFieldText: {
    fontSize: 14,
    color: AppColors.textPrimary,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
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
