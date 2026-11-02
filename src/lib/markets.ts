import { z } from "zod";
export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  change: number;
  points: number[];
  updatedAt: string;
}
export function sparkline(points: number[], width = 100, height = 30): string {
  if (points.length < 2) return "";
  const min = Math.min(...points),
    max = Math.max(...points),
    range = max - min;
  return points
    .map(
      (v, i) =>
        `${((i / (points.length - 1)) * width).toFixed(2)},${(range === 0 ? height / 2 : height - 3 - ((v - min) / range) * (height - 6)).toFixed(2)}`,
    )
    .join(" ");
}

export const marketInstruments = [
  {
    id: "eurusd",
    symbol: "EUR/USD",
    name: "Евро / доллар",
    yahoo: "EURUSD=X",
    tradingView: "FX:EURUSD",
  },
  {
    id: "gbpusd",
    symbol: "GBP/USD",
    name: "Фунт / доллар",
    yahoo: "GBPUSD=X",
    tradingView: "FX:GBPUSD",
  },
  {
    id: "gold",
    symbol: "GOLD",
    name: "Золото · фьючерс GC",
    yahoo: "GC=F",
    tradingView: "OANDA:XAUUSD",
  },
  {
    id: "nasdaq",
    symbol: "NASDAQ 100",
    name: "NASDAQ 100",
    yahoo: "^NDX",
    tradingView: "NASDAQ:NDX",
  },
  {
    id: "sp500",
    symbol: "S&P 500",
    name: "S&P 500",
    yahoo: "^GSPC",
    tradingView: "SP:SPX",
  },
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    yahoo: "BTC-USD",
    tradingView: "BITSTAMP:BTCUSD",
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    yahoo: "ETH-USD",
    tradingView: "BITSTAMP:ETHUSD",
  },
] as const;
const yahooChart = z.object({
  chart: z.object({
    result: z
      .array(
        z.object({
          meta: z.object({
            chartPreviousClose: z.number().finite().positive(),
          }),
          timestamp: z.array(z.number().finite()),
          indicators: z.object({
            quote: z
              .array(
                z.object({
                  close: z.array(z.number().finite().positive().nullable()),
                }),
              )
              .min(1),
          }),
        }),
      )
      .nullable(),
  }),
});
export function parseYahooChart(
  input: unknown,
  instrument: (typeof marketInstruments)[number],
): MarketAsset {
  const chart = yahooChart.parse(input).chart.result?.[0];
  if (!chart) throw new Error("No chart");
  const samples = chart.timestamp.flatMap((t, i) => {
    const value = chart.indicators.quote[0].close[i];
    return value == null ? [] : [{ at: t, value }];
  });
  if (samples.length < 2) throw new Error("Insufficient chart data");
  const last = samples.at(-1)!;
  return {
    id: instrument.id,
    symbol: instrument.symbol,
    name: instrument.name,
    change: (last.value / chart.meta.chartPreviousClose - 1) * 100,
    points: samples.map((s) => s.value),
    updatedAt: new Date(last.at * 1000).toISOString(),
  };
}
