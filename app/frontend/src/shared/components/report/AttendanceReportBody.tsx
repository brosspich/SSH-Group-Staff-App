import { AttendanceRecord } from "@/app/(tabs)/attendance";
import Loading from "@/shared/components/loading/loading";
import { StaffPickerModal } from "@/shared/components/report/StaffPickerModal";
import {
  AttendanceSummary,
  ReportMode,
} from "@/shared/hooks/useAttendanceReportData";
import { StaffUser } from "@/shared/services/userService";
import { theme } from "@/shared/styles/theme";
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
              <Ionicons name="person" size={20} color={theme.colors.primary} />
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
              <Ionicons name="person" size={20} color={theme.colors.primary} />
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
                color={theme.colors.grey}
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
        <Ionicons name="search-outline" size={18} color={theme.colors.grey} />
        <TextInput
          style={s.searchInput}
          placeholder="Search by name, ID, date, status..."
          placeholderTextColor={theme.colors.grey}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color={theme.colors.grey} />
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
              color={theme.colors.grey}
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
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.08)",
  },
  sectionLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    fontFamily: theme.fonts.bold,
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
    fontSize: theme.fontSizes.xs,
    color: theme.colors.secondary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  selectedStaffBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.colors.background,
    padding: 10,
    borderRadius: theme.borderRadius.md,
  },
  avatarBgIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.primary}18`,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedStaffName: {
    fontSize: theme.fontSizes.md,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  selectedStaffSub: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    fontFamily: theme.fonts.regular,
    marginTop: 2,
    includeFontPadding: false,
  },
  staffChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  staffChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  staffChipText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  staffChipTextActive: {
    color: theme.colors.background2,
    fontWeight: "bold",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },

  // Summary Grid
  summaryGrid: {
    flexDirection: "row",
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.08)",
  },
  summaryLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    fontFamily: theme.fonts.bold,
    textTransform: "uppercase",
    includeFontPadding: false,
  },
  summaryValue: {
    fontSize: theme.fontSizes.lg,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    marginTop: 4,
    includeFontPadding: false,
  },

  // Search
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.08)",
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },

  // Records
  recordsCard: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.08)",
    gap: 10,
  },
  recordsTitle: {
    fontSize: theme.fontSizes.sm,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  recordRow: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    // gap: 8,
    overflow: "hidden",
  },
  recordTime: {
    fontSize: theme.fontSizes.sm,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
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
    fontSize: theme.fontSizes.sm,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  staffIdText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    fontFamily: theme.fonts.regular,
    marginTop: 2,
    includeFontPadding: false,
  },
  recordDate: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  conStatus: {
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.grey + 30,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  statusText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },

  emptyBox: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    marginTop: 8,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  emptySub: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    textAlign: "center",
    marginTop: 4,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
});
