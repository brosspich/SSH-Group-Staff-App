import AppBarGlass from "@/components/appbar/AppBarGlass";
import Loading from "@/components/loading/loading";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { StaffUser, userService } from "@/services/userService";
import { apiClient } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AttendanceFilterSearch } from "./_components/AttendanceFilterSearch";
import { AttendanceHeaderBanner } from "./_components/AttendanceHeaderBanner";
import { AttendanceLogCard } from "./_components/AttendanceLogCard";
import {
  AttendanceFilterType,
  AttendanceRecord,
} from "./_types/attendance.types";

export * from "./_types/attendance.types";

export function formatDateYMD(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function AttendanceScreen() {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);

  // Filter & Search
  const [historyFilter, setHistoryFilter] =
    useState<AttendanceFilterType>("today");
  const [searchQuery, setSearchQuery] = useState("");

  const insets = useSafeAreaInsets();

  const fetchAttendanceLogs = useCallback(async () => {
    try {
      const u = await userService.get();
      if (u?.id) {
        const dbUser = await apiClient
          .get<StaffUser>(`/users-query/${u.id}`)
          .catch(() => null);

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

  // Filtered & Searched records
  const filteredList = attendanceList.filter((r) => {
    let matchesChip = true;
    if (historyFilter === "today") {
      matchesChip = r.date === todayStr;
    } else if (historyFilter === "month") {
      const currentMonth = todayStr.substring(0, 7);
      matchesChip = r.date.startsWith(currentMonth);
    }

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
      <StatusBar
        backgroundColor={AppColors.background}
        barStyle="light-content"
      />
      <AppBarGlass />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={AppColors.primary}
            colors={[AppColors.primary]}
          />
        }
      >
        <View style={styles.container}>
          {/* ── Header Title Banner & Quick Stat Bar ── */}
          <AttendanceHeaderBanner
            totalCount={attendanceList.length}
            timeInCount={timeInCount}
            timeOutCount={timeOutCount}
            timeOtherCount={timeOtherCount}
            topInset={insets.top}
          />

          {/* ── Search & Filter Bar ── */}
          <AttendanceFilterSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            historyFilter={historyFilter}
            onFilterChange={setHistoryFilter}
            todayCount={todayRecords.length}
            allCount={attendanceList.length}
          />

          {/* ── Attendance Cards List ── */}
          {filteredList.length === 0 ? (
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
              {filteredList.map((item, index) => (
                <AttendanceLogCard
                  key={`${item.id ?? "rec"}-${index}`}
                  record={item}
                />
              ))}
            </View>
          )}

          <View style={{ marginTop: 24 }} />
        </View>
      </ScrollView>
    </View>
  );
}

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
  container: {},
  historyList: {
    gap: 12,
    paddingHorizontal: 15,
  },
  emptyCard: {
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    padding: 36,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 15,
  },
  emptyTitle: {
    fontSize: 16,
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
