"use client";

/**
 * NumberTicker · count-up animation triggered when the number scrolls into view.
 *
 * Pattern adopted from Magic UI / 21st.dev community components · adapted to
 * our existing Reveal IntersectionObserver convention so it integrates with
 * the Mozi reveal cascade.
 *
 * Easing: easeOutCubic over 1.6s · feels punchy without overshoot.
 * Respects prefers-reduced-motion · falls through to the final value
 * immediately (still informative · just static).
 *
 * Usage:
 *   <NumberTicker value={11} />
 *   <NumberTicker value={1850} formatter={(n) => `$${n}`} duration={2000} />
 */

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const readReducedMotion = () => window.matchMedia?.(REDUCED_MOTION).matches ?? false;
const serverReducedMotion = () => false;
function subscribeReducedMotion(notify: () => void) {
  const media = window.matchMedia?.(REDUCED_MOTION);
  media?.addEventListener("change", notify);
  return () => media?.removeEventListener("change", notify);
}

export function NumberTicker({
  value,
  duration = 1600,
  formatter = (n) => String(n),
  className = "",
  startOnMount = false,
}: {
  /** Final integer value to count to */
  value: number;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Format the displayed number · default integer string */
  formatter?: (n: number) => string;
  /** Tailwind/class string applied to the rendered span */
  className?: string;
  /** Skip viewport trigger · count immediately on mount */
  startOnMount?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, readReducedMotion, serverReducedMotion);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // The external media snapshot derives the static value without an effect update.
    if (reducedMotion) return;

    let started = false;
    let cancelled = false;
    let frame = 0;

    const animate = () => {
      if (started || cancelled) return;
      started = true;
      const start = performance.now();
      const tick = (now: number) => {
        if (cancelled) return;
        const elapsed = now - start;
        const t = Math.min(1, elapsed / duration);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(Math.round(value * eased));
        if (t < 1) frame = window.requestAnimationFrame(tick);
        else {
          setDisplay(value);
        }
      };
      frame = window.requestAnimationFrame(tick);
    };

    if (startOnMount) {
      animate();
      return () => { cancelled = true; window.cancelAnimationFrame(frame); };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.3, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(node);

    // Fallback · animate after 3s regardless (same defensive pattern as Reveal)
    const fallback = window.setTimeout(() => {
      if (!started) {
        animate();
        observer.disconnect();
      }
    }, 3000);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [value, duration, startOnMount, reducedMotion]);

  return (
    <span ref={ref} className={className}>
      {formatter(reducedMotion ? value : display)}
    </span>
  );
}
