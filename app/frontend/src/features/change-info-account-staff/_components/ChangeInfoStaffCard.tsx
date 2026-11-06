import { theme } from "@/shared/styles/theme";
import { extractSystemKey } from "@/shared/constants/attendanceConfig";
import type { StaffUser } from "@/shared/services/userService";
import { getTwoInitials } from "@/utils/formatters";
import { formatRolesList, isLeaveRole } from "@/utils/roleUtils";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ChangeInfoStaffCardProps {
  item: StaffUser;
  onEdit: (item: StaffUser) => void;
}

export const ChangeInfoStaffCard: React.FC<ChangeInfoStaffCardProps> = ({
  item,
  onEdit,
}) => {
  const roles = formatRolesList(item.role);
  const isActive = item.is_active !== false;
  const isLeave = isLeaveRole(item.role);

  return (
    <View style={styles.staffCard}>
      <View style={styles.cardHeader}>
        {/* Avatar */}
        <LinearGradient
          colors={
            isActive
              ? [theme.colors.primary, theme.colors.secondary]
              : ["#9CA3AF", "#6B7280"]
          }
          style={styles.avatarCircle}
        >
          <Text style={styles.avatarInitials}>{getTwoInitials(item.name)}</Text>
        </LinearGradient>

        {/* Staff Info */}
        <View style={styles.staffDetails}>
          <View style={styles.nameRow}>
            <Text style={styles.staffName} numberOfLines={1}>
              {item.name || "Staff Member"}
            </Text>
            {/* Active Status Badge */}
            <View
              style={[
                styles.statusBadge,
                isActive ? styles.statusBadgeActive : styles.statusBadgeInactive,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isActive ? "#22c55e" : "#ef4444" },
                ]}
              />
              <Text
                style={[
                  styles.statusBadgeText,
                  isActive
                    ? styles.statusBadgeTextActive
                    : styles.statusBadgeTextInactive,
                ]}
              >
                {isLeave ? "LEAVE" : isActive ? "ACTIVE" : "INACTIVE"}
              </Text>
            </View>
          </View>

          <Text style={styles.staffUsername}>@{item.username}</Text>

          {/* Metadata tags */}
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>ID: {item.id}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>{item.position || "Staff"}</Text>
            </View>
            {item.system_id && (
              <View style={styles.systemBadge}>
                <Text style={styles.systemBadgeText}>
                  {extractSystemKey(item.system_id)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Role badges & Action Button */}
      <View style={styles.cardFooter}>
        <View style={styles.rolesContainer}>
          {roles.map((r) => (
            <View
              key={r}
              style={[
                styles.roleTag,
                r === "admin"
                  ? styles.roleTagAdmin
                  : r === "owner"
                    ? styles.roleTagOwner
                    : styles.roleTagStaff,
              ]}
            >
              <Text
                style={[
                  styles.roleTagText,
                  r === "admin"
                    ? styles.roleTagTextAdmin
                    : r === "owner"
                      ? styles.roleTagTextOwner
                      : styles.roleTagTextStaff,
                ]}
              >
                {r.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => onEdit(item)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="create-outline"
            size={16}
            color={theme.colors.primary}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.editBtnText}>Edit Info</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  staffCard: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: `${theme.colors.grey}25`,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarInitials: {
    fontSize: theme.fontSizes.md,
    fontWeight: "700",
    color: "#fff",
  },
  staffDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  staffName: {
    fontSize: theme.fontSizes.md,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  staffUsername: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.md,
  },
  statusBadgeActive: {
    backgroundColor: "#dcfce7",
  },
  statusBadgeInactive: {
    backgroundColor: "#fee2e2",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusBadgeText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: "700",
  },
  statusBadgeTextActive: {
    color: "#166534",
  },
  statusBadgeTextInactive: {
    color: "#991b1b",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  metaBadge: {
    backgroundColor: `${theme.colors.grey}18`,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: theme.borderRadius.xs,
  },
  metaBadgeText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  systemBadge: {
    backgroundColor: `${theme.colors.primary}18`,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: theme.borderRadius.xs,
  },
  systemBadgeText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.primary,
    fontWeight: "700",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: `${theme.colors.grey}15`,
  },
  rolesContainer: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    flex: 1,
  },
  roleTag: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.xs,
  },
  roleTagStaff: {
    backgroundColor: `${theme.colors.grey}20`,
  },
  roleTagAdmin: {
    backgroundColor: "#dbeafe",
  },
  roleTagOwner: {
    backgroundColor: "#fef3c7",
  },
  roleTagText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: "700",
  },
  roleTagTextStaff: {
    color: theme.colors.textSecondary,
  },
  roleTagTextAdmin: {
    color: "#1d4ed8",
  },
  roleTagTextOwner: {
    color: "#b45309",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `${theme.colors.primary}15`,
  },
  editBtnText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: "700",
    color: theme.colors.primary,
  },
});
