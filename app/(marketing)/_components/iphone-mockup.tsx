/**
 * iPhone mockup frame · inline SVG.
 *
 * Wraps any React child in a stylized phone frame (notch · speaker ·
 * rounded screen · subtle button on side). Used in the Mobile section
 * (Mozi #11) to showcase /build/card and /learn/quests visually.
 */
import type { ReactNode } from "react";

export function IphoneMockup({
  children,
  tilt = 0,
  label,
}: {
  children: ReactNode;
  /** Degrees of tilt for staggered composition · default 0. */
  tilt?: number;
  /** Caption rendered below the device. */
  label?: string;
}) {
  return (
    <div
      className="relative inline-block"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <div
        className="relative bg-[#0a0a0f] rounded-[2.5rem] p-2 shadow-2xl ring-1 ring-black/10"
        style={{
          width: "260px",
          // 19.5 : 9 aspect, iPhone 15 Pro proportions
          aspectRatio: "9 / 19.5",
        }}
      >
        {/* Side button */}
        <div className="absolute top-24 -right-1 h-16 w-1 rounded-r bg-[#0a0a0f]" />
        {/* Volume buttons */}
        <div className="absolute top-20 -left-1 h-8 w-1 rounded-l bg-[#0a0a0f]" />
        <div className="absolute top-32 -left-1 h-12 w-1 rounded-l bg-[#0a0a0f]" />

        {/* Screen */}
        <div className="relative h-full w-full rounded-[2rem] overflow-hidden bg-[var(--color-bg)]">
          {/* Dynamic Island */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 h-6 w-24 rounded-full bg-[#0a0a0f]" />
          {children}
        </div>
      </div>
      {label && (
        <p className="mt-3 text-center text-xs text-[var(--color-muted)] font-medium">
          {label}
        </p>
      )}
    </div>
  );
}

/* ─── Sample screen mockups (SVG · approximate look of real pages) ──── */

export function ClaimCardScreen() {
  return (
    <div className="h-full w-full bg-gradient-to-b from-[#fffbf4] to-[#eef6ff] flex flex-col">
      {/* Status bar fake */}
      <div className="h-10 shrink-0" />
      {/* Nav */}
      <div className="px-4 flex items-center justify-between text-[10px] text-[#0a0a0f]">
        <span className="font-semibold">CUVETSMO Web3</span>
        <span className="px-2 py-0.5 rounded bg-[#0000ff] text-white">
          Connect
        </span>
      </div>
      {/* Heading */}
      <div className="px-4 mt-4">
        <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold bg-[#e6e6ff] text-[#0000ff]">
          BUILD
        </span>
        <h3 className="text-base font-bold mt-2 leading-tight">
          Vet SBT Card
        </h3>
        <p className="text-[9px] text-[#71717a] leading-snug mt-1">
          Credential SBT ที่บอกว่าคุณเป็นนิสิตสัตวแพทย์จุฬาฯ.
        </p>
      </div>

      {/* The card preview */}
      <div className="flex-1 flex items-center justify-center px-4">
        <svg viewBox="0 0 240 150" width="100%" className="rounded-xl shadow-lg">
          <defs>
            <linearGradient id="m-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0369a1" />
              <stop offset="100%" stopColor="#0c4a6e" />
            </linearGradient>
          </defs>
          <rect width="240" height="150" rx="10" fill="url(#m-bg)" />
          <text x="14" y="22" fill="#e0f2fe" fontSize="6" letterSpacing="1.5">
            CUVETSMO · WEB3
          </text>
          <text x="14" y="34" fill="#fff" fontSize="9" fontWeight="600">
            VET SBT CARD
          </text>
          <text
            x="226"
            y="34"
            fill="#fff"
            fontSize="9"
            fontFamily="ui-monospace, monospace"
            textAnchor="end"
          >
            #0086
          </text>
          <text x="14" y="78" fill="#e0f2fe" fontSize="6" letterSpacing="1">
            STUDENT
          </text>
          <text x="14" y="94" fill="#fff" fontSize="14" fontWeight="600">
            ปาล์ม ดาน้อย
          </text>
          <text x="14" y="118" fill="#e0f2fe" fontSize="6" letterSpacing="1">
            VET 86 · ADMITTED 2566
          </text>
          <text x="14" y="138" fill="#bae6fd" fontSize="6" fontFamily="ui-monospace, monospace">
            0x9616…c456 · BASE
          </text>
        </svg>
      </div>

      {/* CTA bar */}
      <div className="px-4 pb-6 space-y-2">
        <div className="rounded-md px-3 py-2 text-[10px] font-semibold text-center text-white bg-[#0000ff]">
          🎁 Claim FREE (Smart Wallet)
        </div>
        <p className="text-center text-[8px] text-[#71717a]">
          Gas paid by Pimlico · $0 to you
        </p>
      </div>
    </div>
  );
}

export function QuestsScreen() {
  const QUESTS = [
    { id: 1,  title: "เซ็นชื่อด้วย wallet",     done: true,  emoji: "✓" },
    { id: 2,  title: "Mint NFT ตัวแรก",          done: true,  emoji: "✓" },
    { id: 3,  title: "Vote เรื่องตลกๆ",           done: true,  emoji: "✓" },
    { id: 4,  title: "รับ SBT",                    done: false, emoji: "○" },
    { id: 5,  title: "อ่าน block explorer",       done: false, emoji: "○" },
    { id: 6,  title: "Connect ไป DApp",            done: false, emoji: "○" },
  ];
  return (
    <div className="h-full w-full bg-[var(--color-bg)] flex flex-col">
      <div className="h-10 shrink-0" />
      <div className="px-4 flex items-center justify-between text-[10px]">
        <span className="font-semibold">Web3 Quests</span>
        <span className="text-[#71717a]">3/10 · 300 XP</span>
      </div>

      <div className="px-4 mt-3">
        <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold bg-[#e6e6ff] text-[#0000ff]">
          LEARN
        </span>
        <h3 className="text-base font-bold mt-2 leading-tight">
          Quest Progress
        </h3>
      </div>

      {/* Progress bar */}
      <div className="px-4 mt-3">
        <div className="h-1.5 rounded-full bg-[#e6e6ff] overflow-hidden">
          <div className="h-full bg-[#0000ff] rounded-full" style={{ width: "30%" }} />
        </div>
      </div>

      {/* Quest list */}
      <div className="flex-1 mt-3 px-4 space-y-1.5 overflow-hidden">
        {QUESTS.map((q) => (
          <div
            key={q.id}
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[9px] ${
              q.done
                ? "bg-emerald-100 text-emerald-900"
                : "bg-[#f4f4f8] text-[#0a0a0f]"
            }`}
          >
            <span
              className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold ${
                q.done ? "bg-emerald-500 text-white" : "bg-white text-[#71717a]"
              }`}
            >
              {q.emoji}
            </span>
            <span className="flex-1 truncate font-medium">{q.title}</span>
            <span className="text-[8px] text-[#71717a]">100 XP</span>
          </div>
        ))}
      </div>

      {/* Bottom EAS badge teaser */}
      <div className="px-4 pb-6 mt-2">
        <div className="rounded-md px-3 py-2 text-[8px] text-center bg-emerald-50 border border-emerald-200 text-emerald-900">
          ⛓️ Badge attested on EAS · view on easscan.org
        </div>
      </div>
    </div>
  );
}
