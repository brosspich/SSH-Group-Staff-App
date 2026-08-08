import { type ReportPaperSettings } from "@/app/create/custom_report_paper";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import {
  formatCurrency,
  formatKHR,
  formatOrderId,
  formatRiel,
  type OrderRow,
  type Summary,
} from "@/hooks/useReportData";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Image, Platform, StyleSheet, Text, View } from "react-native";

export interface ReportPaperProps {
  periodLabel: string;
  reportType: "Daily" | "Weekly" | "Monthly" | "Annual";
  summary: Summary | null;
  orders: OrderRow[];
  settings?: ReportPaperSettings;
}

export default function CustomReportPaper({
  periodLabel,
  reportType,
  summary,
  orders,
  settings,
}: ReportPaperProps) {
  if (!summary) return null;

  const companyName = settings?.companyName ?? "SSH Group";
  const logoUri = settings?.logoUri ?? null;
  const tagline = settings?.tagline ?? "";

  const now = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={s.paper}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          {logoUri ? (
            <Image
              source={{ uri: logoUri }}
              style={s.logo}
              resizeMode="contain"
            />
          ) : (
            <View style={s.logoPlaceholder}>
              <MaterialCommunityIcons
                name="receipt"
                size={22}
                color={AppColors.secondary}
              />
            </View>
          )}
          <View>
            <Text style={s.companyName}>{companyName}</Text>
            <Text style={s.reportTitle}>{reportType} Sales Report</Text>
            {tagline ? <Text style={s.tagline}>{tagline}</Text> : null}
          </View>
        </View>
        <View style={s.headerRight}>
          <Text style={s.periodLabel}>{periodLabel}</Text>
          <Text style={s.generatedAt}>Generated {now}</Text>
        </View>
      </View>

      <View style={s.divider} />

      {/* Summary cards */}
      <View style={s.cardGrid}>
        <SummaryCard
          // icon="shopping-cart"
          label="Total Orders"
          value={`${summary.totalOrders}`}
        />
        <SummaryCard
          // icon="attach-money"
          label="Total Revenue"
          value={formatCurrency(summary.totalUSD)}
          sub={formatKHR(summary.totalUSD, summary.exchangeRate)}
          accent
        />
        <SummaryCard
          // icon="payments"
          label="Cash"
          value={formatCurrency(summary.cashUSD)}
          sub={formatRiel(summary.cashKHR)}
        />
        <SummaryCard
          // icon="qr-code"
          label="KHQR"
          value={formatCurrency(summary.khqrUSD)}
          sub={formatRiel(summary.khqrKHR)}
        />
      </View>

      {/* Orders table */}
      <View style={s.tableSection}>
        <View style={s.tableHeader}>
          <Text style={s.tableTitle}>Order Details</Text>
          <View style={s.totalBadge}>
            <Text style={s.totalBadgeText}>{summary.totalOrders} orders</Text>
          </View>
        </View>
        <View style={[s.tableRow, s.tableColHeader]}>
          <Text style={[s.colText, { flex: 1.5, textAlign: "center" }]}>
            Order ID
          </Text>
          <Text style={[s.colText, { flex: 3, textAlign: "center" }]}>
            Products
          </Text>
          <Text style={[s.colText, { flex: 1, textAlign: "center" }]}>
            Item
          </Text>
          <Text style={[s.colText, { flex: 1, textAlign: "center" }]}>
            Method
          </Text>
          <Text
            style={[s.colText, s.colRight, { flex: 1.2, textAlign: "center" }]}
          >
            Amount
          </Text>
        </View>
        {orders.length === 0 ? (
          <View style={s.emptyState}>
            <MaterialIcons name="inbox" size={32} color={AppColors.grey} />
            <Text style={s.emptyText}>No orders in this period</Text>
          </View>
        ) : (
          orders.map((order, i) => (
            <View
              key={order.id}
              style={[s.tableRow, i % 2 === 0 ? s.rowEven : s.rowOdd]}
            >
              <Text style={[s.cellMeta, { flex: 1.5 }]} numberOfLines={1}>
                {formatOrderId(order.id)}
              </Text>
              <Text style={[s.cellText, { flex: 3 }]} numberOfLines={2}>
                {/* {order.product_names.length > 0
                  ? order.product_names.join(", ")
                  : `${order.item_count} item${order.item_count !== 1 ? "s" : ""}`} */}
                {order.product_names.join(", ")}
              </Text>
              <Text style={[s.cellMeta, { flex: 1, textAlign: "center" }]}>
                {/* {formatTime(order.created_at)} */}x{order.item_count}
              </Text>
              <View style={{ flex: 1, alignItems: "center" }}>
                <View
                  style={order.payment === "cash" ? s.badgeCash : s.badgeKhqr}
                >
                  <Text
                    style={
                      order.payment === "cash"
                        ? s.badgeCashText
                        : s.badgeKhqrText
                    }
                  >
                    {order.payment === "cash" ? "Cash" : "KHQR"}
                  </Text>
                </View>
              </View>
              <Text style={[s.cellAmount, { flex: 1.2 }]}>
                {order.currency === "riel"
                  ? formatRiel(order.total_amount)
                  : formatCurrency(order.total_amount)}
              </Text>
            </View>
          ))
        )}
        {orders.length > 0 && (
          <View style={s.totalRow}>
            <Text style={[s.totalLabel, { flex: 7.2 }]}>Total</Text>
            <Text style={[s.totalAmount, { flex: 1.2 }]}>
              {formatCurrency(summary.totalUSD)}
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={s.footer}>
        <Text style={s.footerText}>
          {companyName} POS · {periodLabel}
        </Text>
        <Text style={s.footerText}>Confidential</Text>
      </View>
    </View>
  );
}

function SummaryCard({
  // icon,
  label,
  value,
  sub,
  accent,
}: {
  // icon: any;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <View style={[s.card]}>
      {/* <MaterialIcons
        name={icon}
        size={18}
        color={AppColors.grey}
        style={{ marginBottom: 6 }}
      /> */}
      <Text style={[s.cardLabel]}>{label}</Text>
      <Text style={[s.cardValue]}>{value}</Text>
      {sub && <Text style={s.cardSub}>{sub}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  paper: {
    width: "92%",
    maxWidth: 600,
    alignSelf: "center",
    backgroundColor: AppColors.background2,
    padding: 20,
    marginVertical: 16,
    borderRadius: 8,
    ...Platform.select({
      web: {
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.12)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
      },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: "#ffffff",
  },
  logoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: AppColors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  companyName: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  reportTitle: {
    fontSize: 11,
    color: AppColors.grey,
    marginTop: 2,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  tagline: {
    fontSize: 10,
    color: AppColors.grey,
    marginTop: 1,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  periodLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  generatedAt: {
    fontSize: 10,
    color: AppColors.grey,
    marginTop: 3,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  divider: {
    height: 1,
    backgroundColor: "#e8e8e8",
    marginBottom: 16,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  cardAccent: {
    backgroundColor: "#f0faf2",
    borderColor: "#d4edda",
  },
  cardLabel: {
    fontSize: 10,
    color: AppColors.grey,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  // cardLabelAccent: {
  //   color: "#2e7d32",
  // },
  cardValue: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  cardValueAccent: {
    color: "#2e7d32",
  },
  cardSub: {
    fontSize: 18,
    color: AppColors.textPrimary + 90,
    marginTop: 3,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  tableSection: {
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fafafa",
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
  },
  tableTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  totalBadge: {
    backgroundColor: "#e8e8e8",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  totalBadgeText: {
    fontSize: 11,
    color: "#555",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  tableColHeader: {
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
  },
  colText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  colRight: { textAlign: "right" },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  rowEven: { backgroundColor: "#fff" },
  rowOdd: { backgroundColor: "#fafafa" },
  cellText: {
    fontSize: 12,
    color: AppColors.textPrimary,
    paddingHorizontal: 8,
    paddingVertical: 9,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  cellMeta: {
    fontSize: 11,
    color: AppColors.grey,
    paddingHorizontal: 8,
    paddingVertical: 9,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  cellAmount: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.textPrimary,
    paddingHorizontal: 8,
    paddingVertical: 9,
    textAlign: "right",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  badgeCash: {
    backgroundColor: "#e6f4ea",
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeCashText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#2e7d32",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  badgeKhqr: {
    backgroundColor: "#e3f2fd",
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeKhqrText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#1565c0",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    borderTopWidth: 2,
    borderTopColor: "#e8e8e8",
    backgroundColor: "#fafafa",
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: AppColors.textPrimary,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  totalAmount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2e7d32",
    paddingHorizontal: 8,
    paddingVertical: 10,
    textAlign: "right",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  footerText: {
    fontSize: 10,
    color: "#bbb",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
});
