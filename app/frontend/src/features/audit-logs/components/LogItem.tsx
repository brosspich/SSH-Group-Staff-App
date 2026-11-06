import { theme } from "@/shared/styles/theme";
import { Card } from "@/shared/components/ui/Card";
import { Typography } from "@/shared/components/ui/Typography";
import { formatDate, formatTime } from "@/utils/formatters";
import React from "react";
import { StyleSheet, View } from "react-native";
import { AuditLog } from "../types/audit.types";

export interface LogItemProps {
  log: AuditLog;
}

export const LogItem: React.FC<LogItemProps> = ({ log }) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Typography variant="body" weight="semibold">
          {log.action}
        </Typography>
        <Typography variant="caption" color="#8E8E93">
          {formatDate(log.createdAt)} {formatTime(log.createdAt)}
        </Typography>
      </View>
      <Typography variant="bodySmall" color="#444444" style={styles.actor}>
        Actor:{" "}
        <Typography variant="bodySmall" weight="medium">
          {log.actorName || log.actorId}
        </Typography>
      </Typography>
      {log.details && (
        <View style={styles.detailsBox}>
          <Typography variant="caption" color="#666666">
            {JSON.stringify(log.details)}
          </Typography>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  actor: {
    marginBottom: 4,
  },
  detailsBox: {
    backgroundColor: "#F9F9FB",
    padding: 6,
    borderRadius: theme.borderRadius.xs,
    marginTop: 4,
  },
});
