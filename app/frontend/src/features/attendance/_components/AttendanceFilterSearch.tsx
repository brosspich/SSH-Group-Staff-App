import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AttendanceFilterType } from "../_types/attendance.types";

interface AttendanceFilterSearchProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  historyFilter: AttendanceFilterType;
  onFilterChange: (filter: AttendanceFilterType) => void;
  todayCount: number;
  allCount: number;
}

export const AttendanceFilterSearch: React.FC<AttendanceFilterSearchProps> = ({
  searchQuery,
  onSearchChange,
  historyFilter,
  onFilterChange,
  todayCount,
  allCount,
}) => {
  return (
    <>
      {/* ── Search Bar ── */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={AppColors.grey} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by date, time, status, or ID..."
          placeholderTextColor={AppColors.grey}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange("")}>
            <Ionicons name="close-circle" size={18} color={AppColors.grey} />
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
          onPress={() => onFilterChange("today")}
        >
          <Text
            style={[
              styles.filterChipText,
              historyFilter === "today" && styles.filterChipTextActive,
            ]}
          >
            Today ({todayCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            historyFilter === "month" && styles.filterChipActive,
          ]}
          onPress={() => onFilterChange("month")}
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
          onPress={() => onFilterChange("all")}
        >
          <Text
            style={[
              styles.filterChipText,
              historyFilter === "all" && styles.filterChipTextActive,
            ]}
          >
            All ({allCount})
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
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
    borderColor: AppColors.grey + 70,
    marginTop: 15,
    marginHorizontal: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    ...(Platform.OS === "web" &&
      ({ outlineStyle: "none", outlineWidth: 0 } as any)),
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 15,
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
    includeFontPadding: false,
  },
});
