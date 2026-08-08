import { ReceiptSettings } from "@/app/create/custom_receipt";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { Image, Platform, StyleSheet, Text, View } from "react-native";
import { OrderData } from "./types";

export interface CustomReceiptPaperProps {
  settings: ReceiptSettings;
  order: OrderData | null;
}

const PREVIEW_ITEMS = [
  { name: "Product A", quantity: 2, price: 12.5 },
  { name: "Product B", quantity: 1, price: 8.0 },
  { name: "Product C", quantity: 3, price: 5.75 },
];

const KHR_RATE = 4100;

export default function CustomReceiptPaper({
  settings,
  order,
}: CustomReceiptPaperProps) {
  const is57 = settings.paperSize === "57mm";
  const previewWidth = is57 ? 200 : 280;

  // Normalize items
  const items = order
    ? order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        currency: item.product.currency,
      }))
    : PREVIEW_ITEMS.map((item) => ({
        ...item,
        currency: "usd" as const,
      }));

  const total = order
    ? order.total
    : items.reduce((s, i) => s + i.quantity * i.price, 0);

  const subtotal =
    order?.subtotal ??
    (order ? order.total + (order.discountAmount ?? 0) : total);
  const discountAmount = order?.discountAmount ?? 0;
  const discountPercent = order?.discountPercent ?? 0;

  const totalKHR = Math.round(total * KHR_RATE).toLocaleString("en-US");

  const invoiceNumber = order ? order.invoiceNumber : "#INV-00001";
  const customerName = order?.customer?.name || "Walk-in Client";
  const dateStr = order
    ? new Date().toLocaleDateString("en-GB") +
      " " +
      new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : new Date().toLocaleDateString("en-GB") +
      " " +
      new Date().getHours() +
      ":" +
      new Date().getMinutes().toString().padStart(2, "0") +
      ":" +
      new Date().getSeconds().toString().padStart(2, "0");

  return (
    <View style={[styles.receiptPaper, { width: previewWidth }]}>
      {/* Logo */}
      {settings.logoUri ? (
        <Image
          source={{ uri: settings.logoUri }}
          style={styles.receiptLogo}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.receiptLogoPlaceholder}>
          <Text style={styles.receiptLogoPlaceholderText}>LOGO</Text>
        </View>
      )}

      {/* Company name */}
      <Text style={styles.receiptCompanyName} numberOfLines={1}>
        {settings.companyName || "Company Name"}
      </Text>

      {/* Contact info */}
      {settings.phone ? (
        <Text style={styles.receiptMeta} numberOfLines={1}>
          Tel : {settings.phone}
        </Text>
      ) : null}
      {settings.email ? (
        <Text style={styles.receiptMeta} numberOfLines={1}>
          Email : {settings.email}
        </Text>
      ) : null}
      {settings.address ? (
        <Text style={styles.receiptMeta} numberOfLines={1}>
          Address : {settings.address}
        </Text>
      ) : null}

      {/* Divider */}
      <View style={styles.receiptDivider} />

      {/* Invoice meta */}
      <Text style={styles.receiptMetaSmall}>Invoice : {invoiceNumber}</Text>
      <Text style={styles.receiptMetaSmall}>Customer : {customerName}</Text>
      <Text style={styles.receiptMetaSmall}>Date : {dateStr}</Text>
      {order && (
        <Text style={styles.receiptMetaSmall}>
          Payment : {(order.paymentMethod ?? "cash").toUpperCase()}
        </Text>
      )}

      {/* Divider */}
      <View style={styles.receiptDivider} />

      {/* Items Header */}
      {settings.showProducts && (
        <>
          <View style={styles.receiptItemRow}>
            <Text style={styles.receiptItemName} numberOfLines={1}>
              Item
            </Text>
            <Text style={styles.receiptItemQty}>Qty</Text>
            <Text style={styles.receiptItemPrice}>Price</Text>
          </View>

          {/* Divider */}
          <View style={styles.receiptDivider} />

          {/* Products */}
          {items.map((item, idx) => {
            const isRiel = item.currency === "riel";
            const lineTotal = item.quantity * item.price;
            const priceFormatted = isRiel
              ? `${Math.round(lineTotal).toLocaleString("en-US")}៛`
              : `$${lineTotal.toFixed(2)}`;
            return (
              <View key={idx} style={styles.receiptItemRow}>
                <Text style={styles.receiptItemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.receiptItemQty}>x{item.quantity}</Text>
                <Text style={styles.receiptItemPrice}>{priceFormatted}</Text>
              </View>
            );
          })}

          {/* Total Divider */}
          <View style={styles.receiptDivider} />
        </>
      )}

      {/* Total */}
      {discountAmount > 0 ? (
        <>
          <Text style={[styles.receiptMeta, { fontFamily: AppFonts.bold }]}>
            Subtotal : {subtotal.toFixed(2)} USD
          </Text>
          <Text style={[styles.receiptMeta, { fontFamily: AppFonts.bold }]}>
            Discount : -{discountAmount.toFixed(2)} USD ({discountPercent}%)
          </Text>
          <View style={styles.receiptDivider} />
        </>
      ) : null}
      <Text style={styles.receiptTotalLabel}>
        Total : {total.toFixed(2)} USD
      </Text>
      <Text style={styles.receiptTotalLabel}>Total : {totalKHR} KHR</Text>

      {/* KHQR or QR preview */}
      {order ? (
        order.paymentMethod === "khqr" && (
          <>
            <View style={styles.receiptDivider} />
            <Text style={styles.khqrTitle}>── KHQR Pay ──</Text>
            <Text style={styles.khqrSubtitle}>Scan QR or transfer to:</Text>
            <Text style={styles.khqrBank}>ABA Bank : {settings.phone}</Text>
            {settings.qrUri ? (
              <Image
                source={{ uri: settings.qrUri }}
                style={styles.receiptQr}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.receiptQrPlaceholder}>
                <Text style={styles.receiptQrPlaceholderText}>QR</Text>
              </View>
            )}
          </>
        )
      ) : (
        <>
          <View style={styles.receiptDivider} />
          {settings.qrUri ? (
            <Image
              source={{ uri: settings.qrUri }}
              style={styles.receiptQr}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.receiptQrPlaceholder}>
              <Text style={styles.receiptQrPlaceholderText}>QR</Text>
            </View>
          )}
        </>
      )}

      {/* Thank you */}
      {settings.showThankYou && (
        <Text style={styles.receiptThankYou}>
          {settings.thankYouText || "Thank you!"}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  receiptPaper: {
    backgroundColor: AppColors.background2,
    padding: 12,
    borderRadius: 2,
    ...Platform.select({
      web: { boxShadow: "0px 2px 8px rgba(0,0,0,0.12)" },
      default: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      },
    }),
  },
  receiptLogo: {
    width: 60,
    height: 40,
    alignSelf: "center",
    marginBottom: 4,
    backgroundColor: "#ffffff",
  },
  receiptLogoPlaceholder: {
    width: 60,
    height: 40,
    alignSelf: "center",
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 2,
    marginBottom: 4,
  },
  receiptLogoPlaceholderText: {
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    fontSize: 9,
    color: "#9CA3AF",
  },
  receiptCompanyName: {
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    fontSize: 13,
    color: AppColors.textPrimary,
    textAlign: "center",
    marginBottom: 2,
  },
  receiptMeta: {
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    fontSize: 8,
    color: AppColors.textPrimary,
    lineHeight: 12,
  },
  receiptDivider: {
    height: 1,
    borderStyle: "dashed",
    borderWidth: 0.5,
    borderColor: AppColors.textPrimary,
    marginVertical: 6,
  },
  receiptMetaSmall: {
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    fontSize: 7,
    color: AppColors.textPrimary,
  },
  receiptItemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  receiptItemName: {
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    flex: 1,
    fontSize: 8,
    color: AppColors.textPrimary,
  },
  receiptItemQty: {
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    fontSize: 8,
    color: AppColors.textPrimary,
    marginHorizontal: 6,
  },
  receiptItemPrice: {
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    fontSize: 8,
    color: AppColors.textPrimary,
    minWidth: 40,
    textAlign: "right",
  },
  receiptTotalLabel: {
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    fontSize: 10,
    color: AppColors.textPrimary,
  },
  receiptQr: {
    width: 60,
    height: 60,
    alignSelf: "center",
    marginTop: 8,
    backgroundColor: "#ffffff",
  },
  receiptQrPlaceholder: {
    width: 60,
    height: 60,
    alignSelf: "center",
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 2,
    marginTop: 8,
  },
  receiptQrPlaceholderText: {
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    fontSize: 8,
    color: "#9CA3AF",
    textAlign: "center",
  },
  receiptThankYou: {
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    fontSize: 11,
    color: AppColors.textPrimary,
    textAlign: "center",
    marginTop: 8,
  },
  khqrTitle: {
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    fontSize: 10,
    color: AppColors.textPrimary,
    textAlign: "center",
  },
  khqrSubtitle: {
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    fontSize: 8,
    color: AppColors.textPrimary,
    textAlign: "center",
    marginTop: 2,
  },
  khqrBank: {
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    fontSize: 8,
    color: AppColors.textPrimary,
    textAlign: "center",
    marginTop: 1,
  },
});
