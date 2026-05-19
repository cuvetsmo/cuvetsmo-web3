"use client";

import { useDeferredValue, useMemo, useState } from "react";
import type { GlossaryEntry } from "./_data";

/**
 * <GlossaryClient> — searchable, jump-to-letter glossary list.
 *
 * Perf notes (per input-lag-perf-checklist):
 *   - lowercase the query ONCE outside .filter, not per-keystroke per-entry
 *   - lowercase each entry's searchable haystack ONCE in useMemo
 *   - useDeferredValue so typing stays on the high-priority lane
 *   - 25 entries today, trivially small; future-proofed if we 5x
 */
export function GlossaryClient({ entries }: { entries: GlossaryEntry[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  /** Precompute lowercase haystacks once per render. */
  const haystacks = useMemo(
    () =>
      entries.map((e) =>
        [e.en, e.th, e.short, e.long, e.vetContext ?? "", ...(e.related ?? [])]
          .join(" ")
          .toLowerCase(),
      ),
    [entries],
  );

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return entries;
    const out: GlossaryEntry[] = [];
    for (let i = 0; i < entries.length; i++) {
      if (haystacks[i].includes(q)) out.push(entries[i]);
    }
    return out;
  }, [entries, haystacks, deferredQuery]);

  /** Group filtered entries by first letter for the A-Z sidebar. */
  const grouped = useMemo(() => {
    const map = new Map<string, GlossaryEntry[]>();
    for (const e of filtered) {
      const letter = e.en[0].toUpperCase();
      const arr = map.get(letter) ?? [];
      arr.push(e);
      map.set(letter, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  // Letters that have at least one entry (for sidebar dimming)
  const lettersWithEntries = useMemo(
    () => new Set(grouped.map(([letter]) => letter)),
    [grouped],
  );

  // All letters in source data — for sidebar slots
  const allLetters = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) set.add(e.en[0].toUpperCase());
    return Array.from(set).sort();
  }, [entries]);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Header */}
      <header className="mb-8">
        <p className="text-xs font-semibold text-[var(--color-brand)] uppercase tracking-wider mb-2">
          Glossary — TH / EN
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3">
          พจนานุกรม Web3
        </h1>
        <p className="text-base text-[var(--color-muted)] max-w-2xl leading-relaxed">
          ศัพท์ web3 แบบสองภาษา — {entries.length} คำที่ใช้บ่อยใน CUVETSMO platform.
          แต่ละ entry มีคำอธิบายภาษาไทย พร้อมตัวอย่างบริบทสัตวแพทย์ที่เกี่ยวข้อง.
        </p>
      </header>

      {/* Search */}
      <div className="mb-8 sticky top-[57px] z-30 bg-[var(--color-bg)]/85 backdrop-blur -mx-4 px-4 sm:-mx-6 sm:px-6 py-3 border-b border-[var(--color-border)]">
        <label htmlFor="glossary-search" className="sr-only">
          ค้นหา glossary
        </label>
        <div className="relative">
          <input
            id="glossary-search"
            type="search"
            inputMode="search"
            placeholder="ค้นหา · search · เช่น wallet, NFT, gas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)]"
            aria-describedby="glossary-count"
          />
          <svg
            aria-hidden
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <p
          id="glossary-count"
          className="mt-2 text-xs text-[var(--color-muted)]"
        >
          {filtered.length} จาก {entries.length} entries
          {query.trim() && ` · ค้นหา "${query.trim()}"`}
        </p>
      </div>

      {/* Layout: sidebar (letters) + content */}
      <div className="grid grid-cols-1 lg:grid-cols-[80px_1fr] gap-6 lg:gap-10">
        {/* A-Z sidebar — desktop only */}
        <aside
          aria-label="Jump to letter"
          className="hidden lg:block sticky top-32 self-start"
        >
          <nav className="flex flex-col gap-1">
            {allLetters.map((letter) => {
              const has = lettersWithEntries.has(letter);
              return (
                <a
                  key={letter}
                  href={`#letter-${letter}`}
                  className={`w-9 h-9 flex items-center justify-center rounded-md font-mono text-sm transition-colors ${
                    has
                      ? "text-[var(--color-text)] hover:bg-[var(--color-brand-light)] hover:text-[var(--color-brand)]"
                      : "text-[var(--color-muted)]/40 pointer-events-none"
                  }`}
                  aria-disabled={!has}
                >
                  {letter}
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Entries */}
        <div className="min-w-0">
          {filtered.length === 0 && (
            <div className="card text-center py-12">
              <p className="text-base font-medium mb-2">ไม่พบ entry ที่ตรงกับ &ldquo;{query}&rdquo;</p>
              <p className="text-sm text-[var(--color-muted)]">
                ลองค้นด้วยคำอื่น เช่น wallet, NFT, gas
              </p>
            </div>
          )}

          {grouped.map(([letter, group]) => (
            <section key={letter} id={`letter-${letter}`} className="mb-10 scroll-mt-32">
              <h2 className="text-2xl font-bold tracking-tight text-[var(--color-brand)] mb-4 sticky top-32 lg:static bg-[var(--color-bg)]/80 lg:bg-transparent backdrop-blur lg:backdrop-blur-none py-1 lg:py-0">
                {letter}
              </h2>
              <div className="space-y-4">
                {group.map((entry) => (
                  <article
                    key={entry.en}
                    className="card"
                  >
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                      <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                        {entry.en}
                      </h3>
                      <span className="text-sm text-[var(--color-muted)]">
                        · {entry.th}
                      </span>
                    </div>

                    <p className="text-sm text-[var(--color-text)] leading-relaxed mb-3">
                      {entry.short}
                    </p>

                    <details className="group">
                      <summary className="text-xs font-medium text-[var(--color-brand)] hover:underline cursor-pointer list-none flex items-center gap-1 select-none">
                        <span className="group-open:hidden">อ่านเพิ่ม</span>
                        <span className="hidden group-open:inline">ย่อ</span>
                        <svg
                          aria-hidden
                          className="transition-transform group-open:rotate-180"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </summary>
                      <div className="mt-3 pt-3 border-t border-[var(--color-border)] space-y-3">
                        <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                          {entry.long}
                        </p>
                        {entry.vetContext && (
                          <div className="rounded-lg bg-[var(--color-brand-light)] px-3 py-2 border-l-2 border-[var(--color-brand)]">
                            <p className="text-xs font-semibold text-[var(--color-brand)] mb-1 uppercase tracking-wide">
                              บริบทสัตวแพทย์
                            </p>
                            <p className="text-sm leading-relaxed text-[var(--color-text)]">
                              {entry.vetContext}
                            </p>
                          </div>
                        )}
                        {entry.related && entry.related.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-[var(--color-muted)] mb-1.5 uppercase tracking-wide">
                              ดูเพิ่มเติม
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {entry.related.map((rel) => (
                                <a
                                  key={rel}
                                  href={`#${rel.replace(/\s+/g, "-").toLowerCase()}-link`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setQuery(rel);
                                  }}
                                  className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-border)]/40 hover:bg-[var(--color-brand-light)] hover:text-[var(--color-brand)] transition-colors"
                                >
                                  {rel}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </details>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-12 p-5 rounded-xl bg-[var(--color-brand-light)] border border-[var(--color-brand)]/20">
        <p className="text-sm leading-relaxed text-[var(--color-text)]">
          <strong className="text-[var(--color-brand)]">มีศัพท์ที่อยากให้เพิ่ม?</strong>{" "}
          เปิด issue ใน{" "}
          <a
            href="https://github.com/cuvetsmo/cuvetsmo-web3/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-brand)] underline"
          >
            GitHub
          </a>{" "}
          หรือทักสโม. Glossary นี้ open source — contribute ได้ทุกคน.
        </p>
      </div>
    </main>
  );
}
