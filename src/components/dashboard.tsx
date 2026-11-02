"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  ChartCandlestick,
  Users,
  BookOpen,
  Copy,
  FlaskConical,
  Globe,
} from "lucide-react";
import { modules as allModules } from "@/lib/demo";
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
const featureIcons = {
  ai: BrainCircuit,
  trading: ChartCandlestick,
  community: Users,
  knowledge: BookOpen,
  "copy-trading": Copy,
  strategies: FlaskConical,
  economy: Globe,
};
export function Dashboard() {
  const [emblaRef, api] = useEmblaCarousel({
    loop: true,
    align: "center",
    startIndex: 1,
  });
  const [selected, setSelected] = useState(1);
  const [visibleSlides, setVisibleSlides] = useState<number[]>([0, 1, 2]);
  const reduced = useReducedMotion();
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
          Дисциплина
          <br />
          сегодня —<br />
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
                    <motion.div
                      animate={{
                        opacity: 1,
                        scale: selected === i ? 1 : 0.91,
                        rotateY: selected === i ? 0 : i < selected ? -7 : 7,
                      }}
                      transition={{ duration: reduced ? 0 : 0.4 }}
                      className={
                        "feature-card " + (selected === i ? "selected" : "")
                      }
                    >
                      <Link
                        href={"/" + m.slug}
                        tabIndex={visibleSlides.includes(i) ? 0 : -1}
                      >
                        <div className="feature-top">
                          <Icon size={20} aria-hidden="true" />
                          <span>0{i + 1}</span>
                        </div>
                        <Sculpture kind={m.slug === "ai" ? "ai" : m.art} />
                        <div className="feature-copy">
                          <span className="feature-status">
                            {m.slug === "copy-trading"
                              ? "В разработке"
                              : m.slug === "ai"
                                ? "Анализ и дисциплина"
                                : m.slug === "trading"
                                  ? "Личный инструмент"
                                  : "Ваше развитие"}
                          </span>
                          <h3>{names[m.slug]}</h3>
                          <p>{m.text}</p>
                          <span className="round-arrow">
                            <ArrowRight size={18} />
                          </span>
                        </div>
                      </Link>
                    </motion.div>
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
            {String(selected + 1).padStart(2, "0")} <span>/ 07</span>{" "}
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
    </>
  );
}
