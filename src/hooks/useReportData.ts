import { useSystemQuery } from "@/hooks/useSystemQuery";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

async function getStoredExchangeRate(): Promise<number> {
  try {
    const stored = await AsyncStorage.getItem("currency_exchange_rate");
    if (stored) {
      const rate = parseFloat(stored);
      if (!isNaN(rate) && rate > 0) return rate;
    }
  } catch (e) {
    console.warn("Failed to load exchange rate", e);
  }
  return 4100;
}

export type OrderRow = {
  id: string;
  created_at: string;
  total_amount: number;
  cash_dollar: number | null;
  cash_riel: number | null;
  payment: "cash" | "khqr";
  currency: "usd" | "riel";
  item_count: number;
  product_names: string[];
};

export type Summary = {
  totalOrders: number;
  totalUSD: number;
  totalKHR: number;
  cashUSD: number;
  cashKHR: number;
  khqrUSD: number;
  khqrKHR: number;
  exchangeRate: number;
};

export function formatRiel(riel: number) {
  return `${riel.toLocaleString()} ៛`;
}

export function useReportData(startUTC: Date, endUTC: Date) {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const { from, ready } = useSystemQuery();

  useEffect(() => {
    if (!ready) return;
    fetch();
  }, [startUTC.getTime(), endUTC.getTime(), ready]);

  const fetch = async () => {
    setLoading(true);
    const rate = await getStoredExchangeRate();

    const { data: ordersData, error } = await from(
      "pos-orders",
      "id, created_at, total_amount, cash_dollar, cash_riel, payment, currency, items",
    )
      .gte("created_at", startUTC.toISOString())
      .lt("created_at", endUTC.toISOString())
      .order("created_at", { ascending: true });

    if (error || !ordersData) {
      console.error("useReportData error:", error);
      setLoading(false);
      return;
    }

    const rows: OrderRow[] = ordersData.map((o: any) => {
      const items: { name: string; quantity: number }[] = o.items ?? [];
      const product_names = [...new Set(items.map((i) => i.name))];
      const item_count = items.reduce((s, i) => s + i.quantity, 0);

      const pStr = String(o.payment || "").toLowerCase();
      const payment =
        pStr.includes("khqr") || pStr.includes("qr") ? "khqr" : "cash";

      const cStr = String(o.currency || "").toLowerCase();
      const isRiel =
        cStr === "riel" ||
        cStr === "khr" ||
        (o.cash_riel != null && Number(o.cash_riel) > 0);

      return {
        id: o.id,
        created_at: o.created_at,
        total_amount: Number(o.total_amount ?? 0),
        cash_dollar: o.cash_dollar != null ? Number(o.cash_dollar) : null,
        cash_riel: o.cash_riel != null ? Number(o.cash_riel) : null,
        payment,
        currency: isRiel ? "riel" : "usd",
        item_count,
        product_names,
      };
    });

    const cashUSD = rows
      .filter((r) => r.payment === "cash" && r.currency === "usd")
      .reduce((s, r) => s + r.total_amount, 0);
    const cashKHR = rows
      .filter((r) => r.payment === "cash" && r.currency === "riel")
      .reduce((s, r) => s + r.total_amount, 0);
    const khqrUSD = rows
      .filter((r) => r.payment === "khqr" && r.currency === "usd")
      .reduce((s, r) => s + r.total_amount, 0);
    const khqrKHR = rows
      .filter((r) => r.payment === "khqr" && r.currency === "riel")
      .reduce((s, r) => s + r.total_amount, 0);

    const totalUSD = cashUSD + khqrUSD;
    const totalKHR = cashKHR + khqrKHR;

    setOrders(rows);
    setSummary({
      totalOrders: rows.length,
      totalUSD,
      totalKHR,
      cashUSD,
      cashKHR,
      khqrUSD,
      khqrKHR,
      exchangeRate: rate,
    });
    setLoading(false);
  };

  return { orders, summary, loading };
}

// ─── Date range helpers ───────────────────────────────────────────────────────

const PP_OFFSET_MS = 7 * 60 * 60 * 1000;

function ppMidnightUTC(y: number, mo: number, d: number): Date {
  return new Date(Date.UTC(y, mo, d) - PP_OFFSET_MS);
}

function getPPNow() {
  return new Date(Date.now() + PP_OFFSET_MS);
}

export function getDayRange(date: Date): { start: Date; end: Date } {
  return { start: date, end: new Date(date.getTime() + 24 * 60 * 60 * 1000) };
}

export function getWeekRange(): { start: Date; end: Date } {
  const pp = getPPNow();
  const y = pp.getUTCFullYear(),
    mo = pp.getUTCMonth(),
    d = pp.getUTCDate();
  const dow = pp.getUTCDay();
  const start = ppMidnightUTC(y, mo, d - dow);
  const end = ppMidnightUTC(y, mo, d - dow + 7);
  return { start, end };
}

export function getMonthRange(
  year: number,
  month: number,
): { start: Date; end: Date } {
  return {
    start: ppMidnightUTC(year, month, 1),
    end: ppMidnightUTC(year, month + 1, 1),
  };
}

export function getYearRange(year: number): { start: Date; end: Date } {
  return {
    start: ppMidnightUTC(year, 0, 1),
    end: ppMidnightUTC(year + 1, 0, 1),
  };
}

export function getTodayPP(): Date {
  const pp = getPPNow();
  return ppMidnightUTC(pp.getUTCFullYear(), pp.getUTCMonth(), pp.getUTCDate());
}

export function formatCurrency(usd: number) {
  return `$${usd.toFixed(2)}`;
}

export function formatKHR(usd: number, rate: number = 4100) {
  return `${Math.round(usd * rate).toLocaleString()} ៛`;
}

export function formatOrderId(id: string) {
  if (!id) return "";
  let upper = id.toUpperCase();
  if (upper.startsWith("ORDER-")) {
    upper = upper.replace("ORDER-", "ORD-");
  }
  return upper;
}

export function formatDate(d: Date) {
  const pp = new Date(d.getTime() + PP_OFFSET_MS);
  return pp.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
