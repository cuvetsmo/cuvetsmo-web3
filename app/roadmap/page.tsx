import Link from "next/link";
import type { Metadata } from "next";

/**
 * Roadmap · vertical timeline.
 *
 * Mirrors the ROADMAP array used in the landing card. Kept here as inline
 * data so /roadmap can render standalone without coupling to (marketing)
 * route group internals. If the data drifts, fix here; the landing card is
 * a teaser link and may stay slightly behind without breaking anything.
 */

export const metadata: Metadata = {
  title: "Roadmap — CUVETSMO Web3",
  description:
    "Phase 0 (educational testnet) → Phase 1 (pre-mainnet) → Phase 2 (mainnet audit-gated) → Phase 3 (cross-faculty) → Phase 4 (multi-university).",
};

type Phase = {
  phase: string;
  label: string;
  state: "done" | "active" | "next" | "future";
  blurb: string;
  bullets: string[];
};

const PHASES: Phase[] = [
  {
    phase: "Phase 0",
    label: "Educational testnet",
    state: "done",
    blurb:
      "ฐานทุกอย่างพร้อม · 11 contracts deployed บน Base Sepolia (gas $0 via Pimlico) · marketing landing + 4 pillars + Lab tools live · EAS attestation pipeline e2e working.",
    bullets: [
      "11 contracts deployed บน Base Sepolia (chainId 84532)",
      "Pimlico-sponsored UserOps · deployer EOA balance 0 ETH throughout",
      "EAS schemas registered · 3 (VetCard · Badge · Guestbook)",
      "10 Quest CIDs pinned to IPFS via Pinata · permanent metadata",
      "Marketing landing · Hero · Trusted-by · Universe · Pillars · Comparison · Mobile · Mission · CTA",
      "Privy email gate + Coinbase Smart Account v1.1 wired (ethereum-only chain)",
      "79 Foundry tests green · OpenZeppelin v5 base",
      "Copyright deposit PDF 51 pages submitted to กรมทรัพย์สินทางปัญญา",
    ],
  },
  {
    phase: "Phase 1",
    label: "Pre-mainnet polish",
    state: "active",
    blurb:
      "ก่อนจะ ship บน mainnet จริง · เราต้อง harden พอที่ external auditor จะ pass · พร้อม indexer ให้ portable badges ใช้ได้.",
    bullets: [
      "Goldsky subgraph deploy · portable badge queries off-chain",
      "Pre-audit hardening · 5 low-risk contracts (OrgRegistry · VetSBTCard · BadgeRegistry · FirstStepsSBT · Guestbook)",
      "Performance budget · LCP < 2.5s on slow 3G · bundle delta tracking",
      "Per-subdomain theme polish · OG + favicon parity",
      "iOS Safari OKX handoff verification (Palm manual A4 checklist)",
    ],
  },
  {
    phase: "Phase 2",
    label: "Mainnet · audit-gated",
    state: "next",
    blurb:
      "กลายเป็น production · เปิดให้นิสิตจริง mint Vet SBT Card บน Base mainnet · gas ยังฟรีจาก Pimlico paymaster (audit-prep doc covers economics).",
    bullets: [
      "External audit by Tier-1 firm (Trail of Bits / Spearbit / Code4rena equivalent)",
      "Funded deployer wallet · ENS · staked ETH for ops continuity",
      "Real mainnet Vet SBT Card mint for Vet 86+ cohort",
      "Email allowlist + signup-disable · prevent dummy mints",
      "Real-money paymaster credit budget · monitor + alert",
    ],
  },
  {
    phase: "Phase 3",
    label: "Cross-faculty CU",
    state: "future",
    blurb:
      "ขยายจาก CUVET ไป Eng / Med / Dent / Pharm · ใช้ schema เดียวกัน · เพิ่ม role-specific NFT templates ของแต่ละ faculty.",
    bullets: [
      "Cross-faculty CU multi-tenant (CUVET → Engineering, Medicine, Dentistry, Pharmacy)",
      "Role-specific NFT templates per faculty (Med Camp · Eng Engsmas · Dent Year-End · Pharm Internship)",
      "Shared CU student DAO governance",
      "Faculty-specific quest packs (Med diagnostic · Eng coding · Dent caries · Pharm Rx)",
    ],
  },
  {
    phase: "Phase 4",
    label: "Multi-university",
    state: "future",
    blurb:
      "เปิด onboarding ให้ทุก TH + SEA university ที่มี @uni.ac.th gating · cross-uni job + grad-school portability · student-led DAO treasury.",
    bullets: [
      "Open onboarding for any TH/SEA university with @uni.ac.th SSO gating",
      "Federated EAS schemas · cross-uni portability for job apps + grad school",
      "Student-led DAO Treasury layer · grants for cross-uni events",
      "VetOS integration · medical-AI infra for vet students (separate VetOS project)",
    ],
  },
];

