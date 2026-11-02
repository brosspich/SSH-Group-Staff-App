import { Typography } from "@/components/ui/Typography";
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
            <Typography variant="caption" color="#8E8E93">
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
    marginVertical: 12,
  },
  title: {
    marginBottom: 8,
  },
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
});
