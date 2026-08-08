// renderProductCard.tsx
import { AppImages } from "@/constants/appImages";
import { AppColors } from "@/constants/appcolors";
import { useResponsive } from "@/hooks/useResponsive";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/auth.styles";
import { Product } from "./types";

interface RenderProductCardProps {
  item: Product;
  isInCart: (productId: string) => boolean;
  getCartQty: (productId: string) => number;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  cardWidth: number;
  isTablet?: boolean;
}

export const RenderProductCard: React.FC<RenderProductCardProps> = ({
  item,
  isInCart,
  getCartQty,
  addToCart,
  removeFromCart,
  cardWidth,
  isTablet = false,
}) => {
  const inCart = isInCart(item.id);
  const qty = getCartQty(item.id);

  const { isMobile } = useResponsive();

  return (
    <View style={[styles.card, { width: cardWidth }]}>
      <View style={styles.containerCart}>
        <View style={[styles.imageBox, { height: isTablet ? 200 : 165 }]}>
          {item.artwork ? (
            <View style={{ width: "100%", height: "100%" }}>
              <View style={styles.placeholderContainer}>
                <Image
                  source={AppImages.logoGrey}
                  style={{ width: 70, height: 70 }}
                />
              </View>
              <Image
                source={{ uri: item.artwork }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Image
                source={AppImages.logoGrey}
                style={{ width: 70, height: 70 }}
              />
            </View>
          )}
        </View>

        <Text style={styles.titleName} numberOfLines={1}>
          {item.name || "Untitled"}
        </Text>

        <View style={styles.priceRow}>
          {item.currency === "riel" ? (
            <Text style={styles.price}>
              {Math.round(item.price ?? 0).toLocaleString("en-US")}៛
            </Text>
          ) : (
            <Text style={styles.price}>
              ${item.price?.toFixed(2) ?? "0.00"}
            </Text>
          )}
        </View>

        {inCart ? (
          <View
            style={[
              styles.inCartRow,
              { paddingVertical: isMobile ? 5.5 : 5.7 },
            ]}
          >
            <MaterialIcons
              name="check-circle"
              size={16}
              color={AppColors.secondary}
            />
            <Text
              style={[
                styles.qtyText,
                { color: AppColors.secondary, flex: 1, marginLeft: 4 },
              ]}
            >
              In Cart ({qty})
            </Text>
            <TouchableOpacity
              style={[styles.qtyBtn, { backgroundColor: AppColors.red }]}
              onPress={() => removeFromCart(item.id)}
            >
              <MaterialIcons name="delete" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.btn}
            onPress={() => addToCart(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.btnText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
