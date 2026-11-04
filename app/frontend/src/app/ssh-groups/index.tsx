import AppbarBack from "@/shared/components/appbar/appbarback";
import Loading from "@/shared/components/loading/loading";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import {
  GroupCard,
  MemberList,
  SshGroup,
  useSshGroupsQuery,
} from "@/features/ssh-groups";
import { useResponsive } from "@/hooks/useResponsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
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

export default function SshGroupsScreen() {
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
      <AppbarBack Title="SSH Server Groups" />

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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={AppColors.secondary}
              />
            }
            renderItem={({ item }) => (
              <GroupCard
                group={item}
                onPress={() => setSelectedGroup(item)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="server-outline"
                  size={48}
                  color={AppColors.grey}
                />
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
              <View>
                <Text style={styles.modalTitle}>{selectedGroup?.name}</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedGroup?.description}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedGroup(null)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={22} color={AppColors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <MemberList
                members={selectedGroup?.members || []}
              />
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
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  subtitle: {
    fontSize: 12,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },
  listContent: {
    paddingBottom: 40,
    gap: 12,
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
    includeFontPadding: false,
  },
  emptySubtext: {
    fontSize: 13,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: AppColors.background2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalWebCard: {
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
    borderRadius: 20,
    marginBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: `${AppColors.grey}30`,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  modalSubtitle: {
    fontSize: 12,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    paddingBottom: 20,
  },
});
