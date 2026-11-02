import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SshGroup } from "../types/sshGroup.types";
import { PermissionBadge } from "./PermissionBadge";

export interface GroupCardProps {
  group: SshGroup;
  onPress?: () => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, onPress }) => {
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
          <Typography variant="bodySmall" color="#666666" style={styles.desc}>
            {group.description}
          </Typography>
        ) : null}

        <View style={styles.footer}>
          <Typography variant="caption" color="#8E8E93">
            {group.serverCount || 0} Servers
          </Typography>
          <Typography variant="caption" color="#8E8E93">
            {group.members?.length || 0} Members
          </Typography>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  permissions: {
    flexDirection: "row",
    gap: 4,
  },
  desc: {
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
    paddingTop: 8,
  },
});
