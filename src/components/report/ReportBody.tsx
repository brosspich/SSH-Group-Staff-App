import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import {
  formatCurrency,
  formatOrderId,
  formatRiel,
  formatTime,
  type OrderRow,
  type Summary,
} from "@/hooks/useReportData";
import { StyleSheet, Text, View } from "react-native";
import Loading from "../loading/loading";

interface Props {
  loading: boolean;
  summary: Summary | null;
  orders: OrderRow[];
}

export function ReportBody({ loading, summary, orders }: Props) {
  if (loading) return <Loading />;
  if (!summary) return null;

  return (
    <>
      {/* Metric cards */}
      <View style={s.metricGrid}>
        <MetricCard label="Total orders" value={`${summary.totalOrders}`} />
        <MetricCard
          label="Total revenue"
          value={formatCurrency(summary.totalUSD)}
          sub={formatRiel(summary.totalKHR)}
        />
        <MetricCard
          label="Cash"
          value={formatCurrency(summary.cashUSD)}
          sub={formatRiel(summary.cashKHR)}
        />
        <MetricCard
          label="KHQR"
          value={formatCurrency(summary.khqrUSD)}
          sub={formatRiel(summary.khqrKHR)}
        />
      </View>

      {/* Orders table */}
      <View style={s.tableCard}>
        <View style={s.tableHeader}>
          <Text style={s.tableHeaderText}>Orders</Text>
          <Text style={s.tableHeaderSub}>{summary.totalOrders} total</Text>
        </View>
        {orders.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyText}>No orders in this period</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order.id} style={s.tableRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={s.orderId}>
                  {order.product_names.join(", ")} x{order.item_count}
                </Text>
                <Text style={s.orderMeta}>
                  {formatOrderId(order.id)} · {formatTime(order.created_at)}
                </Text>
              </View>
              <View style={s.rowRight}>
                <View
                  style={[
                    s.badge,
                    order.payment === "cash" ? s.badgeCash : s.badgeKhqr,
                  ]}
                >
                  <Text
                    style={[
                      s.badgeText,
                      order.payment === "cash"
                        ? s.badgeCashText
                        : s.badgeKhqrText,
                    ]}
                  >
                    {order.payment === "cash" ? "Cash" : "KHQR"}
                  </Text>
                </View>
                <Text style={s.amount}>
                  {order.currency === "riel"
                    ? formatRiel(order.total_amount)
                    : formatCurrency(order.total_amount)}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
      <View style={{ marginBottom: 10 }} />
    </>
  );
}

function MetricCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <View style={s.metricCard}>
      <Text style={s.metricLabel}>{label}</Text>
      <Text style={s.metricValue}>{value}</Text>
      {sub && <Text style={s.metricSub}>{sub}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: AppColors.background2,
    borderRadius: 10,
    padding: 12,
    borderColor: AppColors.grey + 33,
    borderWidth: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: AppColors.grey,
    marginBottom: 4,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "500",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  metricSub: {
    fontSize: 18,
    color: AppColors.textPrimary + 90,
    marginTop: 2,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  tableCard: {
    backgroundColor: AppColors.background2,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  tableHeaderSub: {
    fontSize: 12,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  orderId: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1a1a1a",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  orderMeta: {
    fontSize: 11,
    color: AppColors.grey,
    marginTop: 2,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeCash: { backgroundColor: "#e6f4ea" },
  badgeKhqr: { backgroundColor: "#e3f2fd" },
  badgeText: { fontSize: 11, fontFamily: AppFonts.regular },
  badgeCashText: { color: "#2e7d32" },
  badgeKhqrText: { color: "#1565c0" },
  amount: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#aaa",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
});
