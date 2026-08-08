import { type ReportPaperSettings } from "@/app/create/custom_report_paper";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { formatCurrency, formatOrderId } from "@/hooks/useReportData";
import {
  type StockMovementRow,
  type StockSummary,
} from "@/hooks/useStockReportData";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Image, Platform, StyleSheet, Text, View } from "react-native";

export interface StockReportPaperProps {
  periodLabel: string;
  reportType: "Daily" | "Weekly" | "Monthly" | "Annual";
  summary: StockSummary | null;
  movements: StockMovementRow[];
  settings?: ReportPaperSettings;
}

export default function CustomStockReportPaper({
  periodLabel,
  reportType,
  summary,
  movements,
  settings,
}: StockReportPaperProps) {
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
            <Text style={s.reportTitle}>{reportType} Stock Report</Text>
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
          label="Total Movements"
          value={`${summary.totalMovements}`}
        />
        <SummaryCard
          label="Value In Added"
          value={formatCurrency(summary.totalValueInUSD)}
          sub={`${summary.totalValueInKHR.toLocaleString()} ៛`}
        />
        <SummaryCard
          label="Total Stock In"
          value={`${summary.totalQtyIn} units`}
        />
        <SummaryCard
          label="Total Stock Out"
          value={`${summary.totalQtyOut} units`}
        />
      </View>

      {/* Movements table */}
      <View style={s.tableSection}>
        <View style={s.tableHeader}>
          <Text style={s.tableTitle}>Movement Details</Text>
          <View style={s.totalBadge}>
            <Text style={s.totalBadgeText}>
              {summary.totalMovements} movements
            </Text>
          </View>
        </View>
        <View style={[s.tableRow, s.tableColHeader]}>
          <Text style={[s.colText, { flex: 3 }]}>Product</Text>
          <Text style={[s.colText, { flex: 2.2 }]}>Details</Text>
          <Text style={[s.colText, { flex: 1.2 }]}>Type</Text>
          <Text style={[s.colText, s.colRight, { flex: 1.5 }]}>Qty</Text>
        </View>
        {movements.length === 0 ? (
          <View style={s.emptyState}>
            <MaterialIcons name="inbox" size={32} color={AppColors.grey} />
            <Text style={s.emptyText}>No movements in this period</Text>
          </View>
        ) : (
          movements.map((move, i) => {
            const isIn = move.type === "in";
            return (
              <View
                key={move.id}
                style={[s.tableRow, i % 2 === 0 ? s.rowEven : s.rowOdd]}
              >
                <View
                  style={{ flex: 3, paddingVertical: 9, paddingHorizontal: 8 }}
                >
                  <Text style={s.cellTextLabel} numberOfLines={2}>
                    {move.stock_name}
                  </Text>
                  <Text style={s.cellTextId} numberOfLines={1}>
                    {move.stock_id}
                  </Text>
                </View>
                <Text style={[s.cellMeta, { flex: 2.2 }]} numberOfLines={4}>
                  {move.order_id
                    ? formatOrderId(move.order_id)
                    : move.note
                      ? move.note
                      : "Manual"}
                  {move.price != null && (
                    <>
                      {"\n"}
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
                </Text>
                <View
                  style={{
                    flex: 1.2,
                    alignItems: "flex-start",
                    paddingHorizontal: 8,
                  }}
                >
                  <View style={isIn ? s.badgeIn : s.badgeOut}>
                    <Text style={isIn ? s.badgeInText : s.badgeOutText}>
                      {isIn ? "In" : "Out"}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    s.cellAmount,
                    { flex: 1.5, color: isIn ? "#2e7d32" : "#c5221f" },
                  ]}
                >
                  {isIn ? "+" : "−"}
                  {move.qty} {move.unit ?? "pcs"}
                </Text>
              </View>
            );
          })
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
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <View style={s.card}>
      <Text style={s.cardLabel}>{label}</Text>
      <Text style={s.cardValue}>{value}</Text>
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
  cardLabel: {
    fontSize: 10,
    color: AppColors.grey,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
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
  cellTextLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  cellTextId: {
    fontSize: 10,
    color: AppColors.grey,
    marginTop: 1,
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
    paddingHorizontal: 8,
    paddingVertical: 9,
    textAlign: "right",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  badgeIn: {
    backgroundColor: "#e6f4ea",
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeInText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#2e7d32",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  badgeOut: {
    backgroundColor: "#fce8e6",
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeOutText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#c5221f",
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
