import AppbarBack from "@/components/appbar/appbarback";
import Loading from "@/components/loading/loading";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import {
  AuditActionType,
  LogFilterBar,
  LogItem,
  useAuditLogs,
} from "@/features/audit-logs";
import { useResponsive } from "@/hooks/useResponsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AuditLogsScreen() {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsive();

  const [selectedAction, setSelectedAction] = useState<AuditActionType | undefined>(
    undefined
  );

  const { logs, isLoading, refresh, setFilterParams } = useAuditLogs({
    limit: 50,
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
    }));
  };

  return (
    <View style={styles.container}>
      <AppbarBack Title="Security Audit Trail" />

      {isLoading && !refreshing ? (
        <Loading />
      ) : (
        <View style={[styles.content, !isMobile && styles.webContainer]}>
          <View style={styles.header}>
            <Text style={styles.title}>System & Access Audit</Text>
            <Text style={styles.subtitle}>
              Immutable log of check-ins, key updates, and server connections ({logs.length} events)
            </Text>
          </View>

          <View style={styles.filterContainer}>
            <LogFilterBar
              selectedAction={selectedAction}
              onSelectAction={handleFilterChange}
            />
          </View>

          <FlatList
            data={logs}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={AppColors.secondary}
              />
            }
            renderItem={({ item }) => <LogItem log={item} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={48}
                  color={AppColors.grey}
                />
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
    backgroundColor: AppColors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  webContainer: {
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
  },
  subtitle: {
    fontSize: 12,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    marginTop: 2,
  },
  filterContainer: {
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 40,
    gap: 10,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 16,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
  },
  emptySubtext: {
    fontSize: 13,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    textAlign: "center",
  },
});
