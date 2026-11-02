"use client";
import { useEffect, useRef, useState } from "react";
import { marketInstruments } from "@/lib/markets";
/** Official public embed: preserves TradingView attribution and requires no user credentials. */
export function TradingViewTape() {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const mount = document.createElement("div");
    mount.className = "tradingview-widget-container__widget";
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.type = "text/javascript";
    script.textContent = JSON.stringify({
      symbols: marketInstruments.map((i) => ({
        proName: i.tradingView,
        title: i.id === "gold" ? "Золото" : i.symbol,
      })),
      showSymbolLogo: false,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "ru",
    });
    script.onerror = () => setFailed(true);
    el.replaceChildren(mount, script);
    return () => {
      script.onerror = null;
      el.replaceChildren();
    };
  }, []);
  return (
    <div className="tv-tape">
      <div className="tradingview-widget-container" ref={host} />
      <div className="tv-credit">
        <a
          href="https://www.tradingview.com/markets/"
          target="_blank"
          rel="noreferrer"
        >
          Котировки TradingView
        </a>
        <span>Forex · золото · индексы · BTC · ETH</span>
      </div>
      {failed && (
        <p role="status">
          Лента не загрузилась.{" "}
          <a
            href="https://www.tradingview.com/markets/"
            target="_blank"
            rel="noreferrer"
          >
            Открыть котировки TradingView
          </a>
        </p>
      )}
    </div>
  );
}
