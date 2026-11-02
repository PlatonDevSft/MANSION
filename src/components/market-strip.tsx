"use client";
import { useEffect, useState, useCallback } from "react";
import { RefreshCw, ArrowUpRight, ArrowDownRight } from "lucide-react";
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
  const oldest = assets.length
    ? new Date(Math.min(...assets.map((a) => Date.parse(a.updatedAt))))
    : null;
  return (
    <section className="market-strip" aria-label="Рынок за 24 часа">
      <div className="market-caption">
        <span>
          Рынок <span className="market-period">24ч</span>
        </span>
        <div>
          <a href="https://www.coingecko.com/" target="_blank" rel="noreferrer">
            CoinGecko · USD
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
          {error}
          {assets.length > 0 ? " · показаны последние загруженные данные" : ""}
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
      {assets.length > 0 && (
        <div className="market-assets">
          {assets.map((a) => (
            <a
              className={`market-asset ${a.change < 0 ? "market-down" : "market-up"}`}
              key={a.id}
              href={`https://www.coingecko.com/en/coins/${a.id}`}
              target="_blank"
              rel="noreferrer"
              aria-label={`${a.name}: ${a.change >= 0 ? "+" : ""}${a.change.toFixed(2)}% за 24 часа`}
            >
              <span className="market-symbol">
                {a.symbol}
                <small>/ USD</small>
              </span>
              <svg
                viewBox="0 0 100 30"
                role="img"
                aria-label="Динамика примерно за 24 часа"
              >
                <title>
                  Последние 25 часовых точек; изменение за 24 часа предоставлено
                  CoinGecko
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
