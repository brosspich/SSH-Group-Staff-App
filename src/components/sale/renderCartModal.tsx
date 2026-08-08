// renderCartModal.tsx
import { AppColors } from "@/constants/appcolors";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "../../styles/auth.styles";
import { renderAlertModal } from "../alert/alert";
import { CartItem } from "./types";

interface RenderCartModalProps {
  visible: boolean;
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  exchangeRate: number;
  onClose: () => void;
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  isMobile: boolean;
}

export const RenderCartModal: React.FC<RenderCartModalProps> = ({
  visible,
  cartItems,
  cartCount,
  cartTotal,
  exchangeRate,
  onClose,
  onUpdateQty,
  onRemoveFromCart,
  onClearCart,
  onCheckout,
  isMobile = false,
}) => {
  const insets = useSafeAreaInsets();
  // Add state for the alert modal
  const [clearAlertVisible, setClearAlertVisible] = useState(false);

  const handleClearCart = () => {
    onClearCart();
    onClose();
    setClearAlertVisible(false);
  };

  return (
    <>
      <Modal
        visible={visible}
        statusBarTranslucent
        animationType={isMobile ? "slide" : "fade"}
        transparent
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              isMobile && { paddingBottom: 24 + insets.bottom },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cart ({cartCount} items)</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
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
                    </View>

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
                )}
              />
            )}

            {cartItems.length > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.totalAmount}>
                    ${cartTotal.toFixed(2)}
                  </Text>
                  <Text style={styles.totalAmount}>
                    {Math.round(cartTotal * exchangeRate).toLocaleString(
                      "en-US",
                    )}
                    ៛
                  </Text>
                </View>
              </View>
            )}

            <View style={[styles.modalFooter]}>
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => {
                  setClearAlertVisible(true);
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
                <Text style={styles.checkoutBtnText}>Checkout →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Render the alert modal outside the main modal */}
      {renderAlertModal({
        isMobile,
        alertModalVisible: clearAlertVisible,
        setAlertModalVisible: setClearAlertVisible,
        title: "Clear Cart",
        bodyTxt: "Remove all items from your cart?",
        onPress: handleClearCart,
      })}
    </>
  );
};
