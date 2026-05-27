/**
 * Bento grid · asymmetric card layout (Mozi #11 / Magic UI bento pattern).
 *
 * Server-component-safe · no client hooks. Children can opt into different
 * cell sizes via the `colSpan` / `rowSpan` props on BentoCard.
 *
 * Usage:
 *   <BentoGrid>
 *     <BentoCard colSpan={2} rowSpan={2}>...big hero card...</BentoCard>
 *     <BentoCard>...regular...</BentoCard>
 *     <BentoCard colSpan={2}>...wide...</BentoCard>
 *   </BentoGrid>
 */

import type { ReactNode } from "react";

export function BentoGrid({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-[160px] sm:auto-rows-[180px] ${className}`}
    >
      {children}
    </div>
  );
}

export function BentoCard({
  children,
  colSpan = 1,
  rowSpan = 1,
  accent = "from-sky-100/40 to-cyan-50/20",
  border = "border-sky-200/50",
  href,
  className = "",
}: {
  children: ReactNode;
  /** 1 | 2 | 3 | 4 — col-span on lg breakpoint */
  colSpan?: 1 | 2 | 3 | 4;
  /** 1 | 2 | 3 — row-span on all breakpoints */
  rowSpan?: 1 | 2 | 3;
  /** Tailwind gradient stops for background (from-X to-Y) */
  accent?: string;
  /** Border-color utility */
  border?: string;
  /** If passed, wrap in a Link with hover-lift */
  href?: string;
  className?: string;
}) {
  // Static class maps so Tailwind's JIT can find them
  const colSpanCls = {
    1: "sm:col-span-1 lg:col-span-1",
    2: "sm:col-span-2 lg:col-span-2",
    3: "sm:col-span-2 lg:col-span-3",
    4: "sm:col-span-2 lg:col-span-4",
  }[colSpan];

  const rowSpanCls = {
    1: "row-span-1",
    2: "row-span-2",
    3: "row-span-3",
  }[rowSpan];

  const sharedCls = `group relative rounded-2xl p-4 sm:p-5 bg-gradient-to-br ${accent} border ${border} hover:border-[var(--color-brand)] hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden ${colSpanCls} ${rowSpanCls} ${className}`;

  if (href) {
    // Lazy server-side import of Link to avoid client boundary
    // (BentoCard with href stays a server component · use <a> for safety)
    return (
      <a href={href} className={sharedCls}>
        {children}
      </a>
    );
  }

  return <div className={sharedCls}>{children}</div>;
}
