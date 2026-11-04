import { AppColors } from "@/constants/appcolors";
import AppBarGlass from "@/shared/components/appbar/AppBarGlass";
import Loading from "@/shared/components/loading/loading";
import {
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AttendanceEmptyState } from "./_components/AttendanceEmptyState";
import { AttendanceFilterSearch } from "./_components/AttendanceFilterSearch";
import { AttendanceHeaderBanner } from "./_components/AttendanceHeaderBanner";
import { AttendanceListFooter } from "./_components/AttendanceListFooter";
import { AttendanceLogCard } from "./_components/AttendanceLogCard";
import { useAttendanceLogs } from "./hooks/useAttendanceLogs";

export * from "./_types/attendance.types";
export { formatDateYMD } from "./utils/attendanceFilter.utils";

export default function AttendanceScreen() {
  const insets = useSafeAreaInsets();
  const {
    attendanceList,
    displayedList,
    filteredList,
    counts,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    historyFilter,
    searchQuery,
    pageSize,
    onRefresh,
    handleLoadMore,
    handleFilterChange,
    handleSearchChange,
  } = useAttendanceLogs();

  if (loading && attendanceList.length === 0) {
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

      <FlatList
        data={displayedList}
        keyExtractor={(item, index) => `${item.id ?? "rec"}-${index}`}
        renderItem={({ item }) => <AttendanceLogCard record={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={AppColors.primary}
            colors={[AppColors.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        ListHeaderComponent={
          <View style={styles.headerBox}>
            <AttendanceHeaderBanner
              totalCount={counts.allCount}
              timeInCount={counts.timeInCount}
              timeOutCount={counts.timeOutCount}
              timeOtherCount={counts.timeOtherCount}
              topInset={insets.top}
            />

            <AttendanceFilterSearch
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              historyFilter={historyFilter}
              onFilterChange={handleFilterChange}
              todayCount={counts.todayCount}
              allCount={counts.allCount}
            />
          </View>
        }
        ListEmptyComponent={<AttendanceEmptyState searchQuery={searchQuery} />}
        ListFooterComponent={
          <AttendanceListFooter
            loadingMore={loadingMore}
            hasMore={hasMore}
            totalFilteredCount={filteredList.length}
            pageSize={pageSize}
          />
        }
      />
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
  headerBox: {
    marginBottom: 12,
  },
});
