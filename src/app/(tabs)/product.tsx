import { renderAlertModal } from "@/components/alert/alert";
import { renderAlertDeleteModal } from "@/components/alert/alertdelete";
import Error from "@/components/error/error";
import Loading from "@/components/loading/loading";
import { AppImages } from "@/constants/appImages";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useResponsive } from "@/hooks/useResponsive";
import { useSystemQuery } from "@/hooks/useSystemQuery";
import { supabase } from "@/utils/supabase";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { toByteArray } from "base64-js";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductStock = {
  stock_id: string;
  consume_qty: number;
  stock_name?: string;
  stock_unit?: string;
};

type StockItem = {
  id: string;
  name: string;
  qty: number;
  unit: string;
  product_stocks?: { product_id: string; consume_qty: number }[];
};

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category_id: string;
  artwork?: string | null;
  currency?: "usd" | "riel" | null;
};

type FormState = {
  name: string;
  price: string;
  stock: string;
  category_id: string;
  artwork: string;
  currency: "usd" | "riel";
};

const EMPTY_FORM: FormState = {
  name: "",
  price: "",
  stock: "",
  category_id: "",
  artwork: "",
  currency: "usd",
};

export default function Products() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [exchangeRate, setExchangeRate] = useState(4100);

  const [usdPrice, setUsdPrice] = useState("");
  const [rielPrice, setRielPrice] = useState("");

  const loadExchangeRate = async (): Promise<number> => {
    try {
      const stored = await AsyncStorage.getItem("currency_exchange_rate");
      if (stored) {
        const rateVal = parseFloat(stored);
        if (!isNaN(rateVal) && rateVal > 0) {
          setExchangeRate(rateVal);
          return rateVal;
        }
      }
    } catch (e) {
      console.warn("Failed to load exchange rate in products", e);
    }
    return exchangeRate;
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  // Category
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertBody, setAlertBody] = useState("");
  const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);
  const [deleteAction, setDeleteAction] = useState<
    (() => Promise<void>) | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Stock linking state
  const [allStocks, setAllStocks] = useState<StockItem[]>([]);
  const [productStocks, setProductStocks] = useState<ProductStock[]>([]);
  const [stockDropdownOpen, setStockDropdownOpen] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState("");
  const [consumeQtyInput, setConsumeQtyInput] = useState("1");
  const [addingLink, setAddingLink] = useState(false);
  const [removingLinkId, setRemovingLinkId] = useState<string | null>(null);

  const [allProductStocks, setAllProductStocks] = useState<
    Record<string, ProductStock[]>
  >({});

  const [pendingImageAsset, setPendingImageAsset] = useState<{
    base64: string;
    ext: string;
    mimeType: string;
    localUri: string;
  } | null>(null);

  const [uploading, setUploading] = useState(false);
  const { isMobile } = useResponsive();
  const { from, resolveTable, system_id, ready } = useSystemQuery();

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchProducts = async (query = "") => {
    setLoading(true);
    let req = from("pos-products")
      .select("id, name, price, stock, category_id, artwork, currency")
      .eq("is_active", true)
      .order("id", { ascending: false });
    if (query.trim()) req = req.ilike("name", `%${query.trim()}%`);
    const { data, error } = await req;
    if (error) setError(error.message);
    else setProducts(data ?? []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await from("pos-categories")
        .select("id, name")
        .order("id", { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) setCategories(data);
    } catch (e) {
      console.error("Error fetching categories:", e);
    }
  };

  const fetchAllStocks = async () => {
    const { data } = await from(
      "pos-stocks",
      "id, name, qty, unit, product_stocks",
    ).order("id", { ascending: true });
    setAllStocks(data ?? []);
  };

  const fetchProductStocks = async (productId: string) => {
    const { data: stocks } = await from(
      "pos-stocks",
      "id, name, unit, product_stocks",
    ).order("id", { ascending: true });
    if (!stocks) return;

    const linked: ProductStock[] = [];
    for (const s of stocks) {
      const arr: { product_id: string; consume_qty: number }[] =
        s.product_stocks ?? [];
      const match = arr.find((p) => p.product_id === productId);
      if (match) {
        linked.push({
          stock_id: s.id,
          consume_qty: match.consume_qty,
          stock_name: s.name,
          stock_unit: s.unit ?? "",
        });
      }
    }
    setProductStocks(linked);
  };

  const fetchAllProductStocks = async () => {
    const { data: stocks } = await from(
      "pos-stocks",
      "id, name, unit, product_stocks",
    ).order("id", { ascending: true });
    if (!stocks) return;

    const grouped: Record<string, ProductStock[]> = {};
    for (const s of stocks) {
      const arr: { product_id: string; consume_qty: number }[] =
        s.product_stocks ?? [];
      for (const ps of arr) {
        const enriched: ProductStock = {
          stock_id: s.id,
          consume_qty: ps.consume_qty,
          stock_name: s.name,
          stock_unit: s.unit ?? "",
        };
        if (!grouped[ps.product_id]) grouped[ps.product_id] = [];
        grouped[ps.product_id].push(enriched);
      }
    }
    setAllProductStocks(grouped);
  };

  // Step 1: fetch products, categories, stocks on ready
  useEffect(() => {
    if (!ready) return;
    supabase.auth.getSession().then(({ data }) => {
      // console.log(
      //   "SESSION:",
      //   JSON.stringify(data.session?.user?.email ?? "NO SESSION"),
      // );
    });
    Promise.resolve().then(() => {
      fetchProducts();
      fetchCategories();
      fetchAllStocks();
    });
  }, [ready]);

  // Step 2: once allStocks is loaded, fetch product-stock links
  useEffect(() => {
    if (!ready || allStocks.length === 0) return;
    Promise.resolve().then(() => {
      fetchAllProductStocks();
    });
  }, [ready, allStocks]);

  const searchRef = useRef(search);
  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  const fetchCategoriesRef = useRef(fetchCategories);
  useEffect(() => {
    fetchCategoriesRef.current = fetchCategories;
  }, [fetchCategories]);

  const fetchAllStocksRef = useRef(fetchAllStocks);
  useEffect(() => {
    fetchAllStocksRef.current = fetchAllStocks;
  }, [fetchAllStocks]);

  // ─── Realtime subscription ────────────────────────────────────────────────

  useEffect(() => {
    if (!ready) return;

    const channelName = "products-realtime";

    // 🔑 Fix: if a channel with this name is already registered on the client
    // (e.g. from a fast-refresh remount or a re-run before cleanup finished),
    // remove it first so we never call .on() on an already-subscribed channel.
    const existing = supabase
      .getChannels()
      .find((ch) => ch.topic === `realtime:${channelName}`);
    if (existing) {
      supabase.removeChannel(existing);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pos_admin_data" },
        (payload) => {
          const record = payload.new || payload.old;
          if (record && (record as any)["system-id"] === system_id) {
            fetchProducts(searchRef.current);
            fetchAllStocksRef.current();
            fetchCategoriesRef.current();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ready, system_id]);

  // ─── Open modal ───────────────────────────────────────────────────────────

  const openAdd = async () => {
    const rate = await loadExchangeRate();
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setUsdPrice("");
    setRielPrice("");
    setDropdownOpen(false);
    setStockDropdownOpen(false);
    setProductStocks([]);
    setSelectedStockId("");
    setConsumeQtyInput("1");
    setModalVisible(true);
    setPendingImageAsset(null);
    fetchCategories();
    fetchAllStocks();
  };

  const openEdit = async (product: Product) => {
    const rate = await loadExchangeRate();
    setEditingProduct(product);

    const isRiel = product.currency === "riel";
    if (isRiel) {
      setRielPrice(Math.round(product.price).toLocaleString("en-US"));
      setUsdPrice((product.price / rate).toFixed(2));
    } else {
      setUsdPrice(String(product.price));
      setRielPrice(Math.round(product.price * rate).toLocaleString("en-US"));
    }

    setForm({
      name: product.name,
      price: String(product.price),
      stock: String(product.stock),
      category_id: product.category_id,
      artwork: product.artwork ?? "",
      currency: product.currency || "usd",
    });
    setDropdownOpen(false);
    setStockDropdownOpen(false);
    setProductStocks([]);
    setSelectedStockId("");
    setConsumeQtyInput("1");
    fetchProductStocks(product.id);
    setModalVisible(true);
    setPendingImageAsset(null);
    fetchCategories();
    fetchAllStocks();
  };

  const handleUsdPriceChange = (v: string) => {
    setUsdPrice(v);
    const num = parseFloat(v) || 0;
    setRielPrice(
      num > 0 ? Math.round(num * exchangeRate).toLocaleString("en-US") : "",
    );
    setForm((f) => ({ ...f, price: v, currency: "usd" }));
  };

  const handleRielPriceChange = (v: string) => {
    setRielPrice(v);
    const clean = v.replace(/,/g, "");
    const num = parseFloat(clean) || 0;
    setUsdPrice(num > 0 ? (num / exchangeRate).toFixed(2) : "");
    setForm((f) => ({ ...f, price: clean, currency: "riel" }));
  };

  const selectCurrency = (c: "usd" | "riel") => {
    setForm((f) => ({
      ...f,
      currency: c,
      price: c === "usd" ? usdPrice : rielPrice.replace(/,/g, ""),
    }));
  };

  // ─── Stock linking ────────────────────────────────────────────────────────

  const handleAddStockLink = async () => {
    if (!selectedStockId) {
      setAlertTitle("Validation");
      setAlertBody("Please select a stock item.");
      setAlertVisible(true);
      return;
    }
    const qty = parseFloat(consumeQtyInput);
    if (isNaN(qty) || qty <= 0) {
      setAlertTitle("Validation");
      setAlertBody("Please enter a valid consume quantity.");
      setAlertVisible(true);
      return;
    }
    const duplicate = productStocks.find(
      (ps) => ps.stock_id === selectedStockId,
    );
    if (duplicate) {
      setAlertTitle("Already linked");
      setAlertBody("This stock item is already linked to this product.");
      setAlertVisible(true);
      return;
    }

    const found = allStocks.find((s) => s.id === selectedStockId);

    if (editingProduct) {
      setAddingLink(true);

      const { data: stockRow, error: fetchErr } = await from("pos-stocks")
        .select("product_stocks")
        .eq("id", selectedStockId)
        .single();

      if (fetchErr) {
        setAlertTitle("Error");
        setAlertBody(fetchErr.message);
        setAlertVisible(true);
        setAddingLink(false);
        return;
      }

      const existing: { product_id: string; consume_qty: number }[] =
        stockRow?.product_stocks ?? [];
      const updated = [
        ...existing,
        { product_id: editingProduct.id, consume_qty: qty },
      ];

      const { error: updateErr } = await from("pos-stocks")
        .update({ product_stocks: updated })
        .eq("id", selectedStockId);

      if (updateErr) {
        setAlertTitle("Error");
        setAlertBody(updateErr.message);
        setAlertVisible(true);
      } else {
        setProductStocks((prev) => [
          ...prev,
          {
            stock_id: selectedStockId,
            consume_qty: qty,
            stock_name: found?.name ?? selectedStockId,
            stock_unit: found?.unit ?? "",
          },
        ]);
        setSelectedStockId("");
        setConsumeQtyInput("1");
      }
      setAddingLink(false);
    } else {
      // New product — hold locally until save
      setProductStocks((prev) => [
        ...prev,
        {
          stock_id: selectedStockId,
          consume_qty: qty,
          stock_name: found?.name ?? selectedStockId,
          stock_unit: found?.unit ?? "",
        },
      ]);
      setSelectedStockId("");
      setConsumeQtyInput("1");
    }
  };

  const handleRemoveStockLink = async (link: ProductStock) => {
    if (!editingProduct) {
      // New product — just remove from local state
      setProductStocks((prev) =>
        prev.filter((ps) => ps.stock_id !== link.stock_id),
      );
      return;
    }

    setRemovingLinkId(link.stock_id);

    const { data: stockRow, error: fetchErr } = await from("pos-stocks")
      .select("product_stocks")
      .eq("id", link.stock_id)
      .single();

    if (fetchErr) {
      setAlertTitle("Error");
      setAlertBody(fetchErr.message);
      setAlertVisible(true);
      setRemovingLinkId(null);
      return;
    }

    const existing: { product_id: string; consume_qty: number }[] =
      stockRow?.product_stocks ?? [];
    const updated = existing.filter((p) => p.product_id !== editingProduct.id);

    const { error: updateErr } = await from("pos-stocks")
      .update({ product_stocks: updated })
      .eq("id", link.stock_id);

    if (updateErr) {
      setAlertTitle("Error");
      setAlertBody(updateErr.message);
      setAlertVisible(true);
    } else {
      setProductStocks((prev) =>
        prev.filter((ps) => ps.stock_id !== link.stock_id),
      );
    }
    setRemovingLinkId(null);
  };

  // ─── Image Picker & Upload ────────────────────────────────────────────────

  const pickAndUploadImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      const ext = asset.uri.split(".").pop()?.toLowerCase() || "jpg";
      const mimeType = ext === "png" ? "image/png" : "image/jpeg";

      if (editingProduct) {
        if (!asset.base64) throw "No base64 data returned from image picker.";
        setUploading(true);

        const {
          data: { session },
        } = await supabase.auth.getSession();
        const userId = session?.user?.id ?? "unknown";
        const safeName = (form.name.trim() || "product")
          .replace(/\s+/g, "-")
          .replace(/[^a-zA-Z0-9-_]/g, "")
          .toLowerCase();
        const fileName = `${userId}_${safeName}_${Date.now()}.${ext}`;
        const storagePath = `POS-Products/img-products/${fileName}`;
        const bytes = toByteArray(asset.base64);

        const { error } = await supabase.storage
          .from("ProductFiles")
          .upload(storagePath, bytes, { contentType: mimeType });
        if (error) throw error;

        const {
          data: { publicUrl },
        } = supabase.storage.from("ProductFiles").getPublicUrl(storagePath);

        setForm((f) => ({ ...f, artwork: publicUrl }));
        setAlertTitle("Success");
        setAlertBody("Image uploaded successfully.");
        setAlertVisible(true);
      } else {
        setPendingImageAsset({
          base64: asset.base64 ?? "",
          ext,
          mimeType,
          localUri: asset.uri,
        });
        setForm((f) => ({ ...f, artwork: asset.uri }));
      }
    } catch (e: any) {
      setAlertTitle("Upload Failed");
      setAlertBody(`Error: ${e.message || e}`);
      setAlertVisible(true);
    } finally {
      setUploading(false);
    }
  };

  // const getStoragePath = (publicUrl: string): string | null => {
  //   try {
  //     const url = new URL(publicUrl);
  //     const marker = "/ProductFiles/";
  //     const idx = url.pathname.indexOf(marker);
  //     if (idx === -1) return null;
  //     return decodeURIComponent(url.pathname.slice(idx + marker.length));
  //   } catch {
  //     return null;
  //   }
  // };

  const getStoragePath = (publicUrl: string): string | null => {
    try {
      const marker = "/object/public/ProductFiles/";
      const idx = publicUrl.indexOf(marker);
      if (idx !== -1) {
        return decodeURIComponent(publicUrl.slice(idx + marker.length));
      }
      // fallback for older URLs
      const fallback = "/ProductFiles/";
      const idx2 = publicUrl.indexOf(fallback);
      if (idx2 !== -1) {
        return decodeURIComponent(publicUrl.slice(idx2 + fallback.length));
      }
      return null;
    } catch {
      return null;
    }
  };

  // ─── Save ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.name.trim()) {
      setAlertTitle("Validation");
      setAlertBody("Name is required.");
      setAlertVisible(true);
      return;
    }
    const cleanPriceStr = form.price.replace(/,/g, "");
    if (isNaN(Number(cleanPriceStr))) {
      setAlertTitle("Validation");
      setAlertBody("Invalid price.");
      setAlertVisible(true);
      return;
    }
    if (!form.category_id.trim()) {
      setAlertTitle("Validation");
      setAlertBody("Category is required.");
      setAlertVisible(true);
      return;
    }

    setSaving(true);

    const rawPrice = parseFloat(cleanPriceStr) || 0;

    const payload = {
      name: form.name.trim(),
      price: rawPrice,
      stock: form.stock.trim() ? parseInt(form.stock) : 0,
      category_id: form.category_id.trim() || null,
      artwork: form.artwork.trim() || null,
      currency: form.currency,
    };

    if (editingProduct) {
      // ── Update existing product ──
      const { error } = await from("pos-products")
        .update(payload)
        .eq("id", editingProduct.id);
      if (error) setError(error.message);
      else {
        setModalVisible(false);
        await fetchProducts(search);
        await fetchAllProductStocks();
      }
    } else {
      // ── Insert new product ──
      let artworkUrl = form.artwork.trim() || null;
      if (pendingImageAsset) {
        try {
          setUploading(true);
          const {
            data: { session },
          } = await supabase.auth.getSession();
          const userId = session?.user?.id ?? "unknown";
          const safeName = (form.name.trim() || "product")
            .replace(/\s+/g, "-")
            .replace(/[^a-zA-Z0-9-_]/g, "")
            .toLowerCase();
          const fileName = `${userId}_${safeName}_${Date.now()}.${pendingImageAsset.ext}`;
          const storagePath = `POS-Products/img-products/${fileName}`;
          const bytes = toByteArray(pendingImageAsset.base64);

          const { error: uploadError } = await supabase.storage
            .from("ProductFiles")
            .upload(storagePath, bytes, {
              contentType: pendingImageAsset.mimeType,
            });

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("ProductFiles").getPublicUrl(storagePath);

          artworkUrl = publicUrl;
        } catch (e: any) {
          setAlertTitle("Upload Failed");
          setAlertBody(`Image upload failed: ${e.message || e}`);
          setAlertVisible(true);
          setSaving(false);
          setUploading(false);
          return;
        } finally {
          setUploading(false);
          setPendingImageAsset(null);
        }
      }

      const { data: newProduct, error } = await from("pos-products")
        .insert({ ...payload, artwork: artworkUrl })
        .select()
        .single();

      if (error) {
        setError(error.message);
      } else {
        // ✅ Save pending stock links for the new product (JSONB on pos-stocks)
        for (const ps of productStocks) {
          const { data: stockRow } = await from("pos-stocks")
            .select("product_stocks")
            .eq("id", ps.stock_id)
            .single();

          const existing: { product_id: string; consume_qty: number }[] =
            stockRow?.product_stocks ?? [];

          await from("pos-stocks")
            .update({
              product_stocks: [
                ...existing,
                { product_id: newProduct.id, consume_qty: ps.consume_qty },
              ],
            })
            .eq("id", ps.stock_id);
        }

        setModalVisible(false);
        await fetchProducts(search);
        await fetchAllProductStocks();
      }
    }

    setSaving(false);
  };

  // ─── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = (product: Product) => {
    setDeleteAction(() => async () => {
      setIsDeleting(true);

      // 1. Remove product from product_stocks JSONB on all stock rows
      const { data: allStockRows } =
        await from("pos-stocks").select("id, product_stocks");

      if (allStockRows) {
        for (const s of allStockRows) {
          const arr: { product_id: string; consume_qty: number }[] =
            s.product_stocks ?? [];
          if (arr.some((p) => p.product_id === product.id)) {
            await from("pos-stocks")
              .update({
                product_stocks: arr.filter((p) => p.product_id !== product.id),
              })
              .eq("id", s.id);
          }
        }
      }

      // 2. Delete product row from DB
      const { error } = await from("pos-products")
        .delete()
        .eq("id", product.id);

      if (error) {
        setAlertTitle("Error");
        setAlertBody(error.message);
        setAlertVisible(true);
        setIsDeleting(false);
        setDeleteAction(null);
        return;
      }

      // 3. DB deleted — now delete storage image
      if (product.artwork) {
        const storagePath = getStoragePath(product.artwork);
        console.log("[DELETE] storagePath:", storagePath);
        if (storagePath) {
          const { error: storageErr } = await supabase.storage
            .from("ProductFiles")
            .remove([storagePath]);
          if (storageErr) {
            console.warn("[DELETE] Storage error:", storageErr.message);
          }
        }
      }

      fetchProducts(search);
      fetchAllProductStocks();
      setDeleteAlertVisible(false);
      setAlertTitle("Success");
      setAlertBody("Product deleted successfully.");
      setAlertVisible(true);

      setIsDeleting(false);
      setDeleteAction(null);
    });

    setAlertTitle("Delete");
    setAlertBody(`Delete "${product.name}"?`);
    setDeleteAlertVisible(true);
  };

  const handleRetry = () => fetchProducts(search);

  // ─── Render item ──────────────────────────────────────────────────────────

  const renderItem = ({ item, index }: { item: Product; index: number }) => {
    const linkedStocks = allProductStocks[item.id] ?? [];
    const isRightItem = index % 2 === 1;

    return (
      <View
        style={[
          styles.card,
          !isMobile && {
            flex: 1,
            marginLeft: isRightItem ? 6 : 12,
            marginRight: isRightItem ? 12 : 6,
          },
        ]}
      >
        <View style={styles.conCard}>
          <View style={styles.artworkTxt}>
            <View style={styles.conArtwork}>
              <View style={styles.placeholderContainer}>
                <Image
                  source={AppImages.logoGrey}
                  style={{ width: 35, height: 35 }}
                />
              </View>
              {item.artwork && (
                <Image
                  source={{ uri: item.artwork }}
                  style={styles.listThumbnail}
                  resizeMode="cover"
                />
              )}
            </View>

            <View style={styles.txtCon}>
              <Text style={styles.cardName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.cardSub, { marginBottom: 0 }]}>
                ID: {item.id}
              </Text>
              <Text style={styles.cardSub} numberOfLines={1}>
                Category:{" "}
                {categories.find((c) => c.id === item.category_id)?.name ||
                  item.category_id}
              </Text>
            </View>
          </View>

          <View style={styles.cardInfo}>
            <View style={styles.cardRow}>
              <View style={styles.cardBadge}>
                {item.currency === "riel" ? (
                  <Text style={styles.cardBadgeIconRiel}>៛</Text>
                ) : (
                  <FontAwesome6
                    name="dollar-sign"
                    size={12}
                    color="#555"
                    style={styles.cardBadgeIcon}
                  />
                )}
                <Text style={styles.cardBadgeText}>
                  {item.currency === "riel"
                    ? Math.round(item.price).toLocaleString("en-US")
                    : item.price.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* ✅ Linked stock chips */}
            {linkedStocks.length > 0 && (
              <View style={styles.linkedChipsRow}>
                {linkedStocks.map((ps) => (
                  <View key={ps.stock_id} style={styles.linkedChip}>
                    <MaterialIcons
                      name="inventory-2"
                      size={10}
                      color={AppColors.secondary}
                    />
                    <Text style={styles.linkedChipText} numberOfLines={1}>
                      {ps.stock_name} × {ps.consume_qty}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => openEdit(item)}
          >
            <MaterialIcons
              name="edit"
              size={20}
              color={AppColors.background2}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item)}
          >
            <MaterialIcons name="delete" size={20} color={AppColors.red} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (error && !loading) {
    return (
      <Error
        title="Failed to load data"
        txtError={error}
        onPress={handleRetry}
      />
    );
  }

  // ─── UI ───────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchCon}>
        <TextInput
          placeholder="Search products…"
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          onSubmitEditing={() => fetchProducts(search)}
        />
        {!isMobile && (
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => (refreshing ? null : fetchProducts(search))}
          >
            <MaterialIcons
              name="refresh"
              size={23}
              color={AppColors.secondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      {loading ? (
        <Loading />
      ) : (
        <FlatList
          key={!isMobile ? "tablet-grid" : "mobile-list"}
          numColumns={isMobile ? 1 : 2}
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 70 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.empty}>No products found.</Text>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchProducts(search)}
              tintColor={AppColors.secondary}
              colors={[AppColors.secondary]}
              progressBackgroundColor={AppColors.background}
            />
          }
        />
      )}

      {/* Footer */}
      <View style={[styles.footerCon, { height: 60 }]}>
        <Text style={styles.txtTotal}>
          Total : {products.length}{" "}
          {products.length > 1 ? "Products" : "Product"}
        </Text>
        <TouchableOpacity style={styles.footerBTN} onPress={openAdd}>
          <Text style={styles.footerBTNTxt}>Add Product</Text>
        </TouchableOpacity>
      </View>

      {/* ── Add / Edit Modal ── */}
      <Modal
        visible={modalVisible}
        animationType={!isMobile ? "fade" : "slide"}
        transparent
      >
        <View
          style={[
            styles.modalOverlay,
            {
              justifyContent: !isMobile ? "center" : "flex-end",
              alignItems: !isMobile ? "center" : "stretch",
            },
          ]}
        >
          <View
            style={[
              styles.modalBox,
              {
                maxHeight: !isMobile ? "80%" : "87%",
                height: !isMobile ? "80%" : "87%",
                maxWidth: !isMobile ? 450 : "100%",
                width: !isMobile ? 450 : "100%",
                borderBottomLeftRadius: !isMobile ? 20 : 0,
                borderBottomRightRadius: !isMobile ? 20 : 0,
              },
              isMobile && { paddingBottom: insets.bottom },
            ]}
          >
            <Text style={styles.modalTitle}>
              {editingProduct ? "Edit Product" : "New Product"}
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{
                maxHeight: isMobile ? "90%" : "78%",
                paddingHorizontal: 16,
              }}
              keyboardShouldPersistTaps="handled"
            >
              {/* Name */}
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                placeholder="Product name"
              />

              {/* Price - dual currency input */}
              <Text style={styles.label}>Price *</Text>
              <Text style={styles.stockSectionHint}>
                Type in either field, then tap its label to choose it as the
                saved price. Rate: $1 = {exchangeRate.toLocaleString("en-US")}៛
              </Text>
              <View style={styles.currencyContainer}>
                <View style={{ flex: 1 }}>
                  <TouchableOpacity
                    onPress={() => selectCurrency("usd")}
                    activeOpacity={0.6}
                  >
                    <Text
                      style={[
                        styles.label,
                        form.currency === "usd" && {
                          color: AppColors.secondary,
                        },
                      ]}
                    >
                      USD ($) {form.currency === "usd" ? "●" : "○"}
                    </Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[
                      styles.input,
                      form.currency === "usd" && {
                        borderColor: AppColors.secondary,
                      },
                    ]}
                    value={usdPrice}
                    onChangeText={handleUsdPriceChange}
                    onFocus={() => selectCurrency("usd")}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TouchableOpacity
                    onPress={() => selectCurrency("riel")}
                    activeOpacity={0.6}
                  >
                    <Text
                      style={[
                        styles.label,
                        form.currency === "riel" && {
                          color: AppColors.secondary,
                        },
                      ]}
                    >
                      Riel (៛) {form.currency === "riel" ? "●" : "○"}
                    </Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[
                      styles.input,
                      form.currency === "riel" && {
                        borderColor: AppColors.secondary,
                      },
                    ]}
                    value={rielPrice}
                    onChangeText={handleRielPriceChange}
                    onFocus={() => selectCurrency("riel")}
                    placeholder="0"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              {/* Category */}
              <Text style={styles.label}>Category *</Text>
              <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={() => {
                  setDropdownOpen(!dropdownOpen);
                  setStockDropdownOpen(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={
                    form.category_id
                      ? styles.dropdownSelectedText
                      : styles.dropdownPlaceholderText
                  }
                >
                  {categories.find((c) => c.id === form.category_id)?.name ||
                    "Select Category"}
                </Text>
                <MaterialIcons
                  name={
                    dropdownOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"
                  }
                  size={20}
                  color="#555"
                />
              </TouchableOpacity>

              {dropdownOpen && (
                <View style={styles.dropdownList}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.dropdownItem,
                        form.category_id === cat.id &&
                          styles.dropdownItemActive,
                      ]}
                      onPress={() => {
                        setForm((f) => ({ ...f, category_id: cat.id }));
                        setDropdownOpen(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <View>
                        <Text
                          style={[
                            styles.dropdownItemText,
                            form.category_id === cat.id &&
                              styles.dropdownItemTextActive,
                          ]}
                        >
                          {cat.name}
                        </Text>
                        <Text style={styles.dropdownItemIdText}>{cat.id}</Text>
                      </View>
                      {form.category_id === cat.id && (
                        <MaterialIcons
                          name="check"
                          size={18}
                          color={AppColors.secondary}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Product Image */}
              <Text style={styles.label}>Product Image</Text>
              <View style={styles.imageSection}>
                {form.artwork ? (
                  <View style={styles.previewContainer}>
                    <Image
                      source={{ uri: form.artwork }}
                      style={styles.previewImage}
                    />
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => setForm((f) => ({ ...f, artwork: "" }))}
                    >
                      <MaterialIcons name="close" size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.noImageContainer}>
                    <MaterialIcons name="image" size={32} color="#ccc" />
                    <Text style={styles.noImageText}>No image</Text>
                  </View>
                )}
                <View style={styles.imageActionButtons}>
                  <TouchableOpacity
                    style={styles.uploadBtn}
                    onPress={pickAndUploadImage}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <MaterialIcons
                          name="photo-library"
                          size={16}
                          color="#fff"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.uploadBtnText}>Upload Image</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Image URL */}
              <Text style={styles.label}>Or Image URL</Text>
              <TextInput
                style={styles.input}
                value={form.artwork}
                onChangeText={(v) => setForm((f) => ({ ...f, artwork: v }))}
                placeholder="https://example.com/image.jpg"
                autoCapitalize="none"
                keyboardType="url"
              />

              {/* ── Linked Stocks ─────────────────────────────────────── */}
              <View style={styles.stockSectionDivider} />
              <Text style={styles.label}>Linked Stocks</Text>
              <Text style={styles.stockSectionHint}>
                When this product is sold, these stock items will be deducted.
              </Text>

              {/* Existing linked items */}
              {productStocks.length > 0 && (
                <View style={styles.linkedStocksList}>
                  {productStocks.map((ps) => (
                    <View key={ps.stock_id} style={styles.linkedStockRow}>
                      <View style={styles.linkedStockDot} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.linkedStockName}>
                          {ps.stock_name}
                        </Text>
                        <Text style={styles.linkedStockQty}>
                          consume: {ps.consume_qty} {ps.stock_unit}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemoveStockLink(ps)}
                        disabled={removingLinkId === ps.stock_id}
                        style={styles.linkedStockRemove}
                      >
                        {removingLinkId === ps.stock_id ? (
                          <ActivityIndicator size={14} color={AppColors.red} />
                        ) : (
                          <MaterialIcons
                            name="close"
                            size={16}
                            color={AppColors.red}
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Add new stock link row */}
              <View style={styles.stockLinkAdd}>
                <TouchableOpacity
                  style={styles.stockPickerTrigger}
                  onPress={() => {
                    setStockDropdownOpen(!stockDropdownOpen);
                    setDropdownOpen(false);
                  }}
                >
                  <Text
                    style={
                      selectedStockId
                        ? styles.dropdownSelectedText
                        : styles.dropdownPlaceholderText
                    }
                    numberOfLines={1}
                  >
                    {allStocks.find((s) => s.id === selectedStockId)?.name ??
                      "Select stock"}
                  </Text>
                  <MaterialIcons
                    name={
                      stockDropdownOpen
                        ? "keyboard-arrow-up"
                        : "keyboard-arrow-down"
                    }
                    size={18}
                    color="#555"
                  />
                </TouchableOpacity>

                <TextInput
                  style={styles.stockQtyInput}
                  value={consumeQtyInput}
                  onChangeText={setConsumeQtyInput}
                  keyboardType="numeric"
                  placeholder="Qty"
                  placeholderTextColor={AppColors.grey}
                />

                <TouchableOpacity
                  style={styles.stockLinkAddBtn}
                  onPress={handleAddStockLink}
                  disabled={addingLink}
                >
                  {addingLink ? (
                    <ActivityIndicator size={16} color="#fff" />
                  ) : (
                    <MaterialIcons name="add" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Stock dropdown list */}
              {stockDropdownOpen && (
                <View style={[styles.dropdownList, { marginTop: 4 }]}>
                  {allStocks.length === 0 ? (
                    <View style={styles.dropdownItem}>
                      <Text style={styles.dropdownPlaceholderText}>
                        No stock items found
                      </Text>
                    </View>
                  ) : (
                    allStocks.map((s) => (
                      <TouchableOpacity
                        key={s.id}
                        style={[
                          styles.dropdownItem,
                          selectedStockId === s.id && styles.dropdownItemActive,
                        ]}
                        onPress={() => {
                          setSelectedStockId(s.id);
                          setStockDropdownOpen(false);
                        }}
                      >
                        <View>
                          <Text
                            style={[
                              styles.dropdownItemText,
                              selectedStockId === s.id &&
                                styles.dropdownItemTextActive,
                            ]}
                          >
                            {s.name}
                          </Text>
                          <Text style={styles.dropdownItemIdText}>
                            {s.id} · {s.qty} {s.unit} remaining
                          </Text>
                        </View>
                        {selectedStockId === s.id && (
                          <MaterialIcons
                            name="check"
                            size={18}
                            color={AppColors.secondary}
                          />
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}

              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Modal action buttons */}
            <View style={[styles.modalActions]}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={AppColors.background2} />
                ) : (
                  <Text style={styles.saveBtnTxt}>
                    {editingProduct ? "Update" : "Add"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {renderAlertModal({
        isMobile: isMobile,
        alertModalVisible: alertVisible,
        setAlertModalVisible: setAlertVisible,
        title: alertTitle,
        bodyTxt: alertBody,
        onPress: () => setAlertVisible(false),
      })}

      {renderAlertDeleteModal({
        alertModalVisible: deleteAlertVisible,
        setAlertModalVisible: setDeleteAlertVisible,
        title: alertTitle,
        bodyTxt: alertBody,
        deleteAction,
        isDeleting,
        isMobile,
      })}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },

  searchCon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    borderWidth: 1.5,
    borderColor: AppColors.secondary,
    backgroundColor: "#fff",
    borderRadius: 10,
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

  card: {
    flexDirection: "row",
    backgroundColor: AppColors.background2,
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 12,
    padding: 10,
    ...Platform.select({
      web: { boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)" },
      default: {
        shadowColor: AppColors.textPrimary,
        shadowOpacity: 0.06,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
    }),
  },
  conCard: { flex: 1, gap: 5 },
  cardInfo: { flex: 1, marginTop: 5 },
  txtCon: { flex: 1 },
  cardName: {
    fontSize: 15,
    fontWeight: "600",
    color: AppColors.textPrimary,
    marginBottom: 2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  cardSub: {
    fontSize: 11,
    color: AppColors.grey,
    marginBottom: 6,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  cardRow: { flexDirection: "row", gap: 8 },
  cardBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  cardBadgeIcon: {
    backgroundColor: AppColors.grey,
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 4,
  },
  cardBadgeIconRiel: {
    backgroundColor: AppColors.grey,
    color: "#555",
    fontSize: 15,
    fontWeight: "700",
    paddingHorizontal: 5,
    paddingVertical: 0,
    borderRadius: 4,
    textAlign: "center",
    minWidth: 18,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  cardBadgeText: {
    fontSize: 12,
    color: "#555",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  lowStock: { backgroundColor: "#fff0f0", color: AppColors.red },
  linkedChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 7,
  },
  linkedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${AppColors.secondary}15`,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: `${AppColors.secondary}30`,
  },
  linkedChipText: {
    fontSize: 10,
    color: AppColors.secondary,
    fontWeight: "600",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  cardActions: { justifyContent: "center", gap: 10, marginLeft: 5 },
  editBtn: {
    backgroundColor: AppColors.secondary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  editBtnTxt: {
    color: AppColors.background2,
    fontWeight: "600",
    fontSize: 12,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  deleteBtn: {
    backgroundColor: "#ffeaea",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  deleteBtnTxt: {
    color: AppColors.red,
    fontWeight: "600",
    fontSize: 12,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  empty: {
    textAlign: "center",
    marginTop: 60,
    color: AppColors.grey,
    fontSize: 15,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },

  footerCon: {
    position: "absolute",
    bottom: 0,
    left: 0,
    backgroundColor: AppColors.background2,
    height: 60,
    width: "100%",
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: `${AppColors.grey}33`,
  },
  txtTotal: {
    fontWeight: "bold",
    color: AppColors.textPrimary,
    fontSize: 14,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  footerBTN: {
    backgroundColor: AppColors.secondary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  footerBTNTxt: {
    color: AppColors.background2,
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: AppColors.background2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // padding: 16,
    paddingBottom: 0,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    // marginBottom: 16,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    padding: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 4,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    // margin: 8,
    borderTopWidth: 0.5,
    borderColor: AppColors.grey,
    // paddingTop: 15,
    padding: 12,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: AppColors.secondary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelBtnTxt: {
    color: AppColors.secondary,
    fontWeight: "600",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: AppColors.secondary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveBtnTxt: {
    color: AppColors.background2,
    fontWeight: "700",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },

  artworkTxt: { flexDirection: "row" },
  conArtwork: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: AppColors.background2,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
  },
  placeholderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  listThumbnail: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 2,
  },
  listThumbnailPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  imageSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
  },
  previewContainer: {
    position: "relative",
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  previewImage: { width: "100%", height: "100%", resizeMode: "cover" },
  removeImageBtn: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 8,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  noImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  noImageText: {
    fontSize: 9,
    color: "#999",
    marginTop: 2,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  imageActionButtons: { flex: 1 },
  uploadBtn: {
    backgroundColor: AppColors.secondary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },

  dropdownTrigger: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: AppColors.background2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownSelectedText: {
    color: AppColors.textPrimary,
    fontSize: 15,
    fontWeight: "500",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  dropdownPlaceholderText: {
    color: "#999",
    fontSize: 15,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  dropdownList: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    backgroundColor: AppColors.background2,
    marginBottom: 12,
    overflow: "hidden",
    marginTop: -8,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownItemActive: { backgroundColor: `${AppColors.secondary}11` },
  dropdownItemText: {
    fontSize: 14,
    color: AppColors.textPrimary,
    fontWeight: "500",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  dropdownItemTextActive: {
    color: AppColors.secondary,
    fontWeight: "600",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  dropdownItemIdText: {
    fontSize: 11,
    color: AppColors.grey,
    marginTop: 2,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },

  // ── Linked Stocks ──
  stockSectionDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginBottom: 14,
    marginTop: 4,
  },
  stockSectionHint: {
    fontSize: 11,
    color: AppColors.grey,
    marginBottom: 10,
    marginTop: -2,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  linkedStocksList: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  linkedStockRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 10,
    backgroundColor: AppColors.background2,
  },
  linkedStockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.secondary,
  },
  linkedStockName: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  linkedStockQty: {
    fontSize: 11,
    color: AppColors.grey,
    marginTop: 1,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  linkedStockRemove: { padding: 4 },
  stockLinkAdd: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  stockPickerTrigger: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: AppColors.background2,
  },
  stockQtyInput: {
    width: 55,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 14,
    textAlign: "center",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  stockLinkAddBtn: {
    backgroundColor: AppColors.secondary,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  currencyContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  currencyButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.background2,
  },
  currencyButtonActive: {
    borderColor: AppColors.secondary,
    backgroundColor: `${AppColors.secondary}11`,
  },
  currencyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
