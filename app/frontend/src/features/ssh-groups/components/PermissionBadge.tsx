import { theme } from "@/shared/styles/theme";
import { Typography } from "@/shared/components/ui/Typography";
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
        return { bg: "#FFEBEA", text: "#FF3B30" };
      case "write":
        return { bg: "#EBF3FF", text: "#007AFF" };
      case "read":
      default:
        return { bg: "#E8F5E9", text: "#34C759" };
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.xs,
    alignSelf: "flex-start",
  },
});
