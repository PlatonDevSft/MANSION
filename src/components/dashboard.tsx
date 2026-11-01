"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Layers,
  ChartCandlestick,
  Users,
} from "lucide-react";
import { modules, traders, demoTrades } from "@/lib/demo";
import { money, statistics } from "@/lib/journal";
import { useLocal } from "@/lib/use-local";
export function Sculpture({ kind }: { kind: string }) {
  return (
    <div aria-hidden="true" className={`sculpture ${kind}`}>
      {kind === "trading" ? (
        <>
          <div className="glass-panel back" />
          <div className="glass-panel">
            <div className="candles">
              {[30, 55, 42, 78, 62, 95, 74, 115, 96, 132].map((v, i) => (
                <i
                  key={i}
                  style={{
                    height: v / 2,
                    marginBottom: i * 5,
                    background: i % 3 === 1 ? "#648e7e" : "#a5d1be",
                  }}
                />
              ))}
            </div>
          </div>
          <div className="plinth" />
        </>
      ) : kind === "archive" ? (
        <>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="slab"
              style={{
                transform: `translateY(${i * 18}px) rotateX(58deg) rotateZ(-32deg)`,
              }}
            />
          ))}
          <div className="plinth" />
        </>
      ) : (
        <>
          <div className="orb one" />
          <div className="orb two" />
          <div className="orb three" />
          <div className="orbit" />
          <div className="plinth" />
        </>
      )}
    </div>
  );
}
export function Dashboard() {
  const local = useLocal("mansion.trades", demoTrades);
  const stats = statistics(local.value);
  const [emblaRef, api] = useEmblaCarousel({
    loop: true,
    align: "center",
    startIndex: 1,
  });
  const [selected, setSelected] = useState(1);
  const reduced = useReducedMotion();
  const select = useCallback(() => {
    if (api) setSelected(api.selectedScrollSnap());
  }, [api]);
  useEffect(() => {
    if (!api) return;
    select();
    api.on("select", select);
    return () => {
      api.off("select", select);
    };
  }, [api, select]);
  return (
    <>
      <section className="welcome">
        <div className="eyebrow">
          <span /> THE MANSION EXPERIENCE
        </div>
        <h1>
          Торгуйте осознанно.
          <br />
          <em>Растите системно.</em>
        </h1>
        <p>Ваши сделки, знания и окружение. В одном пространстве.</p>
      </section>
      <section className="stats" aria-label="Торговые результаты">
        {[
          ["Последняя закрытая сделка", stats.last, "Реализованный P&L · USD"],
          ["Результат за месяц", stats.monthly, "Календарный месяц · UTC"],
          ["Средний результат", stats.average, "Все закрытые сделки · USD"],
        ].map(([label, value, caption]) => (
          <div className="stat" key={String(label)}>
            <div className="stat-label">
              {String(label)}
              <ArrowUpRight size={15} />
            </div>
            <strong
              className={value !== null && Number(value) < 0 ? "negative" : ""}
            >
              {money(value as Parameters<typeof money>[0])}
            </strong>
            <small>{String(caption)}</small>
          </div>
        ))}
      </section>
      <section className="explore">
        <div className="section-title">
          <div>
            <span className="eyebrow">СОЗДАЙТЕ СВОЮ СИСТЕМУ</span>
            <h2>Ваше пространство</h2>
          </div>
          <span className="counter">
            0{selected + 1}
            <span> / 07</span>
          </span>
        </div>
        <div
          className="carousel"
          role="region"
          aria-roledescription="карусель"
          aria-label="Разделы Mansion"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              api?.scrollNext();
            }
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              api?.scrollPrev();
            }
          }}
        >
          <button
            className="carousel-arrow prev"
            aria-label="Предыдущий раздел"
            onClick={() => api?.scrollPrev()}
          >
            <ChevronLeft size={19} />
          </button>
          <div ref={emblaRef} className="carousel-viewport">
            <div className="carousel-track">
              {modules.map((m, i) => (
                <div className="feature-slide" key={m.slug}>
                  <motion.div
                    animate={{
                      opacity: selected === i ? 1 : 0.66,
                      scale: selected === i ? 1 : 0.94,
                    }}
                    transition={{ duration: reduced ? 0 : 0.4 }}
                    className={
                      "feature-card " + (selected === i ? "selected" : "")
                    }
                  >
                    <Link href={"/" + m.slug}>
                      <div className="feature-top">
                        {i === 0 ? (
                          <Layers size={18} />
                        ) : i === 1 ? (
                          <ChartCandlestick size={18} />
                        ) : (
                          <Users size={18} />
                        )}
                        <span>{m.number} / MANSION</span>
                      </div>
                      <Sculpture kind={m.art} />
                      <div className="feature-copy">
                        <span className="eyebrow">{m.label}</span>
                        <h3>{m.title}</h3>
                        <p>{m.text}</p>
                        <span className="round-arrow">
                          <ArrowUpRight size={18} />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
          <button
            className="carousel-arrow next"
            aria-label="Следующий раздел"
            onClick={() => api?.scrollNext()}
          >
            <ChevronRight size={19} />
          </button>
        </div>
        <div className="dots">
          {modules.map((m, i) => (
            <button
              key={m.slug}
              className={i === selected ? "current" : ""}
              aria-label={"Показать " + m.title}
              aria-current={i === selected ? "true" : undefined}
              onClick={() => api?.scrollTo(i)}
            />
          ))}
        </div>
      </section>
      <section className="best">
        <div className="section-title">
          <div>
            <h2>В сильном окружении</h2>
            <p>Примеры профилей · октябрь 2026 · данные не верифицированы</p>
          </div>
          <Link href="/leaderboard" className="text-link">
            Все трейдеры <ArrowRight size={16} />
          </Link>
        </div>
        <div className="traders">
          {traders.map((t, i) => (
            <Link
              href={"/community?profile=" + i}
              className="trader"
              key={t.name}
            >
              <span className="avatar trader-avatar">{t.initials}</span>
              <div>
                <strong>{t.name}</strong>
                <small>{t.style}</small>
              </div>
              <svg viewBox="0 0 80 35" aria-hidden="true">
                <path d="M0 30 L10 25 18 28 28 13 38 19 48 12 55 17 65 7 80 3" />
              </svg>
              <div className="trader-result">
                {t.value}
                <small>Демо · месяц</small>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
