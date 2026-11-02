"use client";
import { useEffect, type ReactNode, type RefObject } from "react";
import { motion, type HTMLMotionProps } from "motion/react";

/** Pointer-proximity light for a group of stationary cards; one batched listener, no React rerenders. */
export function useSpotlightGroup(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const group = ref.current;
    if (!group) return;
    const cards = Array.from(
      group.querySelectorAll<HTMLElement>("[data-glow]"),
    );
    const media = matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let frame = 0,
      x = 0,
      y = 0;
    const clear = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      cards.forEach((card) => card.style.setProperty("--spot-power", "0"));
    };
    const paint = () => {
      frame = 0;
      const positions = cards.map((card) => {
        const r = card.getBoundingClientRect();
        const dx = Math.max(r.left - x, 0, x - r.right),
          dy = Math.max(r.top - y, 0, y - r.bottom);
        return { card, r, power: Math.max(0, 1 - Math.hypot(dx, dy) / 100) };
      });
      positions.forEach(({ card, r, power }) => {
        card.style.setProperty(
          "--spot-x",
          `${((x - r.left) / Math.max(1, r.width)) * 100}%`,
        );
        card.style.setProperty(
          "--spot-y",
          `${((y - r.top) / Math.max(1, r.height)) * 100}%`,
        );
        card.style.setProperty("--spot-power", String(power));
      });
    };
    const move = (event: PointerEvent) => {
      if (!media.matches || event.pointerType !== "mouse") return;
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    group.addEventListener("pointermove", move, { passive: true });
    group.addEventListener("pointerleave", clear);
    media.addEventListener("change", clear);
    return () => {
      clear();
      group.removeEventListener("pointermove", move);
      group.removeEventListener("pointerleave", clear);
      media.removeEventListener("change", clear);
    };
  }, [ref]);
}

/** Adapted from the supplied GlowCard concept. Sizing/layout stays with the existing carousel. */
export function GlowCard({
  children,
  ...props
}: Omit<HTMLMotionProps<"div">, "children"> & { children: ReactNode }) {
  return (
    <motion.div {...props} data-glow>
      <span className="spotlight-wash" aria-hidden="true" />
      {children}
      <span className="spotlight-border" aria-hidden="true" />
    </motion.div>
  );
}
