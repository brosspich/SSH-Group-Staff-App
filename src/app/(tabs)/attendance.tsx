import Loading from "@/components/loading/loading";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useResponsive } from "@/hooks/useResponsive";
import { StaffUser, userService } from "@/services/userService";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export type AttendanceType = "time-in" | "time-out" | "time-other";

export interface AttendanceRecord {
  id: string;
  staff_id: string;
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // hh:mm:ss AM/PM
  type: AttendanceType;
  timestamp: string; // ISO string
  qr_data?: string;
}

export function formatDateYMD(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function AttendanceLogsScreen() {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);

  // Filter & Search
  const [historyFilter, setHistoryFilter] = useState<"all" | "today" | "month">(
    "today",
  );
  const [searchQuery, setSearchQuery] = useState("");

  const { isMobile } = useResponsive();

  const fetchAttendanceLogs = useCallback(async () => {
    try {
      const u = await userService.get();
      if (u?.id) {
        const { data: dbUser } = await supabase
          .from("ssh_group_staff_users")
          .select("*")
          .eq("id", u.id)
          .maybeSingle();

        const activeUser = dbUser || u;
        setUser(activeUser);
        await userService.save(activeUser);

        let list: AttendanceRecord[] = [];
        if (Array.isArray(activeUser.attendance)) {
          list = activeUser.attendance;
        } else if (typeof activeUser.attendance === "string") {
          try {
            list = JSON.parse(activeUser.attendance);
          } catch (e) {}
        }
        setAttendanceList(list);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendanceLogs();
  }, [fetchAttendanceLogs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAttendanceLogs();
  }, [fetchAttendanceLogs]);

  const todayStr = formatDateYMD(new Date());
  const todayRecords = attendanceList.filter((r) => r.date === todayStr);

  const timeInCount = attendanceList.filter((r) => r.type === "time-in").length;
  const timeOutCount = attendanceList.filter(
    (r) => r.type === "time-out",
  ).length;
  const timeOtherCount = attendanceList.filter(
    (r) => r.type === "time-other",
  ).length;

  // Filtered history list
  const filteredHistory = attendanceList.filter((r) => {
    // Filter chip matching
    let matchesChip = true;
    if (historyFilter === "today") matchesChip = r.date === todayStr;
    if (historyFilter === "month") {
      const currentMonth = todayStr.substring(0, 7);
      matchesChip = r.date.startsWith(currentMonth);
    }

    // Search query matching
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      matchesSearch =
        r.date.toLowerCase().includes(q) ||
        r.time.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.staff_id.toLowerCase().includes(q) ||
        Boolean(r.id?.toLowerCase().includes(q));
    }

    return matchesChip && matchesSearch;
  });

  if (loading) {
    return (
      <View style={styles.safe}>
        <View style={styles.centered}>
          <Loading />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={AppColors.primary}
            colors={[AppColors.primary]}
          />
        }
      >
        <View
          style={[
            styles.container,
            !isMobile && { maxWidth: "70%", alignSelf: "center" },
          ]}
        >
          {/* ── Header Title Banner ── */}
          <LinearGradient
            colors={[AppColors.secondary, AppColors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerCard}
          >
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.headerSubTitle}>
                  Staff Attendance History
                </Text>
                <Text style={styles.headerTitle}>Attendance Logs</Text>
              </View>
              <View style={styles.headerCountBadge}>
                <Text style={styles.headerCountText}>
                  {attendanceList.length} Total
                </Text>
              </View>
            </View>

            {/* Quick Stat Bar */}
            <View style={styles.statBar}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{timeInCount}</Text>
                <Text style={styles.statLabel}>Time-In</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{timeOutCount}</Text>
                <Text style={styles.statLabel}>Time-Out</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{timeOtherCount}</Text>
                <Text style={styles.statLabel}>Other</Text>
              </View>
            </View>
          </LinearGradient>

          {/* ── Search & Filter Bar ── */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={AppColors.grey} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by date, time, status, or ID..."
              placeholderTextColor={AppColors.grey}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={AppColors.grey}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* ── Filter Chips ── */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                historyFilter === "today" && styles.filterChipActive,
              ]}
              onPress={() => setHistoryFilter("today")}
            >
              <Text
                style={[
                  styles.filterChipText,
                  historyFilter === "today" && styles.filterChipTextActive,
                ]}
              >
                Today ({todayRecords.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                historyFilter === "month" && styles.filterChipActive,
              ]}
              onPress={() => setHistoryFilter("month")}
            >
              <Text
                style={[
                  styles.filterChipText,
                  historyFilter === "month" && styles.filterChipTextActive,
                ]}
              >
                This Month
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                historyFilter === "all" && styles.filterChipActive,
              ]}
              onPress={() => setHistoryFilter("all")}
            >
              <Text
                style={[
                  styles.filterChipText,
                  historyFilter === "all" && styles.filterChipTextActive,
                ]}
              >
                All ({attendanceList.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Logs List ── */}
          {filteredHistory.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons
                name="calendar-outline"
                size={44}
                color={AppColors.grey}
              />
              <Text style={styles.emptyTitle}>No Logs Found</Text>
              <Text style={styles.emptySub}>
                {searchQuery
                  ? `No attendance records matching "${searchQuery}".`
                  : "Scan an official QR code to record attendance."}
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {filteredHistory.map((item) => {
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
                  <View key={item.id} style={styles.historyCard}>
                    <View style={styles.historyCardHeader}>
                      <View
                        style={[
                          styles.historyBadge,
                          { backgroundColor: badgeBg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.historyBadgeText,
                            { color: badgeColor },
                          ]}
                        >
                          {item.type.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.historyIdText}>{item.id}</Text>
                    </View>

                    <View style={styles.historyCardBody}>
                      <View style={styles.historyLeftCol}>
                        <Text style={styles.historyTimeText}>{item.time}</Text>
                        <Text style={styles.historyDateText}>{item.date}</Text>
                      </View>

                      <View style={styles.historyRightCol}>
                        <Text style={styles.historyStaffName}>{item.name}</Text>
                        <Text style={styles.historyStaffId}>
                          Staff ID: {item.staff_id}
                        </Text>
                      </View>
                    </View>

                    {item.qr_data && (
                      <View style={styles.historyFooter}>
                        <Text
                          style={styles.historyQrText}
                          numberOfLines={1}
                          ellipsizeMode="middle"
                        >
                          QR: {item.qr_data}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          <View style={{ marginTop: 24 }} />
          {/* <Copyright /> */}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // Header Banner
  headerCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerSubTitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    marginTop: 2,
  },
  headerCountBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  headerCountText: {
    fontSize: 12,
    fontWeight: "bold",
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },

  // Stat bar
  statBar: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 14,
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.background2,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },

  // Filter Chips
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: AppColors.background2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  filterChipActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  filterChipTextActive: {
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    fontWeight: "bold",
  },

  // Logs List
  historyList: {
    gap: 12,
  },
  historyCard: {
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  historyCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  historyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  historyBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  historyIdText: {
    fontSize: 11,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },

  historyCardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyLeftCol: {},
  historyTimeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  historyDateText: {
    fontSize: 12,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },
  historyRightCol: {
    alignItems: "flex-end",
  },
  historyStaffName: {
    fontSize: 13.5,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  historyStaffId: {
    fontSize: 11.5,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },

  historyFooter: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.04)",
  },
  historyQrText: {
    fontSize: 11,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },

  // Empty State
  emptyCard: {
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    padding: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    marginTop: 12,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  emptySub: {
    fontSize: 12.5,
    color: AppColors.grey,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
});
