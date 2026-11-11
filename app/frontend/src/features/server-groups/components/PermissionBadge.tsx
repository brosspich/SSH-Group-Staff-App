import { Typography } from "@/shared/components/ui/Typography";
import { theme } from "@/shared/styles/theme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SshPermissionLevel } from "../types/sshGroup.types";

export interface PermissionBadgeProps {
  permission: SshPermissionLevel;
}

export const PermissionBadge: React.FC<PermissionBadgeProps> = ({
  permission,
}) => {
  const getColor = () => {
    switch (permission) {
      case "admin":
        return { bg: `${theme.colors.error}18`, text: theme.colors.error };
      case "write":
        return { bg: `${theme.colors.info}18`, text: theme.colors.info };
      case "read":
      default:
        return { bg: `${theme.colors.success}18`, text: theme.colors.success };
    }
  };

  const { bg, text } = getColor();

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Typography variant="caption" color={text} weight="semibold">
        {permission.toUpperCase()}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.xs,
    alignSelf: "flex-start",
  },
});
