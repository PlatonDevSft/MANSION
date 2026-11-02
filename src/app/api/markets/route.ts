import { NextResponse } from "next/server";
import { marketInstruments, parseYahooChart } from "@/lib/markets";
export const runtime = "nodejs";
export async function GET() {
  const results = await Promise.allSettled(
    marketInstruments.map(async (instrument) => {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(instrument.yahoo)}?interval=15m&range=1d`,
        {
          next: { revalidate: 300 },
          signal: AbortSignal.timeout(6000),
          headers: { accept: "application/json" },
        },
      );
      if (!response.ok) throw new Error("Provider unavailable");
      return parseYahooChart(await response.json(), instrument);
    }),
  );
  const assets = results.flatMap((r) =>
    r.status === "fulfilled" ? [r.value] : [],
  );
  if (assets.length !== marketInstruments.length)
    return NextResponse.json(
      {
        error:
          "Источник мини-графиков временно недоступен. Доступна официальная лента TradingView.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  return NextResponse.json(
    {
      source: "Yahoo Finance",
      currency: "USD",
      period: "session",
      sparklinePeriod: "session",
      assets,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300",
      },
    },
  );
}
