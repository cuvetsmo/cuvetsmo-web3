"use client";

/**
 * Motion Beacon · live diagnostic.
 *
 * Tiny corner badge that proves to a skeptical viewer that the marquee
 * animation IS running in their browser. Shows:
 *   - Pulsing dot (CSS animated)
 *   - Live readout of .chip-strip animationDuration as seen by getComputedStyle
 *   - Whether the user has prefers-reduced-motion ON (which is the most likely
 *     reason a previous deploy looked static · iOS Accessibility setting)
 *
 * Click "?" to toggle a help tooltip. Click "×" to dismiss for 24h
 * (localStorage). The component is intentionally noticeable but small so
 * it doesn't compete with the hero — top-right corner under the header.
 */

import { useEffect, useState } from "react";

const DISMISS_KEY = "cuvet:motion-beacon-dismissed-until";

export function MotionBeacon() {
  const [duration, setDuration] = useState<string>("…");
  const [reduceMotion, setReduceMotion] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(true);

  useEffect(() => {
    // Decide visibility based on dismiss state.
    const dismissUntil = Number(
      window.localStorage.getItem(DISMISS_KEY) ?? "0"
    );
    setDismissed(Date.now() < dismissUntil);

    // Read live animation duration + reduce-motion preference.
    const tick = () => {
      const strip = document.querySelector(".chip-strip") as HTMLElement | null;
      if (strip) {
        const cs = getComputedStyle(strip);
        setDuration(`${cs.animationDuration} ${cs.animationPlayState}`);
      }
      setReduceMotion(
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
      );
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (dismissed) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] shadow-lg pl-3 pr-1 py-1 text-xs font-mono"
      role="status"
      aria-label="Animation diagnostic"
    >
      {/* Pulse dot · ALWAYS animates regardless of reduce-motion · proves
          to user that animations work in their browser at all */}
      <span className="relative inline-flex h-2 w-2">
        <span className="absolute inset-0 rounded-full bg-emerald-500/60 animate-ping" />
        <span className="relative inline-block h-2 w-2 rounded-full bg-emerald-500" />
      </span>

      <span className="text-[var(--color-text)]">marquee</span>
      <span className="text-[var(--color-muted)]">{duration}</span>

      {reduceMotion && (
        <span
          className="ml-1 inline-flex items-center rounded bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-200"
          title="iOS Settings > Accessibility > Motion > Reduce Motion is ON"
        >
          reduce-motion
        </span>
      )}

      <button
        type="button"
        onClick={() => setShowHelp((s) => !s)}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-[var(--color-border)] text-[var(--color-muted)]"
        aria-label="What is this?"
      >
        ?
      </button>
      <button
        type="button"
        onClick={() => {
          // Dismiss for 24h
          window.localStorage.setItem(
            DISMISS_KEY,
            String(Date.now() + 24 * 60 * 60 * 1000)
          );
          setDismissed(true);
        }}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-[var(--color-border)] text-[var(--color-muted)]"
        aria-label="Dismiss for 24h"
      >
        ×
      </button>

      {showHelp && (
        <div
          className="absolute bottom-full right-0 mb-2 w-72 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] shadow-xl p-3 text-[11px] font-sans leading-relaxed text-[var(--color-text)]"
          onClick={() => setShowHelp(false)}
        >
          <p className="font-semibold mb-1">Live animation status</p>
          <p className="text-[var(--color-muted)] mb-2">
            ตัวเลขด้านบนคือ <code className="font-mono">animation-duration</code>
            และ <code className="font-mono">animation-play-state</code> ที่
            browser ของคุณกำลังใช้กับ marquee จริงๆ.
          </p>
          {reduceMotion ? (
            <p className="text-amber-800 dark:text-amber-300">
              ⚠️ คุณเปิด Reduce Motion อยู่ใน iOS Settings &gt; Accessibility &gt;
              Motion · เราตั้งให้ marquee ยังเลื่อนแม้คุณเปิดอยู่ (linear
              scroll · ไม่กระแทก vestibular) แต่ถ้ายังนิ่ง = browser cache เก่า.
              ลอง hard-refresh (กดค้าง refresh icon).
            </p>
          ) : (
            <p className="text-[var(--color-muted)]">
              ถ้าตัวเลขแสดง <code className="font-mono">10s running</code> +
              dot ขวาเขียวเด้ง = animation ทำงานสมบูรณ์.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
