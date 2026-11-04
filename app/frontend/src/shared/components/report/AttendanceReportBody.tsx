import { AttendanceRecord } from "@/app/(tabs)/attendance";
import Loading from "@/shared/components/loading/loading";
import { StaffPickerModal } from "@/shared/components/report/StaffPickerModal";
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

  // Filter records by search query safely
  const filteredRecords = records.filter((r) => {
    if (!r) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    const rId = r.id != null ? String(r.id).toLowerCase() : "";
    const rName = r.name != null ? String(r.name).toLowerCase() : "";
    const rStaffId = r.staff_id != null ? String(r.staff_id).toLowerCase() : "";
    const rDate = r.date != null ? String(r.date).toLowerCase() : "";
    const rTime = r.time != null ? String(r.time).toLowerCase() : "";
    const rType = r.type != null ? String(r.type).toLowerCase() : "";
    return (
      rId.includes(q) ||
      rName.includes(q) ||
      rStaffId.includes(q) ||
      rDate.includes(q) ||
      rTime.includes(q) ||
      rType.includes(q)
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
            systemId={selectedStaff?.system_id}
            onClose={() => setShowStaffModal(false)}
            onSelect={(id) => onSelectStaff(id)}
          />
        </View>
      )}

      {/* Summary Cards */}
      <View style={s.summaryGrid}>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel} numberOfLines={1} ellipsizeMode="tail">
            Total Logs
          </Text>
          <Text style={s.summaryValue}>{summary.totalLogs} </Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel} numberOfLines={1} ellipsizeMode="tail">
            Time-In
          </Text>
          <Text style={[s.summaryValue, { color: "#0022ff" }]}>
            {summary.timeInCount}
          </Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel} numberOfLines={1} ellipsizeMode="tail">
            Time-Out
          </Text>
          <Text style={[s.summaryValue, { color: "#ff0000" }]}>
            {summary.timeOutCount}
          </Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel} numberOfLines={1} ellipsizeMode="tail">
            Other
          </Text>
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
            if (!item) return null;
            const itemType = item.type != null ? String(item.type) : "";
            const isTimeIn = itemType === "time-in";
            const isTimeOut = itemType === "time-out";

            const badgeBg = isTimeIn
              ? "#dce0fc"
              : isTimeOut
                ? "#fedbdb"
                : "#f3e8ff";
            const badgeColor = isTimeIn
              ? "#0022ff"
              : isTimeOut
                ? "#ff0000"
                : "#7e22ce";

            const idStr = item.id != null ? String(item.id).toUpperCase() : "";

            return (
              <View key={`${item.id ?? "rec"}-${index}`} style={s.recordRow}>
                <View style={s.recordBody}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.staffName}>
                      {item.name != null ? String(item.name) : "-"}
                    </Text>
                    <Text style={s.staffIdText}>
                      Staff ID:{" "}
                      {item.staff_id != null ? String(item.staff_id) : "-"}
                      {idStr ? ` • ${idStr}` : ""}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={s.recordTime}>
                      {item.time != null ? String(item.time) : ""}
                    </Text>
                    <Text style={s.recordDate}>
                      {item.date != null ? String(item.date) : ""}
                    </Text>
                  </View>
                </View>

                {itemType ? (
                  <View style={[s.conStatus, { backgroundColor: badgeBg }]}>
                    <Text
                      style={[s.statusText, { color: badgeColor }]}
                      numberOfLines={1}
                    >
                      Status :
                    </Text>
                    <Text
                      style={[s.statusText, { color: badgeColor }]}
                      numberOfLines={1}
                    >
                      {itemType.toUpperCase()}
                    </Text>
                  </View>
                ) : null}
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
    includeFontPadding: false,
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
    includeFontPadding: false,
  },
  staffChipTextActive: {
    color: AppColors.background2,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
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
    // gap: 8,
    overflow: "hidden",
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
    width: "100%",
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  conStatus: {
    borderTopWidth: 0.5,
    borderTopColor: AppColors.grey + 30,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  statusText: {
    fontSize: 10.5,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
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
