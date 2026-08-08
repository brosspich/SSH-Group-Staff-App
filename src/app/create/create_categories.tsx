import { renderAlertModal } from "@/components/alert/alert";
import { renderAlertDeleteModal } from "@/components/alert/alertdelete";
import AppbarBack from "@/components/appbar/appbarback";
import Loading from "@/components/loading/loading";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useResponsive } from "@/hooks/useResponsive";
import { useSystemQuery } from "@/hooks/useSystemQuery";
import { supabase } from "@/utils/supabase";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Category = {
  id: string;
  name: string;
};

export default function CreateCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [inputName, setInputName] = useState("");
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // ── Info/Error alert (no action) ──
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertBody, setAlertBody] = useState("");

  // ── Delete confirmation alert ──
  const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);
  const [deleteAlertTitle, setDeleteAlertTitle] = useState("");
  const [deleteAlertBody, setDeleteAlertBody] = useState("");
  const [deleteAction, setDeleteAction] = useState<
    (() => Promise<void>) | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { from, resolveTable, system_id, ready } = useSystemQuery();

  const searchRef = useRef(search);
  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  useEffect(() => {
    if (!ready) return;
    fetchCategories();
  }, [ready]);

  // Add this useEffect in CreateCategories, after the existing fetch useEffect
  useEffect(() => {
    if (!ready) return;

    const channel = supabase
      .channel("categories-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pos_admin_data",
        },
        (payload) => {
          const record = payload.new || payload.old;
          if (record && (record as any)["system-id"] === system_id) {
            fetchCategories(false, searchRef.current);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ready, system_id]); // ← only depend on ready and system_id, not fetchCategories

  // fetchCategories
  async function fetchCategories(isRefresh = false, query = search) {
    isRefresh ? setRefreshing(true) : setLoading(true);
    let req = from("pos-categories", "*").order("id", { ascending: true });
    if (query.trim()) req = req.ilike("name", `%${query.trim()}%`);
    const { data, error } = await req;
    if (error) {
      setAlertTitle("Error");
      setAlertBody(error.message);
      setAlertVisible(true);
    } else {
      setCategories(data ?? []);
    }
    isRefresh ? setRefreshing(false) : setLoading(false);
  }

  function openAdd() {
    setEditTarget(null);
    setInputName("");
    setModalVisible(true);
  }

  function openEdit(item: Category) {
    setEditTarget(item);
    setInputName(item.name);
    setModalVisible(true);
  }

  function confirmDelete(item: Category) {
    setDeleteAlertTitle("Delete Category");
    setDeleteAlertBody(`Do you want to delete "${item.name}"?`);
    setDeleteAction(() => async () => {
      setIsDeleting(true);
      await deleteCategory(item.id);
      setIsDeleting(false);
      setDeleteAlertVisible(false);
    });
    setDeleteAlertVisible(true);
  }

  async function deleteCategory(id: string) {
    const { error } = await from("pos-categories").delete().eq("id", id);
    if (error) {
      setAlertTitle("Error");
      setAlertBody(error.message);
      setAlertVisible(true);
    } else {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  }

  // generateNextId
  async function generateNextId(): Promise<string> {
    const { data, error } = await from("pos-categories", "id")
      .order("id", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return "POS-0000-0001";
    const parts = (data.id as string).split("-");
    let major = parseInt(parts[1], 10);
    let minor = parseInt(parts[2], 10);
    minor += 1;
    if (minor > 9999) {
      minor = 1;
      major += 1;
    }
    const pad = (n: number) => String(n).padStart(4, "0");
    return `POS-${pad(major)}-${pad(minor)}`;
  }

  async function saveCategory() {
    if (!inputName.trim()) {
      setAlertTitle("Validation");
      setAlertBody("Category name is required.");
      setAlertVisible(true);
      return;
    }
    setSaving(true);

    if (editTarget) {
      const { error } = await from("pos-categories")
        .update({ name: inputName.trim() })
        .eq("id", editTarget.id);

      if (error) {
        setAlertTitle("Error");
        setAlertBody(error.message);
        setAlertVisible(true);
      } else {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editTarget.id ? { ...c, name: inputName.trim() } : c,
          ),
        );
        setModalVisible(false);
      }
    } else {
      const nextId = await generateNextId();
      const { data, error } = await from("pos-categories")
        .insert({ id: nextId, name: inputName.trim() })
        .select()
        .single();

      if (error) {
        setAlertTitle("Error");
        setAlertBody(error.message);
        setAlertVisible(true);
      } else {
        setCategories((prev) => [...prev, data]);
        setModalVisible(false);
      }
    }
    setSaving(false);
  }

  const { isMobile } = useResponsive();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.background2 }}>
      <View style={styles.container}>
        <AppbarBack Title="Categories" />

        <View style={{ flex: 1, width: "100%" }}>
          <View
            style={[
              { flex: 1, width: "100%" },
              !isMobile && { maxWidth: "85%", alignSelf: "center" },
            ]}
          >
            <View style={styles.searchInputContainer}>
              <TextInput
                placeholder="Search categories…"
                placeholderTextColor={AppColors.grey}
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
                onSubmitEditing={() => fetchCategories(false, search)}
              />
              {!isMobile && (
                <TouchableOpacity
                  style={styles.refreshBtn}
                  onPress={() => fetchCategories(true, searchRef.current)}
                >
                  <MaterialIcons
                    name="refresh"
                    size={23}
                    color={AppColors.secondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {loading ? (
              <Loading />
            ) : (
              <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No categories yet.</Text>
                }
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => fetchCategories(true, searchRef.current)}
                    tintColor={AppColors.secondary}
                    colors={[AppColors.secondary]}
                    progressBackgroundColor={AppColors.background}
                  />
                }
                renderItem={({ item }) => (
                  <View style={styles.card}>
                    <View style={styles.dot} />
                    <View style={styles.cardText}>
                      <Text style={styles.cardName}>{item.name}</Text>
                      <Text style={styles.cardId}>{item.id}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => openEdit(item)}
                    >
                      <MaterialIcons
                        name="edit"
                        size={16}
                        color={AppColors.background2}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => confirmDelete(item)}
                    >
                      <MaterialIcons
                        name="delete"
                        size={16}
                        color={AppColors.background2}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View
            style={[
              {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                paddingHorizontal: 12,
              },
              !isMobile && {
                maxWidth: "85%",
                alignSelf: "center",
              },
            ]}
          >
            <Text style={styles.txtTotal}>
              Total : {categories.length}{" "}
              {categories.length > 1 ? "Categories" : "Categories"}
            </Text>
            <TouchableOpacity style={styles.addButton} onPress={openAdd}>
              <Text style={styles.addButtonText}>Add Category</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal: Add / Edit */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalBox,
                {
                  maxWidth: !isMobile ? 400 : "94%",
                  width: !isMobile ? 400 : "94%",
                },
              ]}
            >
              <Text style={styles.modalTitle}>
                {editTarget ? "Edit Category" : "Add Category"}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Category name"
                placeholderTextColor={AppColors.grey}
                value={inputName}
                onChangeText={setInputName}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={saveCategory}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color={AppColors.background2} />
                  ) : (
                    <Text style={styles.saveText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Info / Error Alert */}
        {renderAlertModal({
          isMobile,
          alertModalVisible: alertVisible,
          setAlertModalVisible: setAlertVisible,
          title: alertTitle,
          bodyTxt: alertBody,
        })}

        {/* Delete Confirmation Alert */}
        {renderAlertDeleteModal({
          alertModalVisible: deleteAlertVisible,
          setAlertModalVisible: setDeleteAlertVisible,
          title: deleteAlertTitle,
          bodyTxt: deleteAlertBody,
          deleteAction,
          isDeleting,
          isMobile,
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: AppColors.secondary,
    backgroundColor: AppColors.background2,
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  refreshBtn: {
    backgroundColor: AppColors.background2,
    borderWidth: 1.5,
    borderColor: AppColors.secondary,
    padding: 9,
    borderRadius: 9,
    fontSize: 14,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  list: {
    // padding: 12,
    paddingHorizontal: 12,
    gap: 12,
    paddingBottom: 100,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.background2,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.secondary,
  },
  cardText: {
    flex: 1,
  },
  cardName: {
    color: AppColors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  cardId: {
    color: AppColors.grey,
    fontSize: 12,
    marginTop: 2,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  editBtn: {
    backgroundColor: AppColors.secondary,
    padding: 8,
    borderRadius: 8,
  },
  deleteBtn: {
    backgroundColor: AppColors.red,
    padding: 8,
    borderRadius: 8,
  },
  emptyText: {
    color: AppColors.grey,
    textAlign: "center",
    marginTop: 60,
    fontSize: 15,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    backgroundColor: AppColors.background2,
    borderTopWidth: 0.5,
    borderTopColor: AppColors.grey,
  },
  txtTotal: {
    fontWeight: "bold",
    color: AppColors.textPrimary,
    fontSize: 14,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  addButton: {
    backgroundColor: AppColors.secondary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignItems: "center",
  },
  addButtonText: {
    color: AppColors.background2,
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    // padding: 16,
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: AppColors.background2,
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  modalTitle: {
    color: AppColors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  input: {
    backgroundColor: `${AppColors.grey}50`,
    color: AppColors.textPrimary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: AppColors.background2,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: AppColors.secondary,
  },
  cancelText: {
    color: AppColors.secondary,
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: AppColors.secondary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    color: AppColors.background2,
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
