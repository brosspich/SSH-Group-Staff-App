import { useLanguage } from "@/features/language";
import { Card } from "@/shared/components/ui/Card";
import { Typography } from "@/shared/components/ui/Typography";
import { theme } from "@/shared/styles/theme";
import { formatDate, formatTime } from "@/utils/formatters";
import React from "react";
import { StyleSheet, View } from "react-native";
import { AuditLog } from "../types/audit.types";

export interface LogItemProps {
  log: AuditLog;
}

export const LogItem: React.FC<LogItemProps> = ({ log }) => {
  const { t } = useLanguage();

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Typography variant="body" weight="semibold">
          {log.action}
        </Typography>
        <Typography variant="caption" color={theme.colors.grey}>
          {formatDate(log.createdAt)} {formatTime(log.createdAt)}
        </Typography>
      </View>
      <Typography
        variant="bodySmall"
        color={theme.colors.textPrimary}
        style={styles.actor}
      >
        {t("auditLogs.actor", "Actor")}:{" "}
        <Typography variant="bodySmall" weight="medium">
          {log.actorName || log.actorId}
        </Typography>
      </Typography>
      {log.details && (
        <View style={styles.detailsBox}>
          <Typography variant="caption" color={theme.colors.textSecondary}>
            {JSON.stringify(log.details)}
          </Typography>
        </View>
      )}
    </Card>
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
  actor: {
    marginBottom: theme.spacing.xs,
  },
  detailsBox: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.xs,
    marginTop: theme.spacing.xs,
  },
});
