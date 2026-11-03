import { AppColors } from "@/constants/appcolors";
import type { DynamicSystemItem } from "@/constants/attendanceConfig";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { StaffStatusFilter } from "../_types/changeInfoStaff.types";

interface ChangeInfoFilterBarProps {
  isOwner: boolean;
  selectedSystemFilter: string;
  setSelectedSystemFilter: (v: string) => void;
  availableSystems: DynamicSystemItem[];
  statusFilter: StaffStatusFilter;
  setStatusFilter: (v: StaffStatusFilter) => void;
}

export const ChangeInfoFilterBar: React.FC<ChangeInfoFilterBarProps> = ({
  isOwner,
  selectedSystemFilter,
  setSelectedSystemFilter,
  availableSystems,
  statusFilter,
  setStatusFilter,
}) => {
  return (
    <View style={styles.container}>
      {/* System Filter for Owner */}
      {isOwner && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterChipScroll}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {[
            { label: "All Systems", value: "all" },
            ...availableSystems.map((s) => ({
              label: s.companyName
                ? `${s.id.toUpperCase()} • ${s.companyName}`
                : s.id.toUpperCase(),
              value: s.id,
            })),
          ].map((item) => {
            const active = selectedSystemFilter === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                onPress={() => setSelectedSystemFilter(item.value)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    active && styles.filterChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Status Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.filterChipScroll, { marginTop: isOwner ? 6 : 0 }]}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {[
          { label: "All Staff", value: "all" },
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
          { label: "Admins / Owners", value: "admin" },
        ].map((item) => {
          const active = statusFilter === item.value;
          return (
            <TouchableOpacity
              key={item.value}
              onPress={() => setStatusFilter(item.value as StaffStatusFilter)}
              style={[styles.statusChip, active && styles.statusChipActive]}
            >
              <Text
                style={[
                  styles.statusChipText,
                  active && styles.statusChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
  filterChipScroll: {
    flexDirection: "row",
    paddingVertical: 2,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: AppColors.background2,
    marginRight: 8,
    borderWidth: 1,
    borderColor: `${AppColors.grey}25`,
  },
  filterChipActive: {
    backgroundColor: `${AppColors.primary}18`,
    borderColor: AppColors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.textSecondary,
  },
  filterChipTextActive: {
    color: AppColors.primary,
    fontWeight: "700",
  },
  statusChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: AppColors.background2,
    marginRight: 6,
    borderWidth: 1,
    borderColor: `${AppColors.grey}20`,
  },
  statusChipActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.textSecondary,
  },
  statusChipTextActive: {
    color: "#fff",
  },
});
