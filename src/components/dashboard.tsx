"use client";
import Link from "next/link";
import { useCallback, useEffect, useState, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChartCandlestick,
  Users,
  BookOpen,
  Copy,
  Globe,
} from "lucide-react";
import { GlowCard, useSpotlightGroup } from "@/components/ui/spotlight-card";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { MarketStrip } from "@/components/market-strip";
import { modules as allModules } from "@/lib/demo";
export function Sculpture({ kind }: { kind: string }) {
  return <div aria-hidden="true" className={`sculpture render-art ${kind}`} />;
}
const modules = [2, 6, 1, 0, 5].map((i) => allModules[i]);
const names: Record<string, string> = {
  trading: "Журнал сделок",
  community: "Сообщество",
  "copy-trading": "Копи-трейдинг",
  knowledge: "База знаний",
  economy: "Экономика",
};
const featureIcons = {
  trading: ChartCandlestick,
  community: Users,
  knowledge: BookOpen,
  "copy-trading": Copy,
  economy: Globe,
};
export function Dashboard() {
  const glowGroup = useRef<HTMLDivElement>(null);
  useSpotlightGroup(glowGroup);
  const [emblaRef, api] = useEmblaCarousel({
    loop: true,
    align: "center",
    startIndex: 2,
  });
  const [selected, setSelected] = useState(2);
  const [visibleSlides, setVisibleSlides] = useState<number[]>([1, 2, 3]);
  const reduced = useReducedMotion();
  const [offsets, setOffsets] = useState([-2, -1, 0, 1, 2]);
  useEffect(() => {
    if (!api) return;
    const sync = () =>
      setOffsets(
        api.scrollSnapList().map((snap) => {
          let distance = snap - api.scrollProgress();
          distance = ((((distance + 0.5) % 1) + 1) % 1) - 0.5;
          return distance * modules.length;
        }),
      );
    sync();
    api.on("scroll", sync);
    api.on("reInit", sync);
    return () => {
      api.off("scroll", sync);
      api.off("reInit", sync);
    };
  }, [api]);
  const select = useCallback(() => {
    if (api) {
      setSelected(api.selectedScrollSnap());
      setVisibleSlides(api.slidesInView());
    }
  }, [api]);
  useEffect(() => {
    if (!api) return;
    select();
    api.on("select", select);
    api.on("slidesInView", select);
    return () => {
      api.off("select", select);
      api.off("slidesInView", select);
    };
  }, [api, select]);
  return (
    <>
      <section className="welcome">
        <h1>
          <span className="headline-line">Дисциплина</span>
          <br />
          <span className="headline-line">сегодня —</span>
          <br />
          <em>результат завтра</em>
        </h1>
        <p>
          Все инструменты для осознанной торговли
          <br />в одном пространстве.
        </p>
      </section>
      <section className="explore">
        <div className="section-title">
          <div>
            <h2>Ваше пространство</h2>
          </div>
          <span className="counter">
            0{selected + 1}
            <span> / {String(modules.length).padStart(2, "0")}</span>
          </span>
        </div>
        <div
          className="carousel"
          ref={glowGroup}
          role="region"
          aria-roledescription="карусель"
          aria-label="Разделы Mansion"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              api?.scrollNext(Boolean(reduced));
            }
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              api?.scrollPrev(Boolean(reduced));
            }
          }}
        >
          <button
            className="carousel-arrow prev"
            aria-label="Предыдущий раздел"
            onClick={() => api?.scrollPrev(Boolean(reduced))}
          >
            <ChevronLeft size={19} />
          </button>
          <div ref={emblaRef} className="carousel-viewport">
            <div className="carousel-track">
              {modules.map((m, i) => {
                const Icon = featureIcons[m.slug as keyof typeof featureIcons];
                return (
                  <div className="feature-slide" key={m.slug}>
                    <GlowCard
                      animate={{
                        opacity: 1,
                        scale: reduced
                          ? selected === i
                            ? 1
                            : 0.95
                          : 1 - Math.min(Math.abs(offsets[i]), 2) * 0.05,
                        rotateY: reduced
                          ? 0
                          : Math.max(-1, Math.min(1, offsets[i])) * -10,
                        z: reduced
                          ? 0
                          : -Math.min(Math.abs(offsets[i]), 2) * 20,
                      }}
                      whileHover={
                        reduced
                          ? undefined
                          : { scale: selected === i ? 1.025 : 0.975 }
                      }
                      transition={{
                        duration: reduced ? 0 : 0.22,
                        ease: [0.22, 0.61, 0.36, 1],
                      }}
                      className={
                        "feature-card " + (selected === i ? "selected" : "")
                      }
                    >
                      <Link
                        href={"/" + m.slug}
                        tabIndex={visibleSlides.includes(i) ? 0 : -1}
                      >
                        <div className="feature-top">
                          <LiquidGlass className="feature-icon">
                            <Icon size={20} aria-hidden="true" />
                          </LiquidGlass>
                          <span>0{i + 1}</span>
                        </div>
                        <Sculpture kind={m.art} />
                        <div className="feature-copy">
                          <span className="feature-status">
                            {m.slug === "copy-trading"
                              ? "В разработке"
                              : m.slug === "trading"
                                ? "Личный инструмент"
                                : "Ваше развитие"}
                          </span>
                          <h3>{names[m.slug]}</h3>
                          <p>{m.text}</p>
                          <LiquidGlass className="round-arrow">
                            <ArrowRight size={18} aria-hidden="true" />
                          </LiquidGlass>
                        </div>
                      </Link>
                    </GlowCard>
                  </div>
                );
              })}
            </div>
          </div>
          <button
            className="carousel-arrow next"
            aria-label="Следующий раздел"
            onClick={() => api?.scrollNext(Boolean(reduced))}
          >
            <ChevronRight size={19} />
          </button>
        </div>
        <div className="carousel-bottom">
          <p className="carousel-announcement" role="status" aria-live="polite">
            {String(selected + 1).padStart(2, "0")}{" "}
            <span>/ {String(modules.length).padStart(2, "0")}</span>{" "}
            <span className="current-section">
              {names[modules[selected].slug]}
            </span>
          </p>
          <div className="dots">
            {modules.map((m, i) => (
              <button
                key={m.slug}
                className={i === selected ? "current" : ""}
                aria-label={"Показать " + names[m.slug]}
                aria-current={i === selected ? "true" : undefined}
                onClick={() => api?.scrollTo(i, Boolean(reduced))}
              />
            ))}
          </div>
        </div>
      </section>
      <MarketStrip />
    </>
  );
}
