import { useLanguage } from "@/features/language";
import { Card } from "@/shared/components/ui/Card";
import { Typography } from "@/shared/components/ui/Typography";
import { theme } from "@/shared/styles/theme";
import { formatDate } from "@/utils/formatters";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SshKey } from "../types/key.types";

export interface KeyItemProps {
  sshKey: SshKey;
  onDelete?: (id: string) => void;
}

export const KeyItem: React.FC<KeyItemProps> = ({ sshKey, onDelete }) => {
  const { t } = useLanguage();

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View>
          <Typography variant="body" weight="semibold">
            {sshKey.name}
          </Typography>
          <Typography variant="caption" color={theme.colors.textSecondary}>
            {sshKey.type} • {t("keys.created", "Created")}{" "}
            {formatDate(sshKey.createdAt)}
          </Typography>
        </View>
        {onDelete && (
          <TouchableOpacity onPress={() => onDelete(sshKey.id)}>
            <Typography
              variant="bodySmall"
              color={theme.colors.error}
              weight="semibold"
            >
              {t("keys.revoke", "Revoke")}
            </Typography>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.fingerprintBox}>
        <Typography
          variant="caption"
          color={theme.colors.textSecondary}
          numberOfLines={1}
        >
          {sshKey.fingerprint}
        </Typography>
      </View>
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
    marginBottom: theme.spacing.sm,
  },
  fingerprintBox: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
});
