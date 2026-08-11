import { AttendanceRecord } from "@/app/(tabs)/attendance";
import Loading from "@/components/loading/loading";
import { StaffPickerModal } from "@/components/report/StaffPickerModal";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { AttendanceSummary, ReportMode } from "@/hooks/useAttendanceReportData";
import { StaffUser } from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AttendanceReportBodyProps {
  loading: boolean;
  summary: AttendanceSummary;
  records: AttendanceRecord[];
  reportMode: ReportMode;
  staffList: StaffUser[];
  selectedStaff?: StaffUser | null;
  activeStaffId: string | null;
  onSelectStaff: (staffId: string) => void;
}

export function AttendanceReportBody({
  loading,
  summary,
  records,
  reportMode,
  staffList,
  selectedStaff,
  activeStaffId,
  onSelectStaff,
}: AttendanceReportBodyProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showStaffModal, setShowStaffModal] = useState(false);

  if (loading) {
    return (
      <View style={s.centerLoading}>
        <Loading />
      </View>
    );
  }

  // Filter records by search query
  const filteredRecords = records.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.staff_id && r.staff_id.toLowerCase().includes(q)) ||
      (r.date && r.date.toLowerCase().includes(q)) ||
      (r.time && r.time.toLowerCase().includes(q)) ||
      (r.type && r.type.toLowerCase().includes(q)) ||
      (r.qr_data && r.qr_data.toLowerCase().includes(q))
    );
  });

  return (
    <View style={s.container}>
      {/* Current Staff Info Card */}
      {reportMode === "current" && (
        <View style={s.card}>
          <View style={s.staffSelectHeader}>
            <Text style={s.sectionLabel}>Current Staff Member</Text>
          </View>
          <View style={s.selectedStaffBox}>
            <View style={s.avatarBgIcon}>
              <Ionicons name="person" size={20} color={AppColors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.selectedStaffName}>
                {selectedStaff?.name || "Current Staff"}
              </Text>
              <Text style={s.selectedStaffSub}>
                ID: {selectedStaff?.id || "-"} • Position:{" "}
                {selectedStaff?.position || "Staff"}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Staff Selector for Individual Staff Report */}
      {reportMode === "individual" && staffList.length > 0 && (
        <View style={s.card}>
          <View style={s.staffSelectHeader}>
            <Text style={s.sectionLabel}>Select Staff Member</Text>
            {staffList.length > 1 && (
              <TouchableOpacity onPress={() => setShowStaffModal(true)}>
                <Text style={s.changeStaffText}>Change Staff</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={s.selectedStaffBox}
            activeOpacity={staffList.length > 1 ? 0.7 : 1}
            onPress={() => {
              if (staffList.length > 1) {
                setShowStaffModal(true);
              }
            }}
          >
            <View style={s.avatarBgIcon}>
              <Ionicons name="person" size={20} color={AppColors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.selectedStaffName}>
                {selectedStaff?.name || "Staff Member"}
              </Text>
              <Text style={s.selectedStaffSub}>
                ID: {selectedStaff?.id || "-"} • Position:{" "}
                {selectedStaff?.position || "Staff"}
              </Text>
            </View>
            {staffList.length > 1 && (
              <Ionicons
                name="chevron-forward"
                size={18}
                color={AppColors.grey}
              />
            )}
          </TouchableOpacity>

          <StaffPickerModal
            visible={showStaffModal}
            staffList={staffList}
            selectedStaffId={activeStaffId}
            onClose={() => setShowStaffModal(false)}
            onSelect={(id) => onSelectStaff(id)}
          />
        </View>
      )}

      {/* Summary Cards */}
      <View style={s.summaryGrid}>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>Total Logs</Text>
          <Text style={s.summaryValue}>{summary.totalLogs}</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>Time-In</Text>
          <Text style={[s.summaryValue, { color: "#15803d" }]}>
            {summary.timeInCount}
          </Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>Time-Out</Text>
          <Text style={[s.summaryValue, { color: "#1d4ed8" }]}>
            {summary.timeOutCount}
          </Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>Other</Text>
          <Text style={[s.summaryValue, { color: "#7e22ce" }]}>
            {summary.timeOtherCount}
          </Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={s.searchBox}>
        <Ionicons name="search-outline" size={18} color={AppColors.grey} />
        <TextInput
          style={s.searchInput}
          placeholder="Search by name, ID, date, status..."
          placeholderTextColor={AppColors.grey}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color={AppColors.grey} />
          </TouchableOpacity>
        )}
      </View>

      {/* Logs List */}
      <View style={s.recordsCard}>
        <Text style={s.recordsTitle}>
          Attendance Records ({filteredRecords.length})
        </Text>

        {filteredRecords.length === 0 ? (
          <View style={s.emptyBox}>
            <Ionicons
              name="calendar-outline"
              size={40}
              color={AppColors.grey}
            />
            <Text style={s.emptyTitle}>No Attendance Records</Text>
            <Text style={s.emptySub}>
              {searchQuery
                ? `No records matching "${searchQuery}".`
                : "No attendance logs recorded for this period."}
            </Text>
          </View>
        ) : (
          filteredRecords.map((item, index) => {
            const isTimeIn = item.type === "time-in";
            const isTimeOut = item.type === "time-out";

            const badgeBg = isTimeIn
              ? "#dcfce7"
              : isTimeOut
                ? "#dbeafe"
                : "#f3e8ff";
            const badgeColor = isTimeIn
              ? "#15803d"
              : isTimeOut
                ? "#1d4ed8"
                : "#7e22ce";

            return (
              <View key={item.id || index} style={s.recordRow}>
                <View style={s.recordHeader}>
                  <View style={[s.badge, { backgroundColor: badgeBg }]}>
                    <Text style={[s.badgeText, { color: badgeColor }]}>
                      {item.type.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={s.recordTime}>{item.time}</Text>
                </View>

                <View style={s.recordBody}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.staffName}>{item.name}</Text>
                    <Text style={s.staffIdText}>Staff ID: {item.staff_id}</Text>
                  </View>
                  <Text style={s.recordDate}>{item.date}</Text>
                </View>

                {item.qr_data && (
                  <Text style={s.qrText} numberOfLines={1}>
                    QR: {item.qr_data}
                  </Text>
                )}
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, gap: 12 },
  centerLoading: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    backgroundColor: AppColors.background2,
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.08)",
  },
  sectionLabel: {
    fontSize: 11.5,
    color: AppColors.grey,
    fontFamily: AppFonts.bold,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  staffSelectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  changeStaffText: {
    fontSize: 12,
    color: AppColors.secondary,
    fontFamily: AppFonts.bold,
  },
  selectedStaffBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: AppColors.background,
    padding: 10,
    borderRadius: 10,
  },
  avatarBgIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${AppColors.primary}18`,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedStaffName: {
    fontSize: 15,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  selectedStaffSub: {
    fontSize: 12,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    marginTop: 2,
    includeFontPadding: false,
  },
  staffChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: AppColors.background,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  staffChipActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  staffChipText: {
    fontSize: 12,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
  },
  staffChipTextActive: {
    color: AppColors.background2,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
  },

  // Summary Grid
  summaryGrid: {
    flexDirection: "row",
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: AppColors.background2,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.08)",
  },
  summaryLabel: {
    fontSize: 10,
    color: AppColors.grey,
    fontFamily: AppFonts.bold,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    marginTop: 4,
    includeFontPadding: false,
  },

  // Search
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.background2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.08)",
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },

  // Records
  recordsCard: {
    backgroundColor: AppColors.background2,
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.08)",
    gap: 10,
  },
  recordsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  recordRow: {
    backgroundColor: AppColors.background,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  recordTime: {
    fontSize: 13,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  recordBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  staffName: {
    fontSize: 13.5,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  staffIdText: {
    fontSize: 11.5,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    marginTop: 2,
    includeFontPadding: false,
  },
  recordDate: {
    fontSize: 12,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  qrText: {
    fontSize: 10.5,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(0,0,0,0.06)",
    paddingTop: 6,
    includeFontPadding: false,
  },

  emptyBox: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    marginTop: 8,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  emptySub: {
    fontSize: 12,
    color: AppColors.grey,
    textAlign: "center",
    marginTop: 4,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
});
