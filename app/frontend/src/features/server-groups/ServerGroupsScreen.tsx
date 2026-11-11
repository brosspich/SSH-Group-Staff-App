import { useLanguage } from "@/features/language";
import AppbarBack from "@/shared/components/appbar/appbarback";
import Loading from "@/shared/components/loading/loading";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GroupCard } from "./components/GroupCard";
import { MemberList } from "./components/MemberList";
import { useSshGroupsQuery } from "./hooks/useSshGroupsQuery";
import type { SshGroup } from "./types/sshGroup.types";

export default function ServerGroupsScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsive();
  const [selectedGroup, setSelectedGroup] = useState<SshGroup | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { data: groups = [], isLoading, refetch } = useSshGroupsQuery();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <AppbarBack Title={t("setting.serverGroups")} />

      {isLoading ? (
        <Loading />
      ) : (
        <View style={[styles.content, !isMobile && styles.webContainer]}>
          <View style={styles.header}>
            <Text style={styles.title}>Server Clusters & Access</Text>
            <Text style={styles.subtitle}>
              Manage server groups, cluster permissions and member access
            </Text>
          </View>

          <FlatList
            data={groups}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={theme.colors.secondary}
              />
            }
            renderItem={({ item }) => (
              <GroupCard group={item} onPress={() => setSelectedGroup(item)} />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons
                    name="server-outline"
                    size={36}
                    color={theme.colors.grey}
                  />
                </View>
                <Text style={styles.emptyText}>No Server Groups Found</Text>
                <Text style={styles.emptySubtext}>
                  Server groups will appear here once provisioned
                </Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}

      {/* Member Details Modal */}
      <Modal
        visible={!!selectedGroup}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedGroup(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, !isMobile && styles.modalWebCard]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, paddingRight: theme.spacing.sm }}>
                <Text style={styles.modalTitle}>{selectedGroup?.name}</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedGroup?.description}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedGroup(null)}
                style={styles.closeBtn}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={theme.colors.textPrimary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <MemberList members={selectedGroup?.members || []} />
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: theme.colors.background,
  },
  webContainer: {
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    marginBottom: theme.spacing.base,
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
  listContent: {
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: theme.colors.background2,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    maxHeight: "80%",
  },
  modalWebCard: {
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.xxl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.base,
    borderBottomWidth: 0.5,
    borderBottomColor: `${theme.colors.grey}30`,
    paddingBottom: theme.spacing.md,
  },
  modalTitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  modalSubtitle: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    marginTop: theme.spacing.xs,
  },
  closeBtn: {
    padding: theme.spacing.xs,
  },
  modalBody: {
    paddingBottom: theme.spacing.lg,
  },
});
