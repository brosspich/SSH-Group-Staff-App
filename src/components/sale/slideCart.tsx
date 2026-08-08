// renderCartSlide.tsx
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CartItem } from "./types";

interface RenderCartSlideProps {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  exchangeRate: number;
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  isTablet: boolean;
}

export const RenderCartSlide: React.FC<RenderCartSlideProps> = ({
  cartItems,
  cartCount,
  cartTotal,
  exchangeRate,
  onUpdateQty,
  onRemoveFromCart,
  onClearCart,
  onCheckout,
  isTablet = false,
}) => {
  return (
    <>
      <View style={styles.cartContainer}>
        <View style={styles.modalHeader}>
          {/* <Text style={styles.modalTitle}>Cart ({cartCount} items)</Text> */}
          <Text style={styles.modalTitle}>
            Cart ({cartCount} {cartCount === 1 ? "item" : "items"})
          </Text>
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <Text style={styles.emptyCartText}>Your cart is empty.</Text>
          </View>
        ) : (
          <FlatList
            data={cartItems}
            keyExtractor={(i) => i.product.id}
            contentContainerStyle={{ paddingBottom: 10 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.cartItemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cartItemName} numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.cartItemUnit}>
                    {item.product.currency === "riel"
                      ? `${Math.round(item.product.price).toLocaleString("en-US")}៛`
                      : `$${item.product.price.toFixed(2)}`}
                    /
                    {item.product.category_id === "SSH-0000-0003"
                      ? "row"
                      : "pcs"}
                  </Text>
                </View>

                <View style={styles.cartQtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => onUpdateQty(item.product.id, -1)}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => onUpdateQty(item.product.id, 1)}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => onRemoveFromCart(item.product.id)}
                  >
                    <MaterialIcons
                      name="delete"
                      size={18}
                      color={AppColors.background2}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}

        {cartItems.length > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.totalAmount}>${cartTotal.toFixed(2)}</Text>
              <Text style={styles.totalAmount}>
                {Math.round(cartTotal * exchangeRate).toLocaleString("en-US")}៛
              </Text>
            </View>
          </View>
        )}

        <View style={[styles.modalFooter]}>
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => {
              onClearCart();
            }}
          >
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.checkoutBtn,
              cartItems.length === 0 && styles.checkoutBtnDisabled,
            ]}
            onPress={onCheckout}
            disabled={cartItems.length === 0}
          >
            <AntDesign
              name="logout"
              size={16}
              color={AppColors.background2}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.checkoutBtnText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  cartContainer: {
    backgroundColor: AppColors.background2,
    // padding: 10,
    flex: 1,
    width: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  emptyCart: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    flex: 1,
  },
  emptyCartText: {
    fontSize: 16,
    color: AppColors.textSecondary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  cartItemRow: {
    // flexDirection: "row",
    // alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.grey,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  cartItemUnit: {
    fontSize: 12,
    color: AppColors.grey,
    marginTop: 2,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  cartQtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    justifyContent: "space-between",
    marginTop: 8,
  },
  qtyBtn: {
    backgroundColor: AppColors.secondary,
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyBtnText: {
    color: AppColors.background2,
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  qtyText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  removeBtn: {
    backgroundColor: AppColors.red,
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1.5,
    borderTopColor: `${AppColors.grey}33`,
    marginTop: 4,
  },
  totalLabel: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  totalAmount: {
    color: AppColors.secondary,
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },

  modalFooter: {
    flexDirection: "row",
    gap: 5,
    // marginTop: 14,
  },
  clearBtn: {
    // flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: AppColors.secondary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  clearBtnText: {
    color: AppColors.secondary,
    fontWeight: "bold",
    fontSize: 14,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  checkoutBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: AppColors.secondary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  checkoutBtnDisabled: {
    opacity: 0.5,
  },
  checkoutBtnText: {
    color: AppColors.background2,
    fontWeight: "bold",
    fontSize: 14,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
