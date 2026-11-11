import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
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
  const { t } = useLanguage();

  return (
    <>
      {/* ── Search Bar ── */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={theme.colors.grey} />
        <TextInput
          style={styles.searchInput}
          placeholder={t("attendance.searchPlaceholder")}
          placeholderTextColor={theme.colors.grey}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange("")}>
            <Ionicons name="close-circle" size={18} color={theme.colors.grey} />
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
            {`${t("attendance.filterToday")} (${todayCount})`}
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
            {t("report.monthly")}
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
            {`${t("attendance.filterAll")} (${allCount})`}
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
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.grey + 70,
    marginTop: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    ...(Platform.OS === "web" &&
      ({ outlineStyle: "none", outlineWidth: 0 } as any)),
  },
  filterRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  filterChipTextActive: {
    color: theme.colors.background2,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
