"use client";

import { useEffect, useRef, useState } from "react";

/**
 * <Stat> — big-number counter with viewport-triggered count-up animation.
 * Falls back to static value when prefers-reduced-motion is set or value=0.
 *
 * Used on landing page stats band. Placeholder values for Phase 0
 * (value=0 displays as "0+"); real wiring lands when contracts deploy.
 */
export function Stat({
  value,
  suffix = "",
  label,
  hint,
}: {
  value: number;
  suffix?: string;
  label: string;
  hint?: string;
}) {
  // Lazy init: if we know up-front we won't animate (SSR or zero),
  // initialize directly to target so the effect doesn't have to setState.
  const [display, setDisplay] = useState<number>(() => {
    if (value === 0) return 0;
    if (typeof window === "undefined") return 0;
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    return reduced ? value : 0;
  });
  const ref = useRef<HTMLDivElement | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || ranRef.current) return;
    if (value === 0) {
      ranRef.current = true;
      return;
    }
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      ranRef.current = true;
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (ranRef.current) return;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          ranRef.current = true;
          const start = performance.now();
          const duration = 1200;
          const animate = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            // easeOutCubic
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplay(Math.round(value * eased));
            if (t < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          io.disconnect();
          break;
        }
      },
      { threshold: 0.4 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--color-brand)] tabular-nums">
        {display.toLocaleString()}
        {suffix}
      </div>
      <div className="mt-2 text-sm font-medium text-[var(--color-text)]">
        {label}
      </div>
      {hint && (
        <div className="mt-1 text-xs text-[var(--color-muted)]">{hint}</div>
      )}
    </div>
  );
}
