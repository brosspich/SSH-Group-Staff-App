import { useLanguage } from "@/features/language";
import AppbarBack from "@/shared/components/appbar/appbarback";
import Loading from "@/shared/components/loading/loading";
import { useUser } from "@/shared/contexts/UserContext";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogFilterBar } from "./components/LogFilterBar";
import { LogItem } from "./components/LogItem";
import { useAuditLogs } from "./hooks/useAuditLogs";
import type { AuditActionType } from "./types/audit.types";

export default function AuditLogsScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsive();
  const { user } = useUser();

  const currentCompanyId =
    (user as any)?.company_id ||
    (user as any)?.companyId ||
    (user as any)?.details?.companyId ||
    user?.system_id?.match(/^(system-\d+)/i)?.[1]?.toLowerCase();

  const [selectedAction, setSelectedAction] = useState<
    AuditActionType | undefined
  >(undefined);

  const { logs, isLoading, refresh, setFilterParams } = useAuditLogs({
    limit: 50,
    companyId: currentCompanyId,
  });

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleFilterChange = (action?: AuditActionType) => {
    setSelectedAction(action);
    setFilterParams((prev) => ({
      ...prev,
      action,
      companyId: currentCompanyId,
    }));
  };

  const filteredLogs = logs.filter((log) => {
    if (!currentCompanyId) return true;
    if (
      log.actorId &&
      log.actorId.startsWith("system-") &&
      !log.actorId.startsWith(currentCompanyId)
    ) {
      return false;
    }
    if (
      log.targetId &&
      log.targetId.startsWith("system-") &&
      !log.targetId.startsWith(currentCompanyId)
    ) {
      return false;
    }
    if (
      log.details &&
      typeof log.details === "object" &&
      (log.details as any).companyId
    ) {
      if ((log.details as any).companyId !== currentCompanyId) return false;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <AppbarBack Title={t("setting.auditLogs")} />

      {isLoading && !refreshing ? (
        <Loading />
      ) : (
        <View style={[styles.content, !isMobile && styles.webContainer]}>
          <View style={styles.header}>
            <Text style={styles.title}>System & Access Audit</Text>
            <Text style={styles.subtitle}>
              Immutable log of check-ins, key updates, and server connections (
              {filteredLogs.length} events)
            </Text>
          </View>

          <View style={styles.filterContainer}>
            <LogFilterBar
              selectedAction={selectedAction}
              onSelectAction={handleFilterChange}
            />
          </View>

          <FlatList
            data={filteredLogs}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={theme.colors.secondary}
              />
            }
            renderItem={({ item }) => <LogItem log={item} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={36}
                    color={theme.colors.grey}
                  />
                </View>
                <Text style={styles.emptyText}>No Audit Logs Found</Text>
                <Text style={styles.emptySubtext}>
                  Security events and attendance logs will appear here
                </Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.base,
    backgroundColor: theme.colors.background2,
  },
  webContainer: {
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  subtitle: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    marginTop: theme.spacing.xs,
    lineHeight: 16,
  },
  filterContainer: {
    marginBottom: theme.spacing.md,
  },
  listContent: {
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xxxl,
    gap: theme.spacing.md,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    backgroundColor: `${theme.colors.grey}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xs,
  },
  emptyText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  emptySubtext: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.grey,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    textAlign: "center",
  },
});
