// renderCheckoutModal.tsx
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "../../styles/auth.styles";
import { CartItem, Customer } from "./types";

interface RenderCheckoutModalProps {
  visible: boolean;
  cartItems: CartItem[];
  cartTotal: number;
  discountPercent: string;
  discountAmount: string;
  onDiscountPercentChange: (value: string) => void;
  onDiscountAmountChange: (value: string) => void;
  selectedCustomer: Customer | null;
  checkoutLoading: boolean;
  cashDolla: string;
  cashRiel: string;
  selectedPaymentMethod: "cash" | "khqr";
  exchangeRate: number;
  paidTotalUSD: number;
  changeUSD: number;
  changeKHR: number;
  onClose: () => void;
  onBack: () => void;
  onCashDollaChange: (value: string) => void;
  onCashRielChange: (value: string) => void;
  onPaymentMethodChange: (method: "cash" | "khqr") => void;
  onConfirmOrder: () => void;
  isMobile: boolean;
  cashCurrency: "USD" | "KHR";
  onCashCurrencyChange: (cur: "USD" | "KHR") => void;
}

export const RenderCheckoutModal: React.FC<RenderCheckoutModalProps> = ({
  visible,
  cartItems,
  cartTotal,
  discountPercent,
  discountAmount,
  onDiscountPercentChange,
  onDiscountAmountChange,
  selectedCustomer,
  checkoutLoading,
  cashDolla,
  cashRiel,
  selectedPaymentMethod,
  exchangeRate,
  paidTotalUSD,
  changeUSD,
  changeKHR,
  onClose,
  onBack,
  onCashDollaChange,
  onCashRielChange,
  onPaymentMethodChange,
  onConfirmOrder,
  isMobile = false,
  cashCurrency,
  onCashCurrencyChange,
}) => {
  // Toggle: which currency the cashier is entering
  // const [cashCurrency, setCashCurrency] = useState<"USD" | "KHR">("USD");

  const insets = useSafeAreaInsets();
  // Derived display values for the "return" row
  const cartTotalKHR = Math.round(cartTotal * exchangeRate);
  const discountAmountVal = parseFloat(discountAmount) || 0;
  const finalTotalUSD = Math.max(0, cartTotal - discountAmountVal);
  const finalTotalKHR = Math.round(finalTotalUSD * exchangeRate);

  return (
    <Modal
      visible={visible}
      animationType={isMobile ? "slide" : "fade"}
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
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
            styles.modalContainer,
            {
              maxHeight: !isMobile ? "90%" : "87%",
              height: !isMobile ? "90%" : "87%",
              maxWidth: !isMobile ? "70%" : "100%",
              width: !isMobile ? "70%" : "100%",
              borderBottomLeftRadius: !isMobile ? 20 : 0,
              borderBottomRightRadius: !isMobile ? 20 : 0,
            },
            isMobile && { paddingBottom: 24 + insets.bottom },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Checkout</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            enableOnAndroid={true}
            extraScrollHeight={20}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={!isMobile ? { flexGrow: 1 } : {}}
          >
            <View
              style={
                !isMobile
                  ? { flexDirection: "row", gap: 20, paddingTop: 16, flex: 1 }
                  : {}
              }
            >
              {/* ── Left Column: Order Summary & Discount ── */}
              <View
                style={
                  !isMobile ? { flex: 1, justifyContent: "space-between" } : {}
                }
              >
                <View>
                  <Text
                    style={[styles.sectionLabel, isMobile && { marginTop: 16 }]}
                  >
                    Order Summary
                  </Text>

                  {cartItems.map((i) => {
                    const lineTotal = i.product.price * i.quantity;
                    const isRiel = i.product.currency === "riel";
                    return (
                      <View key={i.product.id} style={styles.summaryRow}>
                        <Text style={styles.summaryName} numberOfLines={1}>
                          {i.product.name}
                        </Text>
                        <Text style={styles.summaryQty}>×{i.quantity}</Text>
                        <Text style={styles.summaryPrice}>
                          {isRiel
                            ? `${Math.round(lineTotal).toLocaleString("en-US")}៛`
                            : `$${lineTotal.toFixed(2)}`}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <View style={!isMobile ? { marginTop: "auto" } : {}}>
                  {discountAmountVal > 0 && (
                    <>
                      <View
                        style={[
                          styles.totalRow,
                          {
                            marginTop: 8,
                            paddingVertical: 4,
                            borderTopWidth: 0,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.totalLabel,
                            {
                              fontSize: 13,
                              color: AppColors.textSecondary,
                              fontWeight: "normal",
                            },
                          ]}
                        >
                          Subtotal
                        </Text>
                        <Text
                          style={[
                            styles.totalAmount,
                            {
                              fontSize: 14,
                              color: AppColors.textSecondary,
                              fontWeight: "normal",
                            },
                          ]}
                        >
                          ${cartTotal.toFixed(2)}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.totalRow,
                          {
                            marginTop: 0,
                            paddingVertical: 4,
                            borderTopWidth: 0,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.totalLabel,
                            {
                              fontSize: 13,
                              color: AppColors.textSecondary,
                              fontWeight: "normal",
                            },
                          ]}
                        >
                          Discount
                        </Text>
                        <Text
                          style={[
                            styles.totalAmount,
                            {
                              fontSize: 14,
                              color: AppColors.red,
                              fontWeight: "normal",
                            },
                          ]}
                        >
                          -${discountAmountVal.toFixed(2)}
                        </Text>
                      </View>
                    </>
                  )}

                  <View style={[styles.totalRow, { marginTop: 8 }]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.totalAmount}>
                        ${finalTotalUSD.toFixed(2)}
                      </Text>
                      <Text style={styles.totalAmount}>
                        {finalTotalKHR.toLocaleString()}៛
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* ── Right Column: Payment ── */}
              <View
                style={
                  !isMobile
                    ? {
                        flex: 1,
                        borderLeftWidth: 1,
                        borderLeftColor: `${AppColors.grey}33`,
                        paddingLeft: 20,
                      }
                    : {}
                }
              >
                <View
                  style={{
                    borderTopWidth: !isMobile ? 0 : 1.5,
                    borderTopColor: `${AppColors.grey}33`,
                    paddingTop: !isMobile ? 0 : 10,
                    marginTop: !isMobile ? 0 : 12,
                  }}
                >
                  <Text style={styles.sectionLabel}>Discount</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 12,
                      marginBottom: 8,
                      paddingHorizontal: 4,
                    }}
                  >
                    <View style={{ flex: 1, position: "relative" }}>
                      <TextInput
                        style={[
                          styles.printInput,
                          { paddingLeft: 30, fontSize: 14, height: 42 },
                        ]}
                        value={discountPercent}
                        onChangeText={onDiscountPercentChange}
                        placeholder="0"
                        placeholderTextColor={AppColors.grey}
                        keyboardType="numeric"
                      />
                      <Text
                        style={{
                          position: "absolute",
                          left: 12,
                          top: "50%",
                          transform: [{ translateY: -10 }],
                          color: AppColors.grey,
                          fontWeight: "600",
                          fontSize: 14,
                        }}
                      >
                        %
                      </Text>
                    </View>
                    <View style={{ flex: 1, position: "relative" }}>
                      <TextInput
                        style={[
                          styles.printInput,
                          { paddingLeft: 30, fontSize: 14, height: 42 },
                        ]}
                        value={discountAmount}
                        onChangeText={onDiscountAmountChange}
                        placeholder="0.00"
                        placeholderTextColor={AppColors.grey}
                        keyboardType="numeric"
                      />
                      <Text
                        style={{
                          position: "absolute",
                          left: 12,
                          top: "50%",
                          transform: [{ translateY: -10 }],
                          color: AppColors.grey,
                          fontWeight: "600",
                          fontSize: 14,
                        }}
                      >
                        $
                      </Text>
                    </View>
                  </View>
                </View>

                <View
                  style={[
                    styles.paymentCon,
                    !isMobile && { borderTopWidth: 0, paddingTop: 0 },
                    {
                      borderTopWidth: 1.5,
                      borderTopColor: `${AppColors.grey}33`,
                      paddingTop: 10,
                      marginTop: 12,
                    },
                  ]}
                >
                  <Text style={styles.sectionLabel}>Payment</Text>

                  <View style={styles.payMeth}>
                    {(["cash", "khqr"] as const).map((method) => (
                      <TouchableOpacity
                        key={method}
                        style={[
                          styles.txtPayMethoBtn,
                          selectedPaymentMethod === method &&
                            styles.txtPayMethoBtnActive,
                        ]}
                        onPress={() => onPaymentMethodChange(method)}
                        activeOpacity={0.75}
                      >
                        <Text
                          style={[
                            styles.txtPayMetho,
                            selectedPaymentMethod === method &&
                              styles.txtPayMethoActive,
                          ]}
                        >
                          {method === "cash" ? "Cash" : "KHQR"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {selectedPaymentMethod === "cash" && (
                    <View style={styles.cashCon}>
                      <View style={styles.curencyCon}>
                        <Text
                          style={[
                            // styles.sectionLabel,
                            {
                              alignSelf: "center",
                              justifyContent: "center",
                              color: AppColors.grey,
                              fontSize: 14,
                              fontWeight: "600",
                              fontFamily: AppFonts.regular,
                              includeFontPadding: false,
                            },
                          ]}
                        >
                          Currency type
                        </Text>

                        <View
                          style={{
                            flexDirection: "row",
                            borderRadius: 8,
                            overflow: "hidden",
                            borderWidth: 1,
                            borderColor: AppColors.grey,
                            alignSelf: "center",
                          }}
                        >
                          {(["USD", "KHR"] as const).map((cur) => (
                            <TouchableOpacity
                              key={cur}
                              onPress={() => {
                                onCashCurrencyChange(cur);
                                onCashDollaChange("");
                                onCashRielChange("");
                              }}
                              style={{
                                paddingHorizontal: 20,
                                paddingVertical: 8,
                                backgroundColor:
                                  cashCurrency === cur
                                    ? AppColors.secondary
                                    : "transparent",
                              }}
                              activeOpacity={0.75}
                            >
                              <Text
                                style={{
                                  color:
                                    cashCurrency === cur
                                      ? AppColors.background2
                                      : AppColors.grey,
                                  fontWeight: "600",
                                  fontSize: 14,
                                  fontFamily: AppFonts.bold,
                                  includeFontPadding: false,
                                }}
                              >
                                {cur}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      <View style={{ marginTop: 10, position: "relative" }}>
                        <TextInput
                          style={[
                            styles.printInput,
                            { fontSize: 18, paddingLeft: 40 },
                          ]}
                          value={cashCurrency === "USD" ? cashDolla : cashRiel}
                          onChangeText={(val) => {
                            if (cashCurrency === "USD") {
                              onCashDollaChange(val);
                              onCashRielChange("");
                            } else {
                              onCashRielChange(val);
                              onCashDollaChange("");
                            }
                          }}
                          placeholderTextColor={AppColors.grey}
                          keyboardType="number-pad"
                        />
                        {cashCurrency === "USD" ? (
                          <MaterialIcons
                            name="attach-money"
                            size={20}
                            color={AppColors.grey}
                            style={{
                              position: "absolute",
                              left: 12,
                              top: "50%",
                              transform: [{ translateY: -10 }],
                            }}
                          />
                        ) : (
                          <Text style={styles.txtRiel}>{"៛"}</Text>
                        )}
                      </View>

                      <Text style={styles.exRate}>
                        Exchange rate : 1$ = {exchangeRate.toLocaleString()}
                        {"៛"}
                      </Text>

                      <Text style={styles.sectionLabel}>
                        Return to Customer
                      </Text>

                      <View style={styles.cashReturnCon}>
                        <Text
                          style={[
                            styles.txtCash,
                            changeUSD > 0 && { color: AppColors.secondary },
                          ]}
                        >
                          ${changeUSD.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.cashReturnCon}>
                        <Text
                          style={[
                            styles.txtCash,
                            changeKHR > 0 && { color: AppColors.secondary },
                          ]}
                        >
                          {changeKHR.toLocaleString()}
                          {"៛"}
                        </Text>
                      </View>
                    </View>
                  )}

                  {selectedPaymentMethod === "khqr" && (
                    <View style={styles.khqrCon}>
                      <View style={styles.curencyCon}>
                        <Text
                          style={{
                            alignSelf: "center",
                            justifyContent: "center",
                            color: AppColors.grey,
                            fontSize: 14,
                            fontWeight: "600",
                            fontFamily: AppFonts.regular,
                            includeFontPadding: false,
                          }}
                        >
                          Currency type
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            borderRadius: 8,
                            overflow: "hidden",
                            borderWidth: 1,
                            borderColor: AppColors.grey,
                            alignSelf: "center",
                          }}
                        >
                          {(["USD", "KHR"] as const).map((cur) => (
                            <TouchableOpacity
                              key={cur}
                              onPress={() => onCashCurrencyChange(cur)}
                              style={{
                                paddingHorizontal: 20,
                                paddingVertical: 8,
                                backgroundColor:
                                  cashCurrency === cur
                                    ? AppColors.secondary
                                    : "transparent",
                              }}
                              activeOpacity={0.75}
                            >
                              <Text
                                style={{
                                  color:
                                    cashCurrency === cur
                                      ? AppColors.background2
                                      : AppColors.grey,
                                  fontWeight: "600",
                                  fontSize: 14,
                                  fontFamily: AppFonts.bold,
                                  includeFontPadding: false,
                                }}
                              >
                                {cur}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      <MaterialIcons
                        name="qr-code"
                        size={80}
                        color={AppColors.textSecondary}
                      />
                      <Text style={styles.khqrTitle}>KHQR Pay</Text>
                      <Text style={styles.khqrSubtitle}>
                        Scan QR code or transfer to Bank account{"\n"}092 696
                        698
                      </Text>
                      <View
                        style={[
                          styles.totalRow,
                          { margin: 0, borderTopWidth: 0 },
                        ]}
                      >
                        <Text style={styles.totalLabel}>Amount Due </Text>
                        <Text style={styles.totalAmount}>
                          {cashCurrency === "USD"
                            ? `$${finalTotalUSD.toFixed(2)}`
                            : `${finalTotalKHR.toLocaleString()}៛`}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </KeyboardAwareScrollView>

          <View
            style={[
              styles.modalFooter,
              !isMobile && { width: "50%", alignSelf: "center" },
            ]}
          >
            {isMobile ? (
              <TouchableOpacity style={styles.clearBtn} onPress={onBack}>
                <Text style={styles.clearBtnText}>Back</Text>
              </TouchableOpacity>
            ) : null}

            {!isMobile ? (
              <TouchableOpacity style={styles.clearBtn} onPress={onClose}>
                <Text style={styles.clearBtnText}>Close</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              disabled={checkoutLoading}
              style={[
                styles.checkoutBtn,
                checkoutLoading && styles.checkoutBtnDisabled,
              ]}
              onPress={onConfirmOrder}
            >
              {checkoutLoading ? (
                <ActivityIndicator color={AppColors.background2} size="small" />
              ) : (
                <Text style={styles.checkoutBtnText}>Confirm & Pay</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
