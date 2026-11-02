import type { ReactNode } from "react";

/** Stationary glass: optical highlights + backdrop refraction/blur fallback, no pointer tracking. */
export function LiquidGlass({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={`liquid-glass ${className}`}>{children}</span>;
}
