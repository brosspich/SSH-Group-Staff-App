import { useLanguage } from "@/features/language";
import { extractSystemKey } from "@/shared/constants/attendanceConfig";
import type { StaffUser } from "@/shared/services/userService";
import { theme } from "@/shared/styles/theme";
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
  const { t } = useLanguage();
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
              : [theme.colors.grey, theme.colors.textSecondary]
          }
          style={styles.avatarCircle}
        >
          <Text style={styles.avatarInitials}>{getTwoInitials(item.name)}</Text>
        </LinearGradient>

        {/* Staff Info */}
        <View style={styles.staffDetails}>
          <View style={styles.nameRow}>
            <Text style={styles.staffName} numberOfLines={1}>
              {item.name ||
                t("changeInfoStaff.defaultStaffMember", "Staff Member")}
            </Text>
            {/* Active Status Badge */}
            <View
              style={[
                styles.statusBadge,
                isActive
                  ? styles.statusBadgeActive
                  : styles.statusBadgeInactive,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isActive
                      ? theme.colors.success
                      : theme.colors.error,
                  },
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
                {isLeave
                  ? t("changeInfoStaff.statusLeave", "LEAVE")
                  : isActive
                    ? t("changeInfoStaff.statusActive", "ACTIVE")
                    : t("changeInfoStaff.statusInactive", "INACTIVE")}
              </Text>
            </View>
          </View>

          <Text style={styles.staffUsername}>@{item.username}</Text>

          {/* Metadata tags */}
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>
                {t("changeInfoStaff.idLabel", {
                  id: item.id,
                  defaultValue: `ID: ${item.id}`,
                })}
              </Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>
                {item.position || t("changeInfoStaff.defaultPosition", "Staff")}
              </Text>
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
          <Text style={styles.editBtnText}>
            {t("changeInfoStaff.editInfo", "Edit Info")}
          </Text>
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
    // fontWeight: "700",
    color: theme.colors.background2,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
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
    // fontWeight: "700",
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: 8,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
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
    backgroundColor: `${theme.colors.success}20`,
  },
  statusBadgeInactive: {
    backgroundColor: `${theme.colors.error}20`,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusBadgeText: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  statusBadgeTextActive: {
    color: theme.colors.success,
  },
  statusBadgeTextInactive: {
    color: theme.colors.error,
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
    // fontWeight: "600",
    fontFamily: theme.fonts.semibold,
    includeFontPadding: false,
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
    // fontWeight: "700",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
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
    gap: theme.spacing.xs2,
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
    backgroundColor: `${theme.colors.info}20`,
  },
  roleTagOwner: {
    backgroundColor: `${theme.colors.warning}20`,
  },
  roleTagText: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  roleTagTextStaff: {
    color: theme.colors.textSecondary,
  },
  roleTagTextAdmin: {
    color: theme.colors.info,
  },
  roleTagTextOwner: {
    color: theme.colors.warning,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.xs2,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `${theme.colors.primary}15`,
    borderColor: theme.colors.primary + 50,
    borderWidth: 0.5,
  },
  editBtnText: {
    fontSize: theme.fontSizes.xs,
    // fontWeight: "700",
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
