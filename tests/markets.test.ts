import { describe, it, expect } from "vitest";
import { parseMarkets, sparkline } from "../src/lib/markets";
const fixture = {
  id: "bitcoin",
  symbol: "btc",
  name: "Bitcoin",
  last_updated: "2026-11-02T10:00:00.000Z",
  price_change_percentage_24h: -1.2,
  sparkline_in_7d: { price: Array.from({ length: 168 }, (_, i) => 100 + i) },
};
describe("market strip normalization", () => {
  it("uses the provider change and only the final 25 hourly samples", () => {
    const [asset] = parseMarkets([fixture]);
    expect(asset.change).toBe(-1.2);
    expect(asset.points).toHaveLength(25);
    expect(asset.points[0]).toBe(243);
    expect(asset.symbol).toBe("BTC");
  });
  it("omits missing changes and insufficient history", () => {
    expect(
      parseMarkets([{ ...fixture, price_change_percentage_24h: null }]),
    ).toEqual([]);
    expect(
      parseMarkets([{ ...fixture, sparkline_in_7d: { price: [1, 2] } }]),
    ).toEqual([]);
  });
  it("rejects invalid and non-finite upstream data", () => {
    expect(() =>
      parseMarkets([{ ...fixture, price_change_percentage_24h: NaN }]),
    ).toThrow();
  });
  it("draws flat series without dividing by zero", () => {
    expect(sparkline([10, 10])).toBe("0.00,15.00 100.00,15.00");
    expect(sparkline([])).toBe("");
  });
});