function PhaseDot({ state }: { state: Phase["state"] }) {
  const styles = {
    done:   "bg-emerald-500 ring-emerald-500/25",
    active: "bg-[var(--color-brand)] ring-[var(--color-brand)]/25 animate-pulse-ring",
    next:   "bg-amber-400 ring-amber-400/25",
    future: "bg-[var(--color-border)] ring-[var(--color-border)]",
  };
  const label = {
    done: "✓", active: "▶", next: "○", future: "○",
  };
  return (
    <span
      aria-hidden
      className={`relative z-10 inline-flex h-9 w-9 items-center justify-center rounded-full ring-8 ${styles[state]} text-white text-sm font-bold`}
    >
      {label[state]}
    </span>
  );
}

function StateBadge({ state }: { state: Phase["state"] }) {
  const map = {
    done:   { label: "DONE",      cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" },
    active: { label: "IN PROGRESS", cls: "bg-[var(--color-brand-light)] text-[var(--color-brand)] border-[var(--color-brand)]/30" },
    next:   { label: "NEXT UP",   cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30" },
    future: { label: "PLANNED",   cls: "bg-[var(--color-border)]/40 text-[var(--color-muted)] border-[var(--color-border)]" },
  };
  const s = map[state];
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${s.cls}`}>
      {s.label}
    </span>
  );
}

export default function RoadmapPage() {
  return (
    <main className="min-h-[80vh]">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand)] mb-2">
          Roadmap
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
          จาก testnet → mainnet → multi-university
        </h1>
        <p className="text-[var(--color-muted)] text-sm sm:text-base leading-relaxed max-w-2xl">
          5 เฟส · ไม่ได้สัญญา timeline ตายตัว — ship เมื่อพร้อม · audit
          mainnet contract ก่อนเปิดให้นิสิตจริงเสมอ. Phase 0 ทำงานแล้วใน
          testnet, Phase 1 active อยู่ตอนนี้.
        </p>

        <div className="relative mt-12">
          {/* Vertical rail */}
          <div
            aria-hidden
            className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-[var(--color-border)]"
          />

          <ol className="space-y-10">
            {PHASES.map((p) => (
              <li key={p.phase} className="relative flex gap-5">
                <div className="shrink-0 mt-1">
                  <PhaseDot state={p.state} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2 mb-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-muted)]">
                      {p.phase}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                      {p.label}
                    </h2>
                    <StateBadge state={p.state} />
                  </div>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-3">
                    {p.blurb}
                  </p>
                  <ul className="space-y-1.5 text-sm">
                    {p.bullets.map((b, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-[var(--color-text)]"
                      >
                        <span
                          aria-hidden
                          className="text-[var(--color-brand)] mt-1 shrink-0"
                        >
                          ▸
                        </span>
                        <span className="leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Footer CTAs */}
        <div className="mt-16 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/learn/wallet-101" className="btn-brand text-center">
            เริ่ม Wallet 101 (5 นาที)
          </Link>
          <Link href="/about" className="btn-outline text-center">
            อ่าน Vision เต็มๆ
          </Link>
        </div>
      </section>
    </main>
  );
}
