import { describe, it, expect } from "vitest";
import { demoTrades } from "../src/lib/demo";
import { pnl, statistics, tradeSchema, insights } from "../src/lib/journal";
describe("financial model", () => {
  it("calculates linear long after fees exactly", () => {
    expect(pnl(demoTrades[0])?.toString()).toBe("413");
  });
  it("calculates short", () => {
    expect(pnl(demoTrades[2])?.toString()).toBe("545");
  });
  it("avoids binary decimal drift", () => {
    expect(
      pnl({
        ...demoTrades[0],
        entry: "0.1",
        exit: "0.3",
        quantity: "3",
        fees: "0",
        funding: "0",
      })?.toString(),
    ).toBe("0.6");
  });
  it("excludes open positions", () => {
    expect(pnl({ ...demoTrades[0], status: "open", exit: null })).toBeNull();
    expect(statistics([]).winRate).toBeNull();
  });
  it("counts calendar months in UTC", () => {
    expect(
      statistics(
        demoTrades,
        new Date("2026-10-31T23:00:00Z"),
      ).monthly.toString(),
    ).toBe("845");
    expect(
      statistics(
        demoTrades,
        new Date("2026-11-01T00:00:00Z"),
      ).monthly.toString(),
    ).toBe("0");
  });
  it("rejects unsupported spot shorts and reversed timestamps", () => {
    expect(
      tradeSchema.safeParse({
        ...demoTrades[0],
        market: "spot",
        direction: "short",
      }).success,
    ).toBe(false);
    expect(
      tradeSchema.safeParse({
        ...demoTrades[0],
        exitedAt: "2020-01-01T00:00:00Z",
      }).success,
    ).toBe(false);
  });
  it("requires closure data and positive quantities", () => {
    expect(
      tradeSchema.safeParse({ ...demoTrades[0], exit: null }).success,
    ).toBe(false);
    expect(
      tradeSchema.safeParse({ ...demoTrades[0], quantity: "0" }).success,
    ).toBe(false);
  });
  it("provides evidence for rule-based insights", () => {
    const f = insights(demoTrades).find((i) => i.tag === "FOMO");
    expect(f?.count).toBe(2);
    expect(f?.net).toBe("-318.00");
    expect(f?.ids).toHaveLength(2);
  });
});
