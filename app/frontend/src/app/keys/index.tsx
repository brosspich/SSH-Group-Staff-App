import AppbarBack from "@/components/appbar/appbarback";
import Loading from "@/components/loading/loading";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import {
  KeyItem,
  KeyUploadModal,
  UploadKeyDTO,
  useKeysQuery,
  useRevokeKeyMutation,
  useUploadKeyMutation,
} from "@/features/keys";
import { useResponsive } from "@/hooks/useResponsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function KeysScreen() {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsive();
  const [modalVisible, setModalVisible] = useState(false);

  const { data: keys = [], isLoading, refetch } = useKeysQuery();
  const [refreshing, setRefreshing] = useState(false);
  const uploadMutation = useUploadKeyMutation();
  const revokeMutation = useRevokeKeyMutation();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleUploadKey = async (dto: UploadKeyDTO) => {
    try {
      await uploadMutation.mutateAsync(dto);
      setModalVisible(false);
      Alert.alert("Success", "SSH public key registered successfully");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to upload key");
    }
  };

  const handleRevokeKey = (id: string) => {
    Alert.alert(
      "Revoke SSH Key",
      "Are you sure you want to revoke this key? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Revoke",
          style: "destructive",
          onPress: async () => {
            try {
              await revokeMutation.mutateAsync(id);
            } catch (err: any) {
              Alert.alert("Error", err?.message || "Failed to revoke key");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <AppbarBack Title="SSH Key Management" />

      {isLoading ? (
        <Loading />
      ) : (
        <View style={[styles.content, !isMobile && styles.webContainer]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.sectionTitle}>Your Public Keys</Text>
              <Text style={styles.subtitle}>
                Upload SSH keys to access assigned server groups
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color="#000" />
              <Text style={styles.addBtnText}>Add Key</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={keys}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={AppColors.secondary}
              />
            }
            renderItem={({ item }) => (
              <KeyItem
                sshKey={item}
                onDelete={handleRevokeKey}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="key-outline"
                  size={48}
                  color={AppColors.grey}
                />
                <Text style={styles.emptyText}>No SSH Keys Found</Text>
                <Text style={styles.emptySubtext}>
                  Add an ed25519 or RSA public key to get started
                </Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}

      <KeyUploadModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onUpload={handleUploadKey}
      />
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
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
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: AppColors.secondary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  addBtnText: {
    fontSize: 13,
    color: "#000",
    fontFamily: AppFonts.bold,
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
  },
  emptySubtext: {
    fontSize: 13,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    textAlign: "center",
  },
});
