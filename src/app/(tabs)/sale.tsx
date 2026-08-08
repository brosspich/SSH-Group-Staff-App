/* eslint-disable import/no-unresolved */
// sale.tsx
import Loading from "@/components/loading/loading";
import { AppColors } from "@/constants/appcolors";
import { usePrinter } from "@/hooks/usePrinter";
import { MaterialIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { renderAlertModal } from "@/components/alert/alert";
import { RenderCartModal } from "@/components/sale/renderCartModal";
import { RenderCheckoutModal } from "@/components/sale/renderCheckoutModal";
import { RenderPrintModal } from "@/components/sale/renderPrintModal";
import { RenderProductCard } from "@/components/sale/renderProductCard";
import { RenderCartSlide } from "@/components/sale/slideCart";
import {
  CartItem,
  Category,
  Customer,
  OrderData,
  Product,
} from "@/components/sale/types";
import { useResponsive } from "@/hooks/useResponsive";
import { useSystemQuery } from "@/hooks/useSystemQuery";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { styles } from "../../styles/auth.styles";

export default function Sale() {
  const router = useRouter();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("All");
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartModalVisible, setCartModalVisible] = useState(false);

  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [cashDolla, setCashDolla] = useState("");
  const [cashRiel, setCashRiel] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "cash" | "khqr"
  >("cash");

  const [numPaper, setNumPaper] = useState("1");
  const [printModalVisible, setPrintModalVisible] = useState(false);
  const [lastOrder, setLastOrder] = useState<OrderData | null>(null);

  const [discountPercent, setDiscountPercent] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");

  const handleDiscountPercentChange = (val: string) => {
    if (!val || isNaN(Number(val))) {
      setDiscountPercent("");
      setDiscountAmount("");
      return;
    }
    const percent = parseFloat(val);
    setDiscountPercent(val);
    const amount = cartTotal * (percent / 100);
    setDiscountAmount(amount.toFixed(2));
  };

  const handleDiscountAmountChange = (val: string) => {
    if (!val || isNaN(Number(val))) {
      setDiscountPercent("");
      setDiscountAmount("");
      return;
    }
    const amount = parseFloat(val);
    setDiscountAmount(val);
    if (cartTotal > 0) {
      const percent = (amount / cartTotal) * 100;
      setDiscountPercent(percent.toFixed(1));
    } else {
      setDiscountPercent("0");
    }
  };

  const [cardAreaWidth, setCardAreaWidth] = useState(0);
  const { isMobile, width } = useResponsive();
  // const numCols = !isMobile ? 4 : 2;
  // const rightPanelWidth = !isMobile ? 230 : 0;
  // const CARD_GAP = 10;
  // const CARD_WIDTH =
  //   cardAreaWidth > 0
  //     ? (cardAreaWidth - 24 - CARD_GAP * (numCols - 1)) / numCols
  //     : 0;
  const numCols = !isMobile ? 5 : 2;
  const rightPanelWidth = !isMobile ? 230 : 0;
  const CARD_GAP = 10;
  const CARD_PADDING = 12; // match your styles.conCard horizontal padding
  const CARD_WIDTH =
    cardAreaWidth > 0
      ? (cardAreaWidth - CARD_PADDING * 2 - CARD_GAP * (numCols - 1)) / numCols
      : 0;

  const [alertOnPress, setAlertOnPress] = useState<(() => void) | undefined>(
    undefined,
  );

  const {
    printers,
    selectedPrinter,
    setSelectedPrinter,
    isDiscovering,
    isPrinting,
    printReceipt,
    testPrint,
    refreshPrinters,
    alertVisible,
    setAlertVisible,
    alertTitle,
    setAlertTitle,
    alertBody,
    setAlertBody,
  } = usePrinter();

  // ── Derived ─────────────────────────────────────────────────────────────────

  const [exchangeRate, setExchangeRate] = useState(4000);

  const getPriceUSD = (product: Product) =>
    product.currency === "riel" ? product.price / exchangeRate : product.price;

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, i) => sum + getPriceUSD(i.product) * i.quantity,
    0,
  );
  const isInCart = (productId: string) =>
    cartItems.some((i) => i.product.id === productId);
  const getCartQty = (productId: string) =>
    cartItems.find((i) => i.product.id === productId)?.quantity ?? 0;

  const discountAmountVal = parseFloat(discountAmount) || 0;
  const discountPercentVal = parseFloat(discountPercent) || 0;
  const finalTotalUSD = Math.max(0, cartTotal - discountAmountVal);

  const paidUSD = parseFloat(cashDolla) || 0;
  const paidKHR = parseFloat(cashRiel) || 0;
  const paidTotalUSD = paidUSD + paidKHR / exchangeRate;
  const changeUSD = Math.max(0, paidTotalUSD - finalTotalUSD);
  const changeKHR = Math.round(changeUSD * exchangeRate);

  const [cashCurrency, setCashCurrency] = useState<"USD" | "KHR">("USD");

  const { from, resolveTable, ready } = useSystemQuery();

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const fetchCategories = async () => {
    try {
      const { data, error } = await from("pos-categories", "id, name").order(
        "id",
        { ascending: true },
      );
      if (error) throw error;
      setCategories((data as Category[]) || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = from(
        "pos-products",
        "id, name, price, currency, category_id, artwork",
      ).order("id", { ascending: false });
      if (selectedCategoryId !== "All")
        query = query.eq("category_id", selectedCategoryId);
      const { data, error } = await query;
      if (error) throw error;
      setProducts((data as Product[]) || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setAlertTitle("Error");
      setAlertBody("Failed to load products");
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadExchangeRate = async () => {
        try {
          const stored = await AsyncStorage.getItem("currency_exchange_rate");
          if (stored) {
            const rate = parseFloat(stored);
            if (!isNaN(rate) && rate > 0) {
              setExchangeRate(rate);
            }
          }
        } catch (e) {
          console.warn("Failed to load exchange rate", e);
        }
      };
      loadExchangeRate();
    }, []),
  );

  // ── Cart ─────────────────────────────────────────────────────────────────────

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing)
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCartItems((prev) => {
      const item = prev.find((i) => i.product.id === productId);
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) return prev.filter((i) => i.product.id !== productId);
      return prev.map((i) =>
        i.product.id === productId ? { ...i, quantity: newQty } : i,
      );
    });
  };

  const removeFromCart = (productId: string) =>
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));

  const clearCart = () => {
    setAlertTitle("Clear Cart");
    setAlertBody("Remove all items?");
    setAlertOnPress(() => {
      setCartItems([]);
    });
    setAlertVisible(false);
  };

  // ── Checkout ─────────────────────────────────────────────────────────────────

  const openCheckout = () => {
    if (cartItems.length === 0) {
      setAlertTitle("Empty Cart");
      setAlertBody("Add at least one product before checking out.");
      setAlertVisible(true);
      return;
    }
    setCartModalVisible(false);
    setSelectedCustomer(null);
    setCashDolla("");
    setCashRiel("");
    setDiscountPercent("");
    setDiscountAmount("");
    setSelectedPaymentMethod("cash");
    setCheckoutModalVisible(true);
  };

  const handleConfirmOrder = async () => {
    try {
      setCheckoutLoading(true);

      const { data: lastOrderRow } = await from("pos-orders")
        .select("id")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      let nextNum = 1;
      if (lastOrderRow?.id) {
        const parts = lastOrderRow.id.split("-");
        if (parts.length >= 3) {
          const p1 = parseInt(parts[parts.length - 2], 10);
          const p2 = parseInt(parts[parts.length - 1], 10);
          if (!isNaN(p1) && !isNaN(p2)) {
            nextNum = p1 * 10000 + p2 + 1;
          } else {
            const lastNum = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(lastNum)) nextNum = lastNum + 1;
          }
        } else if (parts.length >= 2) {
          const lastNum = parseInt(parts[parts.length - 1], 10);
          if (!isNaN(lastNum)) nextNum = lastNum + 1;
        }
      }

      const major = Math.floor(nextNum / 10000);
      const minor = nextNum % 10000;
      const orderId = `ORD-${String(major).padStart(4, "0")}-${String(minor).padStart(4, "0")}`;

      const cashDollaVal =
        selectedPaymentMethod === "cash" && cashCurrency === "USD"
          ? finalTotalUSD
          : null;
      const cashRielVal =
        selectedPaymentMethod === "cash" && cashCurrency === "KHR"
          ? Math.round(finalTotalUSD * exchangeRate)
          : null;

      const orderTotalAmount =
        cashCurrency === "USD"
          ? Number(finalTotalUSD.toFixed(2))
          : Math.round(finalTotalUSD * exchangeRate);
      const orderCurrency = cashCurrency === "USD" ? "usd" : "riel";

      const { data: order, error: orderError } = await from("pos-orders")
        .insert({
          id: orderId,
          customer_id: selectedCustomer?.id || null,
          total_amount: orderTotalAmount,
          currency: orderCurrency,
          status: "completed",
          payment: selectedPaymentMethod,
          cash_dollar: cashDollaVal,
          cash_riel: cashRielVal,
          discount_percent: discountPercentVal,
          discount_amount: discountAmountVal,
          subtotal: Number(cartTotal.toFixed(2)),
          items: cartItems.map((i) => ({
            product_id: i.product.id,
            name: i.product.name,
            quantity: i.quantity,
            unit_price: getPriceUSD(i.product),
          })),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (orderError) throw orderError;
      if (!order) throw new Error("Order was not returned after insert.");

      // ✅ Deduct stock using product_stocks JSONB on pos-stocks
      // One read of all stock rows, then only write to affected ones
      const { data: allStockRows } = await from("pos-stocks").select(
        "id, qty, unit, product_stocks, stock_movements",
      );

      if (allStockRows) {
        for (const s of allStockRows) {
          const arr: { product_id: string; consume_qty: number }[] =
            s.product_stocks ?? [];

          let newQty = s.qty;
          let totalConsumed = 0;
          let changed = false;

          for (const cartItem of cartItems) {
            const match = arr.find((p) => p.product_id === cartItem.product.id);
            if (match) {
              const consumed = match.consume_qty * cartItem.quantity;
              newQty = Math.max(0, newQty - consumed);
              totalConsumed += consumed;
              changed = true;
            }
          }

          if (changed) {
            const movement = {
              id: `mv-${Date.now()}-${s.id}`,
              type: "out" as const,
              qty: totalConsumed,
              unit: s.unit ?? null,
              price: orderTotalAmount,
              currency: orderCurrency,
              source: "sale" as const,
              order_id: orderId,
              note: null,
              created_at: new Date().toISOString(),
            };
            const newMovements = [
              ...((s.stock_movements as any[]) ?? []),
              movement,
            ];

            await from("pos-stocks")
              .update({ qty: newQty, stock_movements: newMovements })
              .eq("id", s.id);
          }
        }
      }

      const savedOrder: OrderData = {
        id: order.id,
        total: finalTotalUSD,
        items: [...cartItems],
        customer: selectedCustomer || {
          id: "walk-in",
          name: "Walk-in Client",
          phone: "-",
          email: "-",
        },
        invoiceNumber: orderId,
        paymentMethod: selectedPaymentMethod,
        discountPercent: discountPercentVal,
        discountAmount: discountAmountVal,
        subtotal: cartTotal,
      };

      setLastOrder(savedOrder);
      setCartItems([]);
      setSelectedCustomer(null);
      setCheckoutModalVisible(false);
      await fetchProducts();
      setPrintModalVisible(true);
    } catch (error) {
      console.error("Checkout error:", error);
      setAlertTitle("Error");
      setAlertBody("Failed to place order. Please try again.");
      setAlertVisible(true);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // ── Print ────────────────────────────────────────────────────────────────────

  const handlePrintInvoice = async (imageUri?: string) => {
    if (!lastOrder) {
      setAlertTitle("Error");
      setAlertBody("No order data found.");
      setAlertVisible(true);
      return;
    }
    if (!selectedPrinter) {
      setAlertTitle("No Printer");
      setAlertBody("Please select a printer first.");
      setAlertVisible(true);
      return;
    }
    const success = await printReceipt(lastOrder, undefined, imageUri);
    if (success) {
      setPrintModalVisible(false);
      setAlertTitle("Success");
      setAlertBody("Printing is successful");
      setAlertVisible(true);
    }
  };

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchCategories(), fetchProducts()]);
    setRefreshing(false);
  };

  useEffect(() => {
    if (!ready) return;
    fetchCategories();
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    fetchProducts();
  }, [ready, selectedCategoryId]);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Filter row */}
      <View
        style={[
          styles.conFilter,
          !isMobile && { right: rightPanelWidth },
          { flexDirection: "row", alignItems: "center" },
        ]}
      >
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: "All", name: "All" }, ...categories]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item: cat }) => {
            const isActive = cat.id === selectedCategoryId;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategoryId(cat.id)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
        {!isMobile && (
          <TouchableOpacity
            onPress={handleRefresh}
            style={{
              height: 38,
              width: 38,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: `${AppColors.secondary}66`,
              backgroundColor: AppColors.background,
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.75}
          >
            <MaterialIcons
              name="refresh"
              size={20}
              color={AppColors.secondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={{ flex: 1, flexDirection: !isMobile ? "row" : "column" }}>
        {loading ? (
          <Loading />
        ) : (
          <View
            style={[styles.conCard, { paddingRight: !isMobile ? 10 : 0 }]}
            onLayout={(e) => setCardAreaWidth(e.nativeEvent.layout.width)}
          >
            <FlatList
              data={products}
              numColumns={numCols}
              key={!isMobile ? "tablet" : "mobile"}
              keyExtractor={(item) => item.id}
              columnWrapperStyle={
                products.length === 0 ? undefined : styles.row
              }
              contentContainerStyle={
                products.length === 0
                  ? styles.emptyListContainer
                  : styles.listContainer
              }
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={AppColors.secondary}
                  colors={[AppColors.secondary]}
                  progressBackgroundColor={AppColors.background}
                />
              }
              renderItem={({ item }) => (
                <RenderProductCard
                  item={item}
                  isInCart={isInCart}
                  getCartQty={getCartQty}
                  addToCart={addToCart}
                  removeFromCart={removeFromCart}
                  cardWidth={CARD_WIDTH}
                  isTablet={!isMobile}
                />
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyProductsContainer}>
                  <MaterialIcons
                    name="inventory-2"
                    size={60}
                    color={AppColors.grey}
                  />
                  <Text style={styles.emptyProductsText}>
                    No products found
                  </Text>
                  <Text style={styles.emptyProductsSubtext}>
                    Try adjusting your filter or refresh the page
                  </Text>
                  <TouchableOpacity
                    style={styles.refreshBtn}
                    onPress={handleRefresh}
                  >
                    <Text style={styles.refreshBtnText}>Refresh</Text>
                  </TouchableOpacity>
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {!isMobile ? (
          <View style={styles.footerTablet}>
            <RenderCartSlide
              cartItems={cartItems}
              cartCount={cartCount}
              cartTotal={cartTotal}
              exchangeRate={exchangeRate}
              onUpdateQty={updateQty}
              onRemoveFromCart={removeFromCart}
              onClearCart={clearCart}
              onCheckout={openCheckout}
              isTablet={!isMobile}
            />
          </View>
        ) : (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.confooter}
              onPress={() => setCartModalVisible(true)}
            >
              <Text style={styles.details}>
                Cart ({cartCount} {cartCount === 1 ? "item" : "items"})
              </Text>
              {cartCount > 0 && (
                <Text style={styles.detailsSub}>${cartTotal.toFixed(2)}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setCartModalVisible(true)}
              style={[styles.conBtn, cartCount === 0 && styles.conBtnDisabled]}
              disabled={cartCount === 0}
            >
              <Text style={styles.footerTxt}>Confirm Cart</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Modals ── */}
      <RenderCartModal
        visible={cartModalVisible}
        cartItems={cartItems}
        cartCount={cartCount}
        cartTotal={cartTotal}
        exchangeRate={exchangeRate}
        onClose={() => setCartModalVisible(false)}
        onUpdateQty={updateQty}
        onRemoveFromCart={removeFromCart}
        onClearCart={clearCart}
        onCheckout={openCheckout}
        isMobile={isMobile}
      />

      <RenderCheckoutModal
        visible={checkoutModalVisible}
        cartItems={cartItems}
        cartTotal={cartTotal}
        discountPercent={discountPercent}
        discountAmount={discountAmount}
        onDiscountPercentChange={handleDiscountPercentChange}
        onDiscountAmountChange={handleDiscountAmountChange}
        selectedCustomer={selectedCustomer}
        checkoutLoading={checkoutLoading}
        cashDolla={cashDolla}
        cashRiel={cashRiel}
        selectedPaymentMethod={selectedPaymentMethod}
        exchangeRate={exchangeRate}
        paidTotalUSD={paidTotalUSD}
        changeUSD={changeUSD}
        changeKHR={changeKHR}
        onClose={() => setCheckoutModalVisible(false)}
        onBack={() => {
          setCheckoutModalVisible(false);
          setCartModalVisible(true);
        }}
        onCashDollaChange={setCashDolla}
        onCashRielChange={setCashRiel}
        onPaymentMethodChange={setSelectedPaymentMethod}
        onConfirmOrder={handleConfirmOrder}
        isMobile={isMobile}
        cashCurrency={cashCurrency}
        onCashCurrencyChange={setCashCurrency}
      />

      <RenderPrintModal
        visible={printModalVisible}
        lastOrder={lastOrder}
        numPaper={numPaper}
        onNumPaperChange={setNumPaper}
        selectedPrinter={selectedPrinter}
        printers={printers}
        isDiscovering={isDiscovering}
        isPrinting={isPrinting}
        onClose={() => setPrintModalVisible(false)}
        onPrint={handlePrintInvoice}
        onSelectPrinter={(printer) => {
          setSelectedPrinter(printer);
        }}
        onRefreshPrinters={refreshPrinters}
        onTestPrint={testPrint}
        isMobile={isMobile}
      />

      {renderAlertModal({
        isMobile,
        alertModalVisible: alertVisible,
        setAlertModalVisible: setAlertVisible,
        title: alertTitle,
        bodyTxt: alertBody,
        onPress: alertOnPress,
      })}
    </View>
  );
}
