import { Card } from "@/shared/components/ui/Card";
import { Typography } from "@/shared/components/ui/Typography";
import { formatDate } from "@/utils/formatters";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SshKey } from "../types/key.types";

export interface KeyItemProps {
  sshKey: SshKey;
  onDelete?: (id: string) => void;
}

export const KeyItem: React.FC<KeyItemProps> = ({ sshKey, onDelete }) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View>
          <Typography variant="body" weight="semibold">
            {sshKey.name}
          </Typography>
          <Typography variant="caption" color="#8E8E93">
            {sshKey.type} • Created {formatDate(sshKey.createdAt)}
          </Typography>
        </View>
        {onDelete && (
          <TouchableOpacity onPress={() => onDelete(sshKey.id)}>
            <Typography variant="bodySmall" color="#FF3B30" weight="semibold">
              Revoke
            </Typography>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.fingerprintBox}>
        <Typography variant="caption" color="#555555" numberOfLines={1}>
          {sshKey.fingerprint}
        </Typography>
      </View>
    </Card>
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
    marginBottom: 8,
  },
  fingerprintBox: {
    backgroundColor: "#F2F2F7",
    padding: 8,
    borderRadius: 6,
  },
});
