import { useLanguage } from "@/features/language";
import { Card } from "@/shared/components/ui/Card";
import { Typography } from "@/shared/components/ui/Typography";
import { theme } from "@/shared/styles/theme";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SshGroup } from "../types/sshGroup.types";
import { PermissionBadge } from "./PermissionBadge";

export interface GroupCardProps {
  group: SshGroup;
  onPress?: () => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, onPress }) => {
  const { t } = useLanguage();

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={!onPress}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Typography variant="h3">{group.name}</Typography>
          <View style={styles.permissions}>
            {group.permissions?.map((p) => (
              <PermissionBadge key={p} permission={p} />
            ))}
          </View>
        </View>

        {group.description ? (
          <Typography
            variant="bodySmall"
            color={theme.colors.textSecondary}
            style={styles.desc}
          >
            {group.description}
          </Typography>
        ) : null}

        <View style={styles.footer}>
          <Typography variant="caption" color={theme.colors.grey}>
            {group.serverCount || 0} {t("serverGroups.servers", "Servers")}
          </Typography>
          <Typography variant="caption" color={theme.colors.grey}>
            {group.members?.length || 0} {t("serverGroups.members", "Members")}
          </Typography>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: theme.spacing.xs,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  permissions: {
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  desc: {
    marginBottom: theme.spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
  },
});
