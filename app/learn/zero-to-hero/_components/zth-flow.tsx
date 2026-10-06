"use client";

import Link from "next/link";
import { useState } from "react";
import { ZERO_TO_HERO_STEPS as STEPS } from "@/lib/zero-to-hero";
import { AtheneGuide } from '../../_components/athene-guide';

/**
 * <ZeroToHeroFlow /> — 5-step beginner onboarding for someone who has never
 * touched crypto. No wallet required, no buttons that cost anything. Pure
 * education with vet-context analogies.
 *
 * Wave 3 · Education Specialist.
 */

export function ZeroToHeroFlow({ initialStep = 0 }: { initialStep?: number }) {
  const [current, setCurrent] = useState(initialStep >= 0 && initialStep < STEPS.length ? initialStep : 0);
  const step = STEPS[current];
  const isLast = current === STEPS.length - 1;
  const isFirst = current === 0;
  const progress = ((current + 1) / STEPS.length) * 100;

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden shadow-sm">
      {/* progress bar */}
      <div className="px-5 sm:px-7 pt-5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-[var(--color-brand)] uppercase tracking-wider">
            ขั้นที่ {step.id} จาก {STEPS.length}
          </p>
          <p className="text-xs text-[var(--color-muted)]">
            {Math.round(progress)}%
          </p>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--color-border)]/60 overflow-hidden">
          <div
            className="h-full bg-[var(--color-brand)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* step dots */}
        <div className="mt-3 flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`ไปขั้นที่ ${s.id}: ${s.title}`}
              className={`h-2 rounded-full transition-all ${
                i === current
                  ? "w-8 bg-[var(--color-brand)]"
                  : i < current
                    ? "w-2 bg-[var(--color-brand)]/50"
                    : "w-2 bg-[var(--color-border)]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* step content */}
      <div className="px-5 sm:px-7 py-6 sm:py-8 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          {step.visual && (
            <div className="shrink-0 sm:w-32 flex sm:flex-col items-center gap-2 sm:gap-3">
              <div className="text-5xl sm:text-6xl leading-none" aria-hidden>
                {step.visual.emoji}
              </div>
              <p className="text-xs text-[var(--color-muted)] text-center hidden sm:block">
                {step.visual.caption}
              </p>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1.5">
              {step.title}
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-muted)] mb-4 leading-relaxed">
              {step.subtitle}
            </p>
            <ul className="space-y-2.5 mb-5">
              {step.bullets.map((b, i) => (
                <li key={i} className="flex gap-3 text-sm sm:text-base leading-relaxed">
                  <span
                    aria-hidden
                    className="shrink-0 mt-0.5 h-5 w-5 rounded-full bg-[var(--color-brand-light)] text-[var(--color-brand)] flex items-center justify-center text-[10px] font-bold"
                  >
                    {i + 1}
                  </span>
                  <span className="text-[var(--color-text)]">{b}</span>
                </li>
              ))}
            </ul>

            {step.analogy && (
              <div className="rounded-lg bg-[var(--color-brand-light)] border-l-4 border-[var(--color-brand)] px-4 py-3 mb-2">
                <p className="text-xs font-semibold text-[var(--color-brand)] uppercase tracking-wide mb-1">
                  Analogy — {step.analogy.title}
                </p>
                <p className="text-sm leading-relaxed text-[var(--color-text)]">
                  {step.analogy.body}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 sm:px-7"><AtheneGuide kind="lesson" reference={String(step.id)} /></div>

      {/* navigation */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-bg)]/40 px-5 sm:px-7 py-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={isFirst}
          className="text-sm text-[var(--color-muted)] hover:text-[var(--color-brand)] disabled:opacity-30 disabled:hover:text-[var(--color-muted)] flex items-center gap-1.5 px-2 py-1.5"
        >
          <span aria-hidden>←</span> ก่อนหน้า
        </button>
        <div className="flex items-center gap-2">
          {!isLast && (
            <button
              type="button"
              onClick={() => setCurrent((c) => Math.min(STEPS.length - 1, c + 1))}
              className="btn-brand text-sm"
            >
              ถัดไป <span aria-hidden>→</span>
            </button>
          )}
          {isLast && step.nextHref && (
            <Link href={step.nextHref} className="btn-brand text-sm">
              {step.nextLabel ?? "ทำต่อ"}
            </Link>
          )}
          {!isLast && step.nextHref && (
            <Link
              href={step.nextHref}
              className="hidden sm:inline-flex btn-outline text-sm items-center gap-1.5"
            >
              {step.nextLabel ?? "ข้าม"}
            </Link>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out; }
      `}</style>
    </div>
  );
}
