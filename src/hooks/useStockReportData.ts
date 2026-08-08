import { useSystemQuery } from "@/hooks/useSystemQuery";
import { useEffect, useState } from "react";

export type StockMovementRow = {
  id: string;
  stock_id: string;
  stock_name: string;
  type: "in" | "out";
  qty: number;
  unit: string | null;
  price: number | null;
  currency: "usd" | "riel" | null;
  source: "manual" | "sale";
  order_id: string | null;
  note: string | null;
  created_at: string;
};

export type StockSummary = {
  totalMovements: number;
  totalInMovements: number;
  totalOutMovements: number;
  totalQtyIn: number;
  totalQtyOut: number;
  totalValueInUSD: number;
  totalValueInKHR: number;
};

export function useStockReportData(startUTC: Date, endUTC: Date) {
  const [movements, setMovements] = useState<StockMovementRow[]>([]);
  const [summary, setSummary] = useState<StockSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { from, ready } = useSystemQuery();

  useEffect(() => {
    if (!ready) return;
    fetch();
  }, [startUTC.getTime(), endUTC.getTime(), ready]);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data: stocksData, error } = await from(
        "pos-stocks",
        "id, name, unit, stock_movements",
      );

      if (error || !stocksData) {
        console.error("useStockReportData error:", error);
        setLoading(false);
        return;
      }

      const allMovements: StockMovementRow[] = [];
      let totalQtyIn = 0;
      let totalQtyOut = 0;
      let totalInMovements = 0;
      let totalOutMovements = 0;
      let totalValueInUSD = 0;
      let totalValueInKHR = 0;

      stocksData.forEach((stock: any) => {
        const stockMovements: any[] = stock.stock_movements ?? [];
        stockMovements.forEach((m: any) => {
          const moveDate = new Date(m.created_at);
          if (moveDate >= startUTC && moveDate < endUTC) {
            const qty = m.qty ?? 0;
            const type = m.type;

            if (type === "in") {
              totalQtyIn += qty;
              totalInMovements += 1;
              if (m.price != null) {
                if (m.currency === "riel") {
                  totalValueInKHR += m.price;
                } else {
                  totalValueInUSD += m.price;
                }
              }
            } else if (type === "out") {
              totalQtyOut += qty;
              totalOutMovements += 1;
            }

            allMovements.push({
              id: m.id,
              stock_id: stock.id,
              stock_name: stock.name,
              type: type,
              qty: qty,
              unit: m.unit ?? stock.unit ?? null,
              price: m.price ?? null,
              currency: m.currency ?? null,
              source: m.source ?? "manual",
              order_id: m.order_id ?? null,
              note: m.note ?? null,
              created_at: m.created_at,
            });
          }
        });
      });

      // Sort by date ascending to match Sales Report list order
      allMovements.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );

      setMovements(allMovements);
      setSummary({
        totalMovements: allMovements.length,
        totalInMovements,
        totalOutMovements,
        totalQtyIn,
        totalQtyOut,
        totalValueInUSD,
        totalValueInKHR,
      });
    } catch (err) {
      console.error("fetch stock report error:", err);
    } finally {
      setLoading(false);
    }
  };

  return { movements, summary, loading };
}
