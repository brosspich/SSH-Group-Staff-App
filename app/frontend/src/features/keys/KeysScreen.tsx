import { useLanguage } from "@/features/language";
import AppbarBack from "@/shared/components/appbar/appbarback";
import Loading from "@/shared/components/loading/loading";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
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
import { KeyItem } from "./components/KeyItem";
import { KeyUploadModal } from "./components/KeyUploadModal";
import {
  useKeysQuery,
  useRevokeKeyMutation,
  useUploadKeyMutation,
} from "./hooks/useKeysQuery";
import type { UploadKeyDTO } from "./types/key.types";

export default function KeysScreen() {
  const { t } = useLanguage();
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
      ],
    );
  };

  return (
    <View style={styles.container}>
      <AppbarBack Title={t("setting.keys")} />

      {isLoading ? (
        <Loading />
      ) : (
        <View style={[styles.content, !isMobile && styles.webContainer]}>
          <View style={styles.header}>
            <Text style={styles.sectionTitle}>Your Public Keys</Text>
            <Text style={styles.subtitle}>
              Upload SSH keys to access assigned server groups
            </Text>
          </View>

          {/* ── Signature Full-Width Action Card: Add SSH Key ── */}
          <TouchableOpacity
            style={styles.addKeyBtnContainer}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addKeyBtn}
            >
              <View style={styles.addKeyIconCircle}>
                <Ionicons
                  name="key-outline"
                  size={24}
                  color={theme.colors.background2}
                />
              </View>
              <View style={styles.addKeyTextCol}>
                <Text style={styles.addKeyTitle}>Add SSH Public Key</Text>
                <Text style={styles.addKeySub}>
                  Upload an ed25519 or RSA public key
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={22}
                color={theme.colors.background2}
              />
            </LinearGradient>
          </TouchableOpacity>

          <FlatList
            data={keys}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={theme.colors.secondary}
              />
            }
            renderItem={({ item }) => (
              <KeyItem sshKey={item} onDelete={handleRevokeKey} />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={36}
                    color={theme.colors.grey}
                  />
                </View>
                <Text style={styles.emptyText}>No SSH Keys Found</Text>
                <Text style={styles.emptySubtext}>
                  Tap "Add SSH Public Key" above to register your public key.
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
  sectionTitle: {
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
  addKeyBtnContainer: {
    marginBottom: theme.spacing.base,
  },
  addKeyBtn: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    ...theme.shadows.sm,
    shadowColor: theme.colors.primary,
    elevation: 3,
  },
  addKeyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  addKeyTextCol: {
    flex: 1,
  },
  addKeyTitle: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.background2,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  addKeySub: {
    fontSize: theme.fontSizes.xs,
    color: "rgba(255,255,255,0.85)",
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    marginTop: 2,
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
    backgroundColor: `${theme.colors.primary}12`,
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
