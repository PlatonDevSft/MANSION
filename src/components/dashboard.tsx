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
  BrainCircuit,
  ChartCandlestick,
  Users,
} from "lucide-react";
import { modules as allModules, traders, demoTrades } from "@/lib/demo";
import { money, statistics } from "@/lib/journal";
import { useLocal } from "@/lib/use-local";
export function Sculpture({ kind }: { kind: string }) {
  return <div aria-hidden="true" className={`sculpture render-art ${kind}`} />;
}
const modules = [3, 1, 2, 5, 0, 4, 6].map((i) => allModules[i]);
const names: Record<string, string> = {
  ai: "AI Ассистент",
  trading: "Журнал сделок",
  community: "Сообщество",
  "copy-trading": "Копи-трейдинг",
  knowledge: "База знаний",
  strategies: "Strategy Lab",
  economy: "Экономика",
};
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
        <div className="eyebrow">MANSION / TRADING INTELLIGENCE</div>
        <h1>
          Дисциплина
          <br />
          сегодня —<br />
          <em>результат завтра</em>
        </h1>
        <p>
          Все инструменты для осознанной торговли
          <br />в одном пространстве.
        </p>
        <span className="hero-line" />
        <div className="hero-principles" aria-hidden="true">
          ANALYZE
          <br />
          IMPROVE
          <br />
          DISCIPLINE
          <br />
          GROW
          <span />
        </div>
      </section>
      <section className="explore">
        <div className="section-title">
          <div>
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
                      opacity: selected === i ? 1 : 0.72,
                      scale: selected === i ? 1 : 0.91,
                      rotateY: selected === i ? 0 : i < selected ? -7 : 7,
                    }}
                    transition={{ duration: reduced ? 0 : 0.4 }}
                    className={
                      "feature-card " + (selected === i ? "selected" : "")
                    }
                  >
                    <Link href={"/" + m.slug}>
                      <div className="feature-top">
                        {i === 0 ? (
                          <BrainCircuit size={20} />
                        ) : i === 1 ? (
                          <ChartCandlestick size={18} />
                        ) : (
                          <Users size={18} />
                        )}
                        <span>0{i + 1}</span>
                      </div>
                      <Sculpture kind={m.slug === "ai" ? "ai" : m.art} />
                      <div className="feature-copy">
                        <h3>{names[m.slug]}</h3>
                        <p>{m.text}</p>
                        <span className="round-arrow">
                          <ArrowRight size={18} />
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
