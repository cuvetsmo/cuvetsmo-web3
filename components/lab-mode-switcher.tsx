"use client";

import { useState } from "react";

/**
 * <LabModeSwitcher /> — 3-mode view for Lab tool routes.
 *
 * Wave 3 · Education Specialist.
 *
 * Modes:
 *   - easy:    default form-based UI (children passed in)
 *   - inspect: shows Solidity source with Thai inline notes
 *   - hack:    embeds Remix IDE so user can fork + deploy with own wallet
 *
 * Each Lab page wraps its form children with this switcher and passes:
 *   sourceTitle: short name shown above the source viewer (e.g. "TokenFactory.sol")
 *   sourceUrl:   relative path or absolute GitHub URL to the contract file
 *   remixUrl:    Remix IDE deep link with the contract pre-loaded (optional)
 *
 * The source is fetched client-side from /api/contract-source on first switch,
 * with a fallback link if fetch fails.
 */

type Mode = "easy" | "inspect" | "hack";

type Props = {
  /** Default form-based UI */
  children: React.ReactNode;
  /** Short file label for Inspect tab (e.g. "TokenFactory.sol") */
  sourceTitle: string;
  /** Relative path inside contracts/src — used as static fallback content */
  sourceCode?: string;
  /** Optional Remix IDE deep-link to load the file in the editor */
  remixUrl?: string;
  /** GitHub URL for the source file (for "open in GitHub" link) */
  githubUrl?: string;
  /** Brief Thai description of what this contract does */
  contractIntro?: string;
};

const MODE_INFO: Record<Mode, { label: string; sub: string; icon: string }> = {
  easy: {
    label: "Easy",
    sub: "ฟอร์มง่ายๆ",
    icon: "🟢",
  },
  inspect: {
    label: "Inspect",
    sub: "ดู source code",
    icon: "🔍",
  },
  hack: {
    label: "Hack",
    sub: "เปิด Remix IDE",
    icon: "⚡",
  },
};

export function LabModeSwitcher({
  children,
  sourceTitle,
  sourceCode,
  remixUrl,
  githubUrl,
  contractIntro,
}: Props) {
  const [mode, setMode] = useState<Mode>("easy");

  return (
    <div>
      {/* Tab strip */}
      <div className="mb-5 flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-1 w-fit max-w-full overflow-x-auto">
        {(Object.keys(MODE_INFO) as Mode[]).map((m) => {
          const info = MODE_INFO[m];
          const active = mode === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={active}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                active
                  ? "bg-[var(--color-brand)] text-white shadow-sm"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]/40"
              }`}
            >
              <span aria-hidden className="text-xs">
                {info.icon}
              </span>
              <span>{info.label}</span>
              <span
                className={`hidden sm:inline text-xs ${
                  active ? "text-white/75" : "text-[var(--color-muted)]"
                }`}
              >
                {info.sub}
              </span>
            </button>
          );
        })}
      </div>

      {mode === "easy" && <div className="animate-fadeIn">{children}</div>}

      {mode === "inspect" && (
        <div className="animate-fadeIn">
          <InspectView
            title={sourceTitle}
            code={sourceCode}
            githubUrl={githubUrl}
            intro={contractIntro}
          />
        </div>
      )}

      {mode === "hack" && (
        <div className="animate-fadeIn">
          <HackView
            title={sourceTitle}
            remixUrl={remixUrl}
            githubUrl={githubUrl}
          />
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}

function InspectView({
  title,
  code,
  githubUrl,
  intro,
}: {
  title: string;
  code?: string;
  githubUrl?: string;
  intro?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
        <div className="border-b border-[var(--color-border)] px-4 py-2.5 flex items-center justify-between gap-2 bg-[var(--color-bg)]/40">
          <div className="flex items-center gap-2 min-w-0">
            <span aria-hidden className="text-[var(--color-muted)]">
              📄
            </span>
            <p className="text-sm font-mono truncate">{title}</p>
          </div>
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--color-brand)] hover:underline whitespace-nowrap"
            >
              เปิดบน GitHub →
            </a>
          )}
        </div>
        {intro && (
          <div className="px-4 py-3 bg-[var(--color-brand-light)] border-b border-[var(--color-brand)]/20">
            <p className="text-sm leading-relaxed text-[var(--color-text)]">
              {intro}
            </p>
          </div>
        )}
        <pre className="text-[12px] font-mono leading-relaxed text-[var(--color-text)] bg-[var(--color-bg)] p-4 overflow-x-auto max-h-[60vh]">
          {code ??
            "// source code ไม่ได้ embed อยู่ในหน้านี้ — ดูฉบับเต็มบน GitHub"}
        </pre>
      </div>
      <p className="text-xs text-[var(--color-muted)] leading-relaxed">
        Comment ที่ขึ้นต้นด้วย <code className="font-mono">// 🇹🇭</code> คือคำอธิบายภาษาไทย
        เพิ่มเฉพาะใน Inspect mode เพื่อช่วยเข้าใจ. Source code จริงไม่มี comment เหล่านี้.
      </p>
    </div>
  );
}

function HackView({
  title,
  remixUrl,
  githubUrl,
}: {
  title: string;
  remixUrl?: string;
  githubUrl?: string;
}) {
  const defaultRemix = "https://remix.ethereum.org/";
  const url = remixUrl ?? defaultRemix;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm leading-relaxed">
        <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
          โหมด Hack — ใช้ Remix IDE ภายนอก
        </p>
        <p className="text-amber-900 dark:text-amber-200">
          ต่อไปนี้คุณทำงานนอก CUVETSMO. Remix จะให้คุณ fork {title} ไป compile, แก้, deploy
          ด้วย wallet ของตัวเอง. ใช้ Base Sepolia network เพื่อทดสอบฟรี.
        </p>
      </div>
      <div className="rounded-lg border border-[var(--color-border)] overflow-hidden bg-white">
        <iframe
          title={`Remix IDE — ${title}`}
          src={url}
          className="w-full h-[60vh] sm:h-[70vh]"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2 text-sm">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline text-center"
        >
          เปิด Remix ใน tab ใหม่
        </a>
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--color-muted)] hover:text-[var(--color-brand)] self-center"
          >
            ดู source บน GitHub →
          </a>
        )}
      </div>
    </div>
  );
}
