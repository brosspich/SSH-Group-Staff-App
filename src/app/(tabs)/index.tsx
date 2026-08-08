import DateRangePicker, {
  DateRange,
} from "@/components/daterangpicker/DateRangePicker";
import Error from "@/components/error/error";
import Loading from "@/components/loading/loading";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useResponsive } from "@/hooks/useResponsive";
import { useSystemQuery } from "@/hooks/useSystemQuery";
import { styles } from "@/styles/auth.styles";
import { supabase } from "@/utils/supabase";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { BarChart, LineChart } from "react-native-gifted-charts";

// ─── Constants ────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const LOW_STOCK_THRESHOLD = 10;
const FILTER_OPTIONS = [
  "Day",
  "Week",
  "Month",
  "Year",
  "All",
  "Custom",
] as const;

type FilterOption = (typeof FILTER_OPTIONS)[number];

// ─── Phnom Penh timezone helpers ──────────────────────────────────────────────

const PP_OFFSET_MS = 7 * 60 * 60 * 1000;

function getPPNow(): Date {
  return new Date(Date.now() + PP_OFFSET_MS);
}

function ppMidnightUTC(ppYear: number, ppMonth: number, ppDay: number): Date {
  return new Date(Date.UTC(ppYear, ppMonth, ppDay) - PP_OFFSET_MS);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Summary {
  totalOrders: number;
  revenueUSD: number;
  revenueKHR: number;
  spendingUSD: number;
  spendingKHR: number;
  cashUSD: number;
  cashKHR: number;
  khqrUSD: number;
  khqrKHR: number;
}

interface ChartPoint {
  label: string;
  value: number;
}

interface CardConfig {
  label: string;
  value?: string;
  valueUSD?: string;
  valueKHR?: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  isAlert?: boolean;
}

type OrderRow = {
  id: string;
  total_amount: number;
  payment: string;
  currency: "usd" | "riel" | null;
  cash_dollar: number;
  cash_riel: number;
};

type ChartRow = {
  total_amount: number;
  created_at: string;
  currency: "usd" | "riel" | null;
};

// ─── Pure helpers (outside component) ────────────────────────────────────────

function getStartDate(filter: FilterOption): Date | null {
  const pp = getPPNow();
  const y = pp.getUTCFullYear();
  const mo = pp.getUTCMonth();
  const d = pp.getUTCDate();
  const dow = pp.getUTCDay();

  switch (filter) {
    case "Day":
      return ppMidnightUTC(y, mo, d);
    case "Week": {
      const diffToMon = dow === 0 ? -6 : 1 - dow;
      const monPP = new Date(Date.UTC(y, mo, d + diffToMon) + PP_OFFSET_MS);
      return ppMidnightUTC(
        monPP.getUTCFullYear(),
        monPP.getUTCMonth(),
        monPP.getUTCDate(),
      );
    }
    case "Month":
      return ppMidnightUTC(y, mo, 1);
    case "Year":
      return ppMidnightUTC(y, 0, 1);
    default:
      return null;
  }
}

function getDateFilter(
  filter: FilterOption,
  customRange: DateRange | null,
): { start: Date | null; end: Date | null } {
  if (filter === "Custom" && customRange) {
    return { start: customRange.start, end: customRange.end };
  }
  return { start: getStartDate(filter), end: null };
}

const PP_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PP_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function getLabel(dateStr: string, filter: FilterOption): string {
  const ppDate = new Date(new Date(dateStr).getTime() + PP_OFFSET_MS);
  switch (filter) {
    case "Day":
      return `${String(ppDate.getUTCHours()).padStart(2, "0")}:00`;
    case "Week":
      return PP_WEEKDAYS[ppDate.getUTCDay()];
    case "Month":
      return String(ppDate.getUTCDate());
    case "Year":
      return PP_MONTHS[ppDate.getUTCMonth()];
    default:
      return `${PP_MONTHS[ppDate.getUTCMonth()]} '${String(ppDate.getUTCFullYear()).slice(-2)}`;
  }
}

// function formatCompact(num: number): string {
//   if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
//   // if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
//   return num.toFixed(0);
// }

function formatCompact(num: number, currency: "usd" | "riel" = "riel"): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (currency === "usd") {
    // USD amounts are frequently < $1 (e.g. 0.5, 0.25) — toFixed(0) would show "$0"
    return num < 1000
      ? num.toFixed(2)
      : Math.round(num).toLocaleString("en-US");
  }
  // KHR has no cents — always whole numbers, but still needs comma separators
  return Math.round(num).toLocaleString("en-US");
}

