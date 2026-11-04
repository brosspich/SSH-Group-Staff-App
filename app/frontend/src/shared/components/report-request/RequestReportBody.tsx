import Loading from "@/shared/components/loading/loading";
import { StaffPickerModal } from "@/shared/components/report/StaffPickerModal";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import {
  ReportMode,
  RequestSummary,
} from "@/hooks/useAttendanceRequestReportData";
import { AttendanceRequestRuleItem } from "@/services/attendanceRequestService";
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

interface RequestReportBodyProps {
  loading: boolean;
  summary: RequestSummary;
  records: AttendanceRequestRuleItem[];
  reportMode: ReportMode;
  staffList: StaffUser[];
  selectedStaff?: StaffUser | null;
  activeStaffId: string | null;
  onSelectStaff?: (staffId: string) => void;
}

export function RequestReportBody({
  loading,
  summary,
  records,
  reportMode,
  staffList,
  selectedStaff,
  activeStaffId,
  onSelectStaff,
}: RequestReportBodyProps) {
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
    if (!r) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    const rId = r.id != null ? String(r.id).toLowerCase() : "";
    const rName = r.name != null ? String(r.name).toLowerCase() : "";
    const rStaffId = r.staff_id != null ? String(r.staff_id).toLowerCase() : "";
    const rSubject = r.subject != null ? String(r.subject).toLowerCase() : "";
    const rRemark = r.remark != null ? String(r.remark).toLowerCase() : "";
    const rDate = r.date != null ? String(r.date).toLowerCase() : "";
    const rStatus = r.status != null ? String(r.status).toLowerCase() : "";

    return (
      rId.includes(q) ||
      rName.includes(q) ||
      rStaffId.includes(q) ||
      rSubject.includes(q) ||
      rRemark.includes(q) ||
      rDate.includes(q) ||
      rStatus.includes(q)
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
                ID: {selectedStaff?.id || selectedStaff?.staff_id || "-"} •
                Position: {selectedStaff?.position || "Staff"}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Staff Selector for Individual Staff Report */}
      {reportMode === "individual" && staffList && staffList.length > 0 && (
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
                ID: {selectedStaff?.id || selectedStaff?.staff_id || "-"} •
                Position: {selectedStaff?.position || "Staff"}
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
            onSelect={(id) => {
              setShowStaffModal(false);
              onSelectStaff?.(id);
            }}
          />
        </View>
      )}

      {/* Summary Cards */}
      <View style={s.summaryGrid}>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel} numberOfLines={1} ellipsizeMode="tail">
            Total Requests
          </Text>
          <Text style={s.summaryValue}>{summary.totalRequests}</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel} numberOfLines={1} ellipsizeMode="tail">
            Pending
          </Text>
          <Text style={[s.summaryValue, { color: "#d97706" }]}>
            {summary.pendingCount}
          </Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel} numberOfLines={1} ellipsizeMode="tail">
            Approved
          </Text>
          <Text style={[s.summaryValue, { color: "#16a34a" }]}>
            {summary.approvedCount}
          </Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel} numberOfLines={1} ellipsizeMode="tail">
            Rejected
          </Text>
          <Text style={[s.summaryValue, { color: "#ff0000" }]}>
            {summary.rejectedCount}
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

      {/* Requests List */}
      <View style={s.recordsCard}>
        <Text style={s.recordsTitle}>
          Attendance Requests ({filteredRecords.length})
        </Text>

        {filteredRecords.length === 0 ? (
          <View style={s.emptyBox}>
            <Ionicons
              name="document-text-outline"
              size={40}
              color={AppColors.grey}
            />
            <Text style={s.emptyTitle}>No Attendance Requests</Text>
            <Text style={s.emptySub}>
              {searchQuery
                ? `No requests matching "${searchQuery}".`
                : "No attendance requests submitted for this period."}
            </Text>
          </View>
        ) : (
          filteredRecords.map((item, index) => {
            if (!item) return null;
            const status = (item.status || "pending").toLowerCase();
            const isApproved = status === "approved";
            const isRejected = status === "rejected";

            const badgeBg = isApproved
              ? "#dcfce7"
              : isRejected
                ? "#fedbdb"
                : "#fef3c7";
            const badgeColor = isApproved
              ? "#16a34a"
              : isRejected
                ? "#ff0000"
                : "#d97706";

            const idStr = item.id != null ? String(item.id).toUpperCase() : "";

            let dateRange = "";
            if (item.from_date && item.to_date) {
              dateRange =
                item.from_date === item.to_date
                  ? `${item.from_date} (${item.from_time || ""} - ${item.to_time || ""})`
                  : `${item.from_date} ${item.from_time || ""} to ${item.to_date} ${item.to_time || ""}`;
            } else if (item.date) {
              dateRange = `${item.date} ${item.time || ""}`;
            }

            const staffDisplayName =
              item.name != null && item.name !== ""
                ? String(item.name)
                : selectedStaff?.name || "-";
            const staffIdDisplay =
              item.staff_id != null && item.staff_id !== ""
                ? String(item.staff_id)
                : selectedStaff?.id || "-";

            return (
              <View key={`${item.id ?? "req"}-${index}`} style={s.recordRow}>
                <View style={s.recordBody}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.staffName}>{staffDisplayName}</Text>
                    <Text style={s.staffIdText}>
                      Staff ID: {staffIdDisplay}
                      {idStr ? ` • ${idStr}` : ""}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={s.recordTime}>
                      {item.time || item.from_time || ""}
                    </Text>
                    <Text style={s.recordDate}>
                      {item.date || item.from_date || ""}
                    </Text>
                  </View>
                </View>

                {item.subject || item.remark || dateRange ? (
                  <View style={s.recordExtra}>
                    {item.subject ? (
                      <Text style={s.subjectText} numberOfLines={1}>
                        <Text style={s.extraLabel}>Subject: </Text>
                        {item.subject}
                      </Text>
                    ) : null}
                    {item.remark ? (
                      <Text style={s.remarkText} numberOfLines={2}>
                        <Text style={s.extraLabel}>Remark: </Text>
                        {item.remark}
                      </Text>
                    ) : null}
                    {dateRange ? (
                      <View style={s.dateRow}>
                        <Ionicons
                          name="calendar-outline"
                          size={12}
                          color={AppColors.grey}
                        />
                        <Text style={s.dateText}>{dateRange}</Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}

                <View style={[s.conStatus, { backgroundColor: badgeBg }]}>
                  <Text
                    style={[s.statusText, { color: badgeColor }]}
                    numberOfLines={1}
                  >
                    Status :
                  </Text>
                  <Text
                    style={[
                      s.statusText,
                      {
                        color: badgeColor,
                        fontFamily: AppFonts.bold,
                        includeFontPadding: false,
                        fontWeight: "bold",
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {status.toUpperCase()}
                  </Text>
                </View>
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
    overflow: "hidden",
  },
  recordBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
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
  recordTime: {
    fontSize: 13,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  recordDate: {
    fontSize: 12,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  recordExtra: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 2,
  },
  extraLabel: {
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    color: AppColors.textSecondary,
    fontSize: 12,
  },
  subjectText: {
    fontSize: 12.5,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  remarkText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  dateText: {
    fontSize: 11,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  conStatus: {
    borderTopWidth: 0.5,
    borderTopColor: AppColors.grey + "30",
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
