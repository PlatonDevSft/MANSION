import { z } from "zod";
const row = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  last_updated: z.string().datetime(),
  price_change_percentage_24h: z.number().finite().nullable(),
  sparkline_in_7d: z.object({ price: z.array(z.number().finite().positive()) }),
});
export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  change: number;
  points: number[];
  updatedAt: string;
}
export function parseMarkets(input: unknown): MarketAsset[] {
  const parsed = z.array(row).parse(input);
  const order = ["bitcoin", "ethereum", "solana", "binancecoin", "ripple"];
  return order.flatMap((id) => {
    const a = parsed.find((a) => a.id === id);
    if (
      !a ||
      a.price_change_percentage_24h === null ||
      a.sparkline_in_7d.price.length < 25
    )
      return [];
    return [
      {
        id: a.id,
        symbol: a.symbol.toUpperCase(),
        name: a.name,
        change: a.price_change_percentage_24h,
        points: a.sparkline_in_7d.price.slice(-25),
        updatedAt: a.last_updated,
      },
    ];
  });
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
