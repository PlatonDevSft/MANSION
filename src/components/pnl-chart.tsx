"use client";
import { useEffect, useRef } from "react";
import {
  createChart,
  LineSeries,
  ColorType,
  type UTCTimestamp,
} from "lightweight-charts";
import { Trade, pnl } from "@/lib/journal";
import Decimal from "decimal.js";
export function PnlChart({ trades }: { trades: Trade[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, {
      autoSize: true,
      height: 280,
      layout: {
        background: { type: ColorType.Solid, color: "#111b16" },
        textColor: "#929e96",
      },
      grid: {
        vertLines: { color: "#ffffff05" },
        horzLines: { color: "#ffffff08" },
      },
      rightPriceScale: { borderColor: "#ffffff12" },
      timeScale: { borderColor: "#ffffff12" },
    });
    const series = chart.addSeries(LineSeries, {
      color: "#64d8b1",
      lineWidth: 2,
      priceLineVisible: false,
    });
    let sum = new Decimal(0);
    const points = new Map<number, number>();
    for (const t of [...trades]
      .filter((t) => pnl(t) !== null)
      .sort((a, b) => (a.exitedAt ?? "").localeCompare(b.exitedAt ?? ""))) {
      sum = sum.plus(pnl(t)!);
      points.set(Math.floor(Date.parse(t.exitedAt!) / 1000), sum.toNumber());
    }
    series.setData(
      [...points].map(([time, value]) => ({
        time: time as UTCTimestamp,
        value,
      })),
    );
    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [trades]);
  return <div ref={ref} aria-label="График накопленного реализованного P&L" />;
}
