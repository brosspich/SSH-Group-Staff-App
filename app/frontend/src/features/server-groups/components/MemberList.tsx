import { Typography } from "@/shared/components/ui/Typography";
import { theme } from "@/shared/styles/theme";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SshGroupMember } from "../types/sshGroup.types";

export interface MemberListProps {
  members: SshGroupMember[];
}

export const MemberList: React.FC<MemberListProps> = ({ members }) => {
  return (
    <View style={styles.container}>
      <Typography variant="h3" style={styles.title}>
        Members ({members.length})
      </Typography>
      <FlatList
        data={members}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <View style={styles.memberRow}>
            <View>
              <Typography variant="body" weight="medium">
                {item.username}
              </Typography>
              <Typography variant="caption">{item.role}</Typography>
            </View>
            <Typography variant="caption" color={theme.colors.grey}>
              Joined {new Date(item.joinedAt).toLocaleDateString()}
            </Typography>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
  },
  title: {
    marginBottom: theme.spacing.sm,
  },
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
});
