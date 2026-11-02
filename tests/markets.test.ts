import { describe, it, expect } from "vitest";
import {
  parseYahooChart,
  marketInstruments,
  sparkline,
} from "../src/lib/markets";
const fixture = {
  chart: {
    result: [
      {
        meta: { chartPreviousClose: 100 },
        timestamp: [1000, 1900, 2800, 3700],
        indicators: { quote: [{ close: [100, null, 102, 101] }] },
      },
    ],
  },
};
describe("mixed-market data", () => {
  it("uses previous close and filters null intraday points", () => {
    const a = parseYahooChart(fixture, marketInstruments[0]);
    expect(a.symbol).toBe("EUR/USD");
    expect(a.change).toBeCloseTo(1);
    expect(a.points).toEqual([100, 102, 101]);
    expect(a.updatedAt).toBe(new Date(3700000).toISOString());
  });
  it("rejects missing data and invalid reference close", () => {
    expect(() =>
      parseYahooChart({ chart: { result: null } }, marketInstruments[0]),
    ).toThrow();
    expect(() =>
      parseYahooChart(
        {
          chart: {
            result: [
              { ...fixture.chart.result[0], meta: { chartPreviousClose: 0 } },
            ],
          },
        },
        marketInstruments[0],
      ),
    ).toThrow();
  });
  it("selects Forex, gold, indices and only BTC/ETH for crypto", () => {
    expect(marketInstruments.map((i) => i.symbol)).toEqual([
      "EUR/USD",
      "GBP/USD",
      "GOLD",
      "NASDAQ 100",
      "S&P 500",
      "BTC",
      "ETH",
    ]);
  });
  it("draws flat data without division by zero", () => {
    expect(sparkline([10, 10])).toBe("0.00,15.00 100.00,15.00");
    expect(sparkline([])).toBe("");
  });
});
