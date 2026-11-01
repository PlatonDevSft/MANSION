import Decimal from "decimal.js";
import { z } from "zod";
const amount = z
  .string()
  .trim()
  .regex(/^\d{1,12}(\.\d{1,8})?$/, "Число: до 12 целых и 8 дробных знаков");
const positive = amount.refine(
  (v) => new Decimal(v).gt(0),
  "Значение должно быть больше нуля",
);
export const tradeSchema = z
  .object({
    id: z.string().uuid(),
    symbol: z
      .string()
      .trim()
      .min(2)
      .max(20)
      .transform((v) => v.toUpperCase()),
    market: z.enum(["spot", "linear"]),
    direction: z.enum(["long", "short"]),
    currency: z.literal("USD"),
    enteredAt: z.string().datetime(),
    exitedAt: z.string().datetime().nullable(),
    entry: positive,
    exit: positive.nullable(),
    quantity: positive,
    fees: amount,
    funding: amount,
    status: z.enum(["open", "closed"]),
    strategy: z.string().max(80),
    note: z.string().max(2000),
    emotion: z.enum(["Спокойствие", "Тревога", "Эйфория"]),
    tags: z.array(z.string().max(60)).max(9),
  })
  .superRefine((t, ctx) => {
    if (t.market === "spot" && t.direction === "short")
      ctx.addIssue({
        code: "custom",
        message: "Spot поддерживает только Long",
        path: ["direction"],
      });
    if (t.status === "closed" && (!t.exit || !t.exitedAt))
      ctx.addIssue({
        code: "custom",
        message: "Для закрытой сделки нужны цена и время выхода",
        path: ["exit"],
      });
    if (t.exitedAt && t.exitedAt < t.enteredAt)
      ctx.addIssue({
        code: "custom",
        message: "Выход не может предшествовать входу",
        path: ["exitedAt"],
      });
  });
export type Trade = z.infer<typeof tradeSchema>;
export const errorTags = [
  "FOMO",
  "Revenge trading",
  "Overtrading",
  "Ранний вход",
  "Поздний выход",
  "Нарушение риска",
  "Нарушение стратегии",
  "Импульсивная сделка",
  "Другая ошибка",
];
// Quantity is base-asset units; linear USD-settled instruments only. Funding is a paid cost.
export function pnl(t: Trade): Decimal | null {
  if (t.status !== "closed" || !t.exit) return null;
  return new Decimal(t.exit)
    .minus(t.entry)
    .mul(t.quantity)
    .mul(t.direction === "long" ? 1 : -1)
    .minus(t.fees)
    .minus(t.funding);
}
export function statistics(trades: Trade[], now = new Date()) {
  const closed = trades
    .filter((t) => pnl(t) !== null)
    .sort((a, b) => (a.exitedAt ?? "").localeCompare(b.exitedAt ?? ""));
  const values = closed.map((t) => pnl(t)!);
  const wins = values.filter((v) => v.gt(0)),
    losses = values.filter((v) => v.lt(0));
  const sum = (a: Decimal[]) => a.reduce((s, v) => s.plus(v), new Decimal(0));
  const net = sum(values),
    grossLoss = sum(losses).abs();
  const monthly = sum(
    closed
      .filter((t) => t.exitedAt?.slice(0, 7) === now.toISOString().slice(0, 7))
      .map((t) => pnl(t)!),
  );
  return {
    count: closed.length,
    net,
    monthly,
    last: values.at(-1) ?? null,
    average: values.length ? net.div(values.length) : null,
    winRate: values.length ? (wins.length / values.length) * 100 : null,
    profitFactor: grossLoss.gt(0) ? sum(wins).div(grossLoss) : null,
    averageWin: wins.length ? sum(wins).div(wins.length) : null,
    averageLoss: losses.length ? sum(losses).div(losses.length) : null,
  };
}
export function insights(trades: Trade[]) {
  return errorTags
    .map((tag) => {
      const evidence = trades.filter(
        (t) => t.tags.includes(tag) && pnl(t) !== null,
      );
      return {
        tag,
        ids: evidence.map((t) => t.id),
        count: evidence.length,
        net: statistics(evidence).net.toFixed(2),
      };
    })
    .filter((i) => i.count > 0)
    .sort((a, b) => b.count - a.count);
}
export function money(v: Decimal.Value | null) {
  return v === null
    ? "—"
    : new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(new Decimal(v).toNumber());
}