// ─── Dashboard Screen ─────────────────────────────────────────────────────────

export default function Index() {
  const [filter, setFilter] = useState<FilterOption>("Day");
  const [summary, setSummary] = useState<Summary | null>(null);

  const [revenueUSDPoints, setRevenueUSDPoints] = useState<ChartPoint[]>([]);
  const [revenueKHRPoints, setRevenueKHRPoints] = useState<ChartPoint[]>([]);
  const [chartCurrency, setChartCurrency] = useState<"usd" | "riel">("usd");
  const [ordersPoints, setOrdersPoints] = useState<ChartPoint[]>([]);

  const activeRevenuePoints =
    chartCurrency === "usd" ? revenueUSDPoints : revenueKHRPoints;
  const maxRevenueVal =
    Math.max(...activeRevenuePoints.map((p) => p.value), 0) || 1;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customRange, setCustomRange] = useState<DateRange | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ── Refs to always hold the latest filter + range (no stale closure) ──────
  const filterRef = useRef<FilterOption>("Day");
  const customRangeRef = useRef<DateRange | null>(null);

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const { isMobile } = useResponsive();

  // On tablet: subtract sidebar width (200) + padding
  const availableWidth = isTablet ? width - 200 - 32 : width - 32;
  const numCols = isTablet ? 4 : 2;
  const CARD_WIDTH = (availableWidth - CARD_GAP * (numCols - 1)) / numCols;

  const { from, resolveTable, system_id, ready } = useSystemQuery();

  const [lowStockCount, setLowStockCount] = useState(0);

  // Keep refs in sync with state
  useEffect(() => {
    // if (!ready) return;
    filterRef.current = filter;
  }, [filter]);
  useEffect(() => {
    // if (!ready) return;
    customRangeRef.current = customRange;
  }, [customRange]);

  // ── Live Clock ───────────────────────────────────────────────────────────

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Data Fetching ────────────────────────────────────────────────────────

  const fetchSummary = useCallback(
    async (currentFilter: FilterOption, range: DateRange | null) => {
      if (!ready) return;
      const { start, end } = getDateFilter(currentFilter, range);

      // ── Query Orders for Revenue, Cash, KHQR ──
      let ordersQuery = from(
        "pos-orders",
        "id, total_amount, payment, currency, cash_dollar, cash_riel",
      );

      if (start)
        ordersQuery = ordersQuery.gte("created_at", start.toISOString());
      if (end) ordersQuery = ordersQuery.lt("created_at", end.toISOString());

      const { data: orders, error: ordersErr } = await ordersQuery;
      if (ordersErr) throw ordersErr;

      type DashOrderRow = {
        id: string;
        total_amount: number;
        payment: string;
        currency: string;
      };

      const rows: DashOrderRow[] = (orders ?? []).map((o: any) => {
        const pStr = String(o.payment || "").toLowerCase();
        const payment =
          pStr.includes("khqr") || pStr.includes("qr") ? "khqr" : "cash";
        const cStr = String(o.currency || "").toLowerCase();
        const isRielBool =
          cStr === "riel" ||
          cStr === "khr" ||
          (o.cash_riel != null && Number(o.cash_riel) > 0);
        return {
          id: String(o.id || ""),
          payment,
          currency: isRielBool ? "riel" : "usd",
          total_amount: Number(o.total_amount ?? 0),
        };
      });
      const isRiel = (o: DashOrderRow) => o.currency === "riel";

      const totalOrders = rows.length;

      const revenueUSD = rows
        .filter((o: DashOrderRow) => !isRiel(o))
        .reduce(
          (sum: number, o: DashOrderRow) => sum + Number(o.total_amount),
          0,
        );
      const revenueKHR = rows
        .filter(isRiel)
        .reduce(
          (sum: number, o: DashOrderRow) => sum + Number(o.total_amount),
          0,
        );

      const cashRows = rows.filter((o: DashOrderRow) => o.payment === "cash");
      const cashUSD = cashRows
        .filter((o: DashOrderRow) => !isRiel(o))
        .reduce(
          (sum: number, o: DashOrderRow) => sum + Number(o.total_amount),
          0,
        );
      const cashKHR = cashRows
        .filter(isRiel)
        .reduce(
          (sum: number, o: DashOrderRow) => sum + Number(o.total_amount),
          0,
        );

      const khqrRows = rows.filter((o: DashOrderRow) => o.payment === "khqr");
      const khqrUSD = khqrRows
        .filter((o: DashOrderRow) => !isRiel(o))
        .reduce(
          (sum: number, o: DashOrderRow) => sum + Number(o.total_amount),
          0,
        );
      const khqrKHR = khqrRows
        .filter(isRiel)
        .reduce(
          (sum: number, o: DashOrderRow) => sum + Number(o.total_amount),
          0,
        );

      // ── Query Stocks for Total Spend (price, price_currency, price_date) ──
      let stocksQuery = from("pos-stocks", "price, price_currency, price_date");
      if (start)
        stocksQuery = stocksQuery.gte("price_date", start.toISOString());
      if (end) stocksQuery = stocksQuery.lt("price_date", end.toISOString());

      const { data: stocks, error: stocksErr } = await stocksQuery;
      if (stocksErr) throw stocksErr;

      let spendingUSD = 0;
      let spendingKHR = 0;
      const stockRows = (stocks ?? []) as {
        price: number | null;
        price_currency: "usd" | "riel" | null;
        price_date: string | null;
      }[];

      for (const s of stockRows) {
        if (s.price != null) {
          if (s.price_currency === "riel") {
            spendingKHR += Number(s.price);
          } else {
            spendingUSD += Number(s.price);
          }
        }
      }

      setSummary({
        totalOrders,
        revenueUSD,
        revenueKHR,
        spendingUSD,
        spendingKHR,
        cashUSD,
        cashKHR,
        khqrUSD,
        khqrKHR,
      });
    },
    [from, ready],
  );

  const fetchCharts = useCallback(
    async (currentFilter: FilterOption, range: DateRange | null) => {
      if (!ready) return;
      const { start, end } = getDateFilter(currentFilter, range);

      let q = from("pos-orders", "total_amount, created_at, currency");
      if (start) q = q.gte("created_at", start.toISOString());
      if (end) q = q.lt("created_at", end.toISOString());

      const { data, error: err } = await q.order("created_at");
      if (err) throw err;

      // ── Explicitly type ──
      const rows = (data ?? []) as ChartRow[];

      const revenueUSD: Record<string, number> = {};
      const revenueKHR: Record<string, number> = {};
      const orderCount: Record<string, number> = {};
      for (const row of rows) {
        const key = getLabel(row.created_at, currentFilter);
        if (row.currency === "riel") {
          revenueKHR[key] = (revenueKHR[key] ?? 0) + Number(row.total_amount);
        } else if (row.currency === "usd") {
          revenueUSD[key] = (revenueUSD[key] ?? 0) + Number(row.total_amount);
        }
        orderCount[key] = (orderCount[key] ?? 0) + 1;
      }
      setRevenueUSDPoints(
        Object.entries(revenueUSD).map(([label, value]) => ({ label, value })),
      );
      setRevenueKHRPoints(
        Object.entries(revenueKHR).map(([label, value]) => ({ label, value })),
      );
      setOrdersPoints(
        Object.entries(orderCount).map(([label, value]) => ({ label, value })),
      );
    },
    [from, ready],
  );

  const fetchLowStock = useCallback(async () => {
    if (!ready) return;
    const { data, error } = await from("pos-stocks", "id, qty").lt(
      "qty",
      LOW_STOCK_THRESHOLD,
    );
    if (!error) setLowStockCount((data ?? []).length);
  }, [from, ready]);

  const load = useCallback(
    async (
      currentFilter: FilterOption,
      isRefresh = false,
      range: DateRange | null = null,
    ) => {
      if (!isRefresh) setLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchSummary(currentFilter, range),
          fetchCharts(currentFilter, range),
          fetchLowStock(),
        ]);
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchSummary, fetchCharts, fetchLowStock],
  );

  // ── Initial Load ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!ready) return;
    load("Day", false, null);
  }, [ready]);

  // ── Real-time Subscription ───────────────────────────────────────────────

  useEffect(() => {
    if (!ready) return;

    // Unique name prevents "already subscribed" collisions on re-runs
    const channelName = `dashboard-realtime-${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pos_admin_data" },
        (payload) => {
          const record = payload.new || payload.old;
          if (record && (record as any)["system-id"] === system_id) {
            load(filterRef.current, true, customRangeRef.current);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ready, system_id]);

  // ── Filter Change ────────────────────────────────────────────────────────

  const handleFilterChange = (f: FilterOption) => {
    if (f === filter) return;
    if (f === "Custom") {
      setShowDatePicker(true);
      return;
    }
    setCustomRange(null);
    customRangeRef.current = null;
    setFilter(f);
    load(f, false, null);
  };

  // ── Pull-to-refresh — reads from refs, never stale ───────────────────────

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    load(filterRef.current, true, customRangeRef.current);
  }, [load]);

  // ── Cards ────────────────────────────────────────────────────────────────

  const cards: CardConfig[] = summary
    ? [
        {
          label: "Total Revenue",
          valueUSD: `$${summary.revenueUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          valueKHR: `${Math.round(summary.revenueKHR).toLocaleString("en-US")}៛`,
          icon: "attach-money",
          color: "#4CAF82",
        },
        {
          label: "Total Spend",
          valueUSD: `$${summary.spendingUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          valueKHR: `${Math.round(summary.spendingKHR).toLocaleString("en-US")}៛`,
          icon: "attach-money",
          color: "#ff2f00",
        },
        {
          label: "Total Cash",
          valueUSD: `$${summary.cashUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          valueKHR: `${Math.round(summary.cashKHR).toLocaleString("en-US")}៛`,
          icon: "payments",
          color: "#7C6FF7",
        },
        {
          label: "Total KHQR",
          valueUSD: `$${summary.khqrUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          valueKHR: `${Math.round(summary.khqrKHR).toLocaleString("en-US")}៛`,
          icon: "qr-code",
          color: "#E91E8C",
        },
        {
          label: "Total Orders",
          value: summary.totalOrders.toString(),
          icon: "receipt-long",
          color: "#eb51ff",
        },
      ]
    : [];

  // ── Render ───────────────────────────────────────────────────────────────

  if (error) {
    return (
      <Error
        title="Failed to load data"
        txtError={error}
        onPress={() => load(filterRef.current, false, customRangeRef.current)}
      />
    );
  }

  return (
    <View style={styless.safe}>
      <ScrollView
        style={styless.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={AppColors.secondary}
            colors={[AppColors.secondary]}
            progressBackgroundColor={AppColors.background}
          />
        }
      >
        {/* ── Header ── */}
        <View style={styless.header}>
          <View>
            <Text style={styless.headerTitle}>Dashboard</Text>
            <Text style={styless.headerDate}>
              {now.toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </Text>
          </View>
          <View style={styless.conIcon}>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styless.refreshIcon}
            >
              <Ionicons
                name="calendar"
                size={24}
                color={
                  filter === "Custom"
                    ? AppColors.secondary
                    : AppColors.textSecondary
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                load(filterRef.current, false, customRangeRef.current)
              }
              style={styless.refreshIcon}
            >
              <MaterialIcons
                name="refresh"
                size={24}
                color={AppColors.secondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Filters ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styless.filterRow}
        >
          {FILTER_OPTIONS.map((f) => {
            const isActive = f === filter;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => handleFilterChange(f)}
                style={[
                  styless.filterChip,
                  isActive && styless.filterChipActive,
                ]}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styless.filterChipText,
                    isActive && styless.filterChipTextActive,
                  ]}
                >
                  {f === "Custom" && filter === "Custom" && customRange
                    ? (() => {
                        const s = new Date(
                          customRange.start.getTime() + PP_OFFSET_MS,
                        );
                        const e = new Date(
                          customRange.end.getTime() + PP_OFFSET_MS - 1,
                        );
                        return `${PP_MONTHS[s.getUTCMonth()]} ${s.getUTCDate()} – ${PP_MONTHS[e.getUTCMonth()]} ${e.getUTCDate()}`;
                      })()
                    : f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              minHeight: 450,
              width: "100%",
            }}
          >
            <Loading />
          </View>
        ) : (
          <>
            {/* ── Summary Cards ── */}
            {summary && (
              <View
                style={[styless.gridContainer, { gap: isMobile ? 10 : 12 }]}
              >
                {cards.map((card) => (
                  <SummaryCard
                    key={card.label}
                    card={card}
                    width={CARD_WIDTH}
                  />
                ))}
              </View>
            )}

            {/* ── Revenue Chart ── */}
            <View style={styless.chartHeaderRow}>
              <Text style={styless.chartSectionTitle}>Revenue</Text>
              <View style={styless.currencyToggleContainer}>
                <TouchableOpacity
                  onPress={() => setChartCurrency("usd")}
                  style={[
                    styless.currencyToggleBtn,
                    chartCurrency === "usd" && styless.currencyToggleBtnActive,
                  ]}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styless.currencyToggleText,
                      chartCurrency === "usd" &&
                        styless.currencyToggleTextActive,
                    ]}
                  >
                    USD
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setChartCurrency("riel")}
                  style={[
                    styless.currencyToggleBtn,
                    chartCurrency === "riel" && styless.currencyToggleBtnActive,
                  ]}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styless.currencyToggleText,
                      chartCurrency === "riel" &&
                        styless.currencyToggleTextActive,
                    ]}
                  >
                    KHR
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            {activeRevenuePoints.length > 0 ? (
              <View style={styless.chartCard}>
                <BarChart
                  data={activeRevenuePoints.map((point) => {
                    return {
                      value: point.value,
                      label: point.label,
                      frontColor: AppColors.secondary,
                      gradientColor: AppColors.primary,
                      topLabelComponent: () => {
                        const CHART_HEIGHT = 220; // matches your <BarChart height={220} />
                        const barPixelHeight =
                          (point.value / (maxRevenueVal * 1.25)) * CHART_HEIGHT;

                        return (
                          <View
                            style={{
                              width: 1000,
                              alignItems: "center",
                              justifyContent: "center",
                              transform: [{ translateY: barPixelHeight / 2 }],
                            }}
                          >
                            <View style={{ transform: [{ rotate: "-90deg" }] }}>
                              <Text
                                style={styless.barTopLabel}
                                numberOfLines={1}
                              >
                                {chartCurrency === "usd"
                                  ? `$${formatCompact(point.value, "usd")}`
                                  : `${formatCompact(point.value, "riel")}៛`}
                              </Text>
                            </View>
                          </View>
                        );
                      },
                    };
                  })}
                  barWidth={25}
                  barBorderRadius={0}
                  maxValue={maxRevenueVal * 1.25}
                  height={220}
                  showYAxisIndices={true}
                  formatYLabel={(val: any) => {
                    const parsedVal = Number(val);
                    if (isNaN(parsedVal)) return val;
                    return chartCurrency === "usd"
                      ? `$${formatCompact(parsedVal, "usd")}`
                      : `${formatCompact(parsedVal, "riel")}៛`;
                  }}
                  yAxisTextStyle={styless.yAxisLabel}
                  xAxisLabelTextStyle={styless.xAxisLabel}
                  dashGap={0}
                  isAnimated={true}
                  animationDuration={500}
                  spacing={24}
                  backgroundColor={AppColors.background2}
                  roundedTop={true}
                  showGradient={true}
                  gradientColor={AppColors.primary}
                  showLine={false}
                  rulesType="solid"
                  rulesColor="rgba(0,0,0,0.05)"
                  xAxisColor="rgba(0,0,0,0.1)"
                  yAxisColor="rgba(0,0,0,0.1)"
                />
              </View>
            ) : (
              <EmptyChart />
            )}

            {/* ── Orders Chart ── */}
            <Text style={styless.sectionTitle}>Orders</Text>
            {ordersPoints.length > 0 ? (
              <View style={styless.chartCard}>
                <LineChart
                  data={ordersPoints.map((point) => ({
                    value: point.value,
                    label: point.label,
                    dataPointColor: AppColors.secondary,
                    dataPointRadius: 4,
                  }))}
                  height={220}
                  showYAxisIndices={true}
                  yAxisTextStyle={styless.yAxisLabel}
                  xAxisLabelTextStyle={styless.xAxisLabel}
                  isAnimated={true}
                  animationDuration={500}
                  curved={true}
                  color={AppColors.secondary}
                  thickness={2.5}
                  hideDataPoints={false}
                  dataPointsColor={AppColors.secondary}
                  dataPointsRadius={4}
                  focusEnabled={true}
                  showStripOnFocus={true}
                  showTextOnFocus={true}
                  stripOpacity={0.1}
                  stripColor={AppColors.secondary}
                  rulesType="solid"
                  rulesColor="rgba(0,0,0,0.05)"
                  xAxisColor="rgba(0,0,0,0.1)"
                  yAxisColor="rgba(0,0,0,0.1)"
                  dataPointLabelComponent={(item: any) => (
                    <View>
                      <Text style={styless.lineDataPointLabel}>
                        {Math.round(item.value)}
                      </Text>
                    </View>
                  )}
                  renderTooltip={(item: any) => (
                    <View style={styless.tooltipContainer}>
                      <Text style={styless.tooltipLabel}>{item.label}</Text>
                      <Text style={styless.tooltipValue}>
                        {Math.round(item.value)} orders
                      </Text>
                    </View>
                  )}
                />
              </View>
            ) : (
              <EmptyChart />
            )}

            <View style={{ height: 32 }} />
          </>
        )}
      </ScrollView>

      {/* Footer */}
      {lowStockCount > 0 && (
        <View style={styles.footer}>
          <Text style={[styles.details, { color: AppColors.red }]}>
            {lowStockCount} Stock{lowStockCount > 1 ? "s" : ""} is low
          </Text>
          <TouchableOpacity
            style={[styles.btn, { marginTop: 10 }]}
            onPress={() => router.push("/stock/stockcontroller" as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.footerTxt}>Check Stock</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Date Range Picker Modal ── */}
      <DateRangePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onApply={(range: any) => {
          setCustomRange(range);
          customRangeRef.current = range; // update ref immediately
          setFilter("Custom");
          filterRef.current = "Custom";
          load("Custom", false, range);
        }}
        initialRange={customRange ?? undefined}
      />
    </View>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({ card, width }: { card: CardConfig; width: number }) {
  return (
    <View
      style={[
        styless.card,
        { width, borderWidth: 1.5, borderColor: `${card.color}66` },
        Platform.select({
          web: { boxShadow: `0px 2px 12px ${card.color}4D` },
          default: { shadowColor: card.color },
        }),
      ]}
    >
      <View style={styless.cardTop}>
        <View
          style={[styless.cardIconBox, { backgroundColor: `${card.color}1F` }]}
        >
          <MaterialIcons name={card.icon} size={16} color={card.color} />
        </View>
        <Text style={styless.cardLabel} numberOfLines={1}>
          {card.label}
        </Text>
      </View>
      {card.valueUSD ? (
        <View style={styless.cardValueContainer}>
          <Text
            style={[
              styless.currencyAmount,
              card.isAlert && { color: card.color },
            ]}
          >
            {card.valueUSD}
          </Text>
          <Text
            style={[
              styless.currencyAmount,
              card.isAlert && { color: card.color },
            ]}
          >
            {card.valueKHR}
          </Text>
        </View>
      ) : (
        <Text
          style={[styless.cardValue, card.isAlert && { color: card.color }]}
        >
          {card.value}
        </Text>
      )}
    </View>
  );
}

// ─── Empty Chart ──────────────────────────────────────────────────────────────

function EmptyChart() {
  return (
    <View style={styless.emptyChart}>
      <MaterialIcons name="bar-chart" size={36} color="rgba(0,0,0,0.15)" />
      <Text style={styless.emptyChartText}>No data</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CARD_GAP = 10;
const CARD_WIDTH = (SCREEN_WIDTH - 32 - CARD_GAP) / 2;

const styless = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AppColors.background },
  scroll: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.background,
    gap: 12,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: AppColors.textPrimary,
    letterSpacing: -0.5,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  headerDate: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginTop: 2,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  conIcon: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  refreshIcon: { padding: 6 },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    flexDirection: "row",
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: `${AppColors.secondary}66`,
    backgroundColor: AppColors.background,
  },
  filterChipActive: {
    backgroundColor: AppColors.secondary,
    borderColor: AppColors.secondary,

    ...Platform.select({
      web: {
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
      },
      default: {
        shadowColor: AppColors.secondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
      },
    }),
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.textSecondary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  filterChipTextActive: { color: AppColors.background2 },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: CARD_GAP,
    marginTop: 4,
    marginBottom: 4,
  },
  // styles.card — remove the width property
  card: {
    // width: CARD_WIDTH,  ← delete this line
    backgroundColor: AppColors.background2,
    borderRadius: 18,
    padding: 10,
    justifyContent: "space-between",
    minHeight: 75,

    ...Platform.select({
      web: {
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
      },
      default: {
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 3,
      },
    }),
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 7,
  },
  cardIconBox: {
    width: 25,
    height: 25,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    color: AppColors.textSecondary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.textPrimary,
    letterSpacing: -0.5,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  cardValueContainer: {
    gap: 2,
  },
  currencyLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: AppColors.textSecondary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  currencyAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.textPrimary,
    letterSpacing: -0.5,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: AppColors.textPrimary,
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  chartHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  chartSectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: AppColors.textPrimary,
    paddingHorizontal: 16,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  currencyToggleContainer: {
    flexDirection: "row",
    backgroundColor: AppColors.background,
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: `${AppColors.secondary}22`,
  },
  currencyToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  currencyToggleBtnActive: {
    backgroundColor: AppColors.secondary,
  },
  currencyToggleText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.textSecondary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  currencyToggleTextActive: {
    color: AppColors.background2,
  },
  chartCard: {
    marginHorizontal: 16,
    backgroundColor: AppColors.background2,
    borderRadius: 20,
    paddingVertical: 12,
    paddingLeft: 0,
    overflow: "hidden",

    ...Platform.select({
      web: {
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
      },
    }),
  },
  chartStyle: { borderRadius: 16 },
  emptyChart: {
    marginHorizontal: 16,
    height: 150,
    backgroundColor: AppColors.background2,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,

    ...Platform.select({
      web: {
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 2,
      },
    }),
  },
  emptyChartText: {
    fontSize: 13,
    color: "rgba(0,0,0,0.3)",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  barTopLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  yAxisLabel: {
    color: AppColors.textSecondary,
    fontSize: 10,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  xAxisLabel: {
    color: AppColors.textSecondary,
    fontSize: 10,
    fontWeight: "500",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  lineDataPointLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: AppColors.textSecondary,
    marginTop: -18,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  tooltipContainer: {
    backgroundColor: AppColors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  tooltipLabel: {
    color: AppColors.background2,
    fontSize: 10,
    opacity: 0.9,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  tooltipValue: {
    color: AppColors.background2,
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
