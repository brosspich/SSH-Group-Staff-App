import { useLanguage } from "@/features/language";
import type { DynamicSystemItem } from "@/shared/constants/attendanceConfig";
import { theme } from "@/shared/styles/theme";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
  const { t } = useLanguage();

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
            {
              label: t("changeInfoStaff.allSystems", "All Systems"),
              value: "all",
            },
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
          { label: t("changeInfoStaff.allStaff", "All Staff"), value: "all" },
          { label: t("changeInfoStaff.active", "Active"), value: "active" },
          {
            label: t("changeInfoStaff.inactive", "Inactive"),
            value: "inactive",
          },
          {
            label: t("changeInfoStaff.adminsOwners", "Admins / Owners"),
            value: "admin",
          },
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
    borderBottomWidth: 0.5,
    borderColor: theme.colors.grey + 70,
  },
  filterChipScroll: {
    flexDirection: "row",
    paddingVertical: 2,
  },
  filterChip: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.xs,
    backgroundColor: theme.colors.background2,
    marginRight: 8,
    borderWidth: 1,
    borderColor: `${theme.colors.grey}25`,
  },
  filterChipActive: {
    backgroundColor: `${theme.colors.primary}18`,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: theme.fontSizes.xs,
    // fontWeight: "600",
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.semibold,
    includeFontPadding: false,
  },
  filterChipTextActive: {
    color: theme.colors.primary,
    // fontWeight: "700",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  statusChip: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.base,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background2,
    marginRight: 6,
    borderWidth: 1,
    borderColor: `${theme.colors.grey}20`,
  },
  statusChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  statusChipText: {
    fontSize: theme.fontSizes.xs,
    // fontWeight: "600",
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.semibold,
    includeFontPadding: false,
  },
  statusChipTextActive: {
    color: theme.colors.background2,
  },
});
