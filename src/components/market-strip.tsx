"use client";
import { useEffect, useState, useCallback } from "react";
import { RefreshCw, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { TradingViewTape } from "@/components/tradingview-tape";
import { marketInstruments } from "@/lib/markets";
import { type MarketAsset, sparkline } from "@/lib/markets";
export function MarketStrip() {
  const [assets, setAssets] = useState<MarketAsset[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const r = await fetch("/api/markets", { signal });
      if (!r.ok) throw new Error("unavailable");
      const data = await r.json();
      if (!Array.isArray(data.assets) || !data.assets.length)
        throw new Error("empty");
      setAssets(data.assets);
      setError("");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError("Котировки временно недоступны");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);
  useEffect(() => {
    const control = new AbortController();
    void load(control.signal);
    const timer = setInterval(() => {
      if (!document.hidden) void load(control.signal);
    }, 300000);
    return () => {
      control.abort();
      clearInterval(timer);
    };
  }, [load]);
  const fallback = Boolean(error && !assets.length);
  const oldest = assets.length
    ? new Date(Math.min(...assets.map((a) => Date.parse(a.updatedAt))))
    : null;
  return (
    <section
      className="market-strip"
      aria-label="Рынок: Forex и основные активы"
    >
      <div className="market-caption">
        <span>
          Рынок <span className="market-period">Forex · индексы · крипто</span>
        </span>
        <div>
          <a
            href={
              fallback
                ? "https://www.tradingview.com/markets/"
                : "https://finance.yahoo.com/markets/"
            }
            target="_blank"
            rel="noreferrer"
          >
            {fallback
              ? "Лента TradingView"
              : "Последняя сессия · Yahoo Finance"}
          </a>
          {oldest && (
            <time dateTime={oldest.toISOString()} title={oldest.toISOString()}>
              обновлено{" "}
              {oldest.toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "UTC",
              })}{" "}
              UTC
            </time>
          )}
          <button
            className="market-refresh"
            aria-label="Обновить котировки"
            disabled={loading}
            onClick={() => void load()}
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>
      {error && (
        <div className="market-error" role="status">
          {assets.length > 0
            ? "Мини-графики временно недоступны · показаны последние загруженные данные"
            : "Мини-графики недоступны · ниже доступна лента TradingView"}
          <button onClick={() => void load()} disabled={loading}>
            Повторить
          </button>
        </div>
      )}
      {!error && loading && !assets.length && (
        <div className="market-loading" role="status">
          Загрузка рыночных данных…
        </div>
      )}
      {error && assets.length === 0 && <TradingViewTape />}
      {assets.length > 0 && (
        <div className="market-assets">
          {assets.map((a) => (
            <a
              className={`market-asset ${a.change < 0 ? "market-down" : "market-up"}`}
              key={a.id}
              href={`https://finance.yahoo.com/quote/${encodeURIComponent(marketInstruments.find((i) => i.id === a.id)?.yahoo ?? a.symbol)}/`}
              target="_blank"
              rel="noreferrer"
              aria-label={`${a.name}: ${a.change >= 0 ? "+" : ""}${a.change.toFixed(2)}% к предыдущему закрытию`}
            >
              <span className="market-symbol">
                {a.symbol}
                <small>
                  {a.id === "eurusd" || a.id === "gbpusd"
                    ? "Forex"
                    : a.id === "gold"
                      ? "Фьючерс GC"
                      : a.id === "nasdaq" || a.id === "sp500"
                        ? "Индекс"
                        : "/ USD"}
                </small>
              </span>
              <svg
                viewBox="0 0 100 30"
                role="img"
                aria-label="Динамика последней торговой сессии"
              >
                <title>
                  Цены последней доступной сессии; изменение к предыдущему
                  закрытию. Источник: Yahoo Finance.
                </title>
                <polyline
                  points={sparkline(a.points)}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <span className="market-change">
                {a.change < 0 ? (
                  <ArrowDownRight size={12} />
                ) : (
                  <ArrowUpRight size={12} />
                )}{" "}
                {a.change >= 0 ? "+" : ""}
                {a.change.toFixed(2)}%
              </span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
