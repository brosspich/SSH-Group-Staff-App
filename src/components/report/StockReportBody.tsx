import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import {
  formatCurrency,
  formatOrderId,
  formatTime,
} from "@/hooks/useReportData";
import {
  type StockMovementRow,
  type StockSummary,
} from "@/hooks/useStockReportData";
import { StyleSheet, Text, View } from "react-native";
import Loading from "../loading/loading";

interface Props {
  loading: boolean;
  summary: StockSummary | null;
  movements: StockMovementRow[];
}

export function StockReportBody({ loading, summary, movements }: Props) {
  if (loading) return <Loading />;
  if (!summary) return null;

  return (
    <>
      {/* Metric cards */}
      <View style={s.metricGrid}>
        <MetricCard
          label="Total movements"
          value={`${summary.totalMovements}`}
        />
        <MetricCard
          label="Value In Added"
          value={formatCurrency(summary.totalValueInUSD)}
          sub={`${summary.totalValueInKHR.toLocaleString()} ៛`}
        />
        <MetricCard
          label="Total Stock In"
          value={`${summary.totalQtyIn} units`}
        />
        <MetricCard
          label="Total Stock Out"
          value={`${summary.totalQtyOut} units`}
        />
      </View>

      {/* Movements table */}
      <View style={s.tableCard}>
        <View style={s.tableHeader}>
          <Text style={s.tableHeaderText}>Movements</Text>
          <Text style={s.tableHeaderSub}>{summary.totalMovements} total</Text>
        </View>
        {movements.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyText}>No movements in this period</Text>
          </View>
        ) : (
          movements.map((move) => {
            const isIn = move.type === "in";
            return (
              <View key={move.id} style={s.tableRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={s.orderId}>{move.stock_name}</Text>
                  <Text style={s.orderMeta}>
                    {move.order_id
                      ? `${formatOrderId(move.order_id)}`
                      : move.note
                        ? `${move.note}`
                        : "Manual Adjustment"}
                    {move.price != null && (
                      <>
                        {" · "}
                        <Text
                          style={{
                            color: isIn ? "#c5221f" : "#2e7d32",
                            fontWeight: "600",
                          }}
                        >
                          {isIn ? "−" : "+"}
                          {move.currency === "riel"
                            ? `${Math.round(move.price).toLocaleString("en-US")}៛`
                            : `$${move.price.toFixed(2)}`}
                        </Text>
                        {move.source !== "sale" &&
                          ` (Unit: ${
                            move.currency === "riel"
                              ? `${Math.round(move.price / move.qty).toLocaleString("en-US")}៛`
                              : `$${(move.price / move.qty).toFixed(2)}`
                          }/${move.unit ?? "pcs"})`}
                      </>
                    )}
                    {" · "}
                    {formatTime(move.created_at)}
                  </Text>
                </View>
                <View style={s.rowRight}>
                  <View style={[s.badge, isIn ? s.badgeIn : s.badgeOut]}>
                    <Text
                      style={[
                        s.badgeText,
                        isIn ? s.badgeInText : s.badgeOutText,
                      ]}
                    >
                      {isIn ? "Stock In" : "Stock Out"}
                    </Text>
                  </View>
                  <Text
                    style={[s.amount, { color: isIn ? "#2e7d32" : "#c5221f" }]}
                  >
                    {isIn ? "+" : "−"}
                    {move.qty} {move.unit ?? "pcs"}
                  </Text>
                </View>
              </View>
            );
          })
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
  badgeIn: { backgroundColor: "#e6f4ea" },
  badgeOut: { backgroundColor: "#fce8e6" },
  badgeText: { fontSize: 11, fontFamily: AppFonts.regular },
  badgeInText: { color: "#2e7d32" },
  badgeOutText: { color: "#c5221f" },
  amount: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: AppFonts.bold,
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
