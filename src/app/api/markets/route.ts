import { NextResponse } from "next/server";
import { parseMarkets } from "@/lib/markets";
export const runtime = "nodejs";
export async function GET() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,binancecoin,ripple&sparkline=true&price_change_percentage=24h",
      {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(8000),
        headers: { accept: "application/json" },
      },
    );
    if (!response.ok) throw new Error("Market provider unavailable");
    const assets = parseMarkets(await response.json());
    if (assets.length === 0) throw new Error("No valid market data");
    return NextResponse.json(
      {
        source: "CoinGecko",
        currency: "USD",
        period: "24h",
        sparklinePeriod: "approx-24h",
        assets,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Источник котировок временно недоступен. Попробуйте позже." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
