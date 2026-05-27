"use client";

/**
 * Scroll-driven reveal · Mozi-style fade-up + IntersectionObserver.
 *
 * Wraps any block-level node so it fades in from translateY(24px) →
 * translateY(0) the first time it enters the viewport. After it reveals
 * we disconnect the observer (no re-trigger on re-entry · matches Mozi).
 *
 * Usage:
 *   <Reveal>                       // single element
 *   <Reveal delay={120}>           // single element with delay
 *   <Reveal as="section" className="...">     // change wrapping tag
 *   {items.map((it, i) => <Reveal key={it.id} delay={i * 80}>...</Reveal>)}
 *
 * The actual animation lives in globals.css (.reveal / .is-revealed) so the
 * SSR'd HTML can carry the correct class set even before JS hydrates.
 */

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ElementType, ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  as,
  className = "",
  /** Threshold passed to IntersectionObserver · 0.15 = 15% in viewport. */
  threshold = 0.15,
  /** Style overrides (transition-delay is merged automatically). */
  style,
}: {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
  threshold?: number;
  style?: CSSProperties;
}) {
  const Tag: ElementType = as ?? "div";
  const ref = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // If the user prefers reduced motion · skip the animation entirely.
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setRevealed(true);
      return;
    }

    let revealedYet = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          revealedYet = true;
          setRevealed(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        // Trigger slightly before the element fully enters · feels snappier
        rootMargin: "0px 0px -80px 0px",
      }
    );
    observer.observe(node);

    // Fallback · if the observer hasn't fired after 2.5s (e.g. element
    // never entered viewport · headless screenshot · JS-only nav reuse),
    // force reveal so the user never sees a permanently-invisible card.
    // This was the bug Palm hit on Phase 4 mobile audit · cards 2-4 of the
    // Learn hub stayed at opacity:0 because Playwright's programmatic
    // fullPage scroll didn't trigger intersection events.
    const fallbackTimer = window.setTimeout(() => {
      if (!revealedYet) {
        setRevealed(true);
        observer.disconnect();
      }
    }, 2500 + delay);  // wait past the staggered delay before firing

    return () => {
      observer.disconnect();
      window.clearTimeout(fallbackTimer);
    };
  }, [threshold, delay]);

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${revealed ? "is-revealed" : ""} ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </Tag>
  );
}
