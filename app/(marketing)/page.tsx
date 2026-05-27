import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

/**
 * Landing page · Mozi-inspired soft-DeFi redesign (2026-05-27).
 *
 * Section flow (Mozi.finance translated to vet-student audience):
 *   1. Sticky nav        (in /layout · keeps existing Header)
 *   2. Hero              · pastel cloud bg · inline brand chips · 2 CTAs
 *   3. Trusted-by strip  · 8 protocol/partner chips on infinite scroll
 *   4. Word-stagger      · Palm's 10-year-vision quote, animated word-by-word
 *   5. Why CUVETSMO Web3 · 6-feature grid (gasless · identity · badges · lab · soulbound · OSS)
 *   6. 4 Pillars         · existing Learn/Play/Build/Lab cards (kept · enhanced)
 *   7. Comparison table  · generic DApp vs Tally/Snapshot vs CUVETSMO Web3
 *   8. Vision quote      · existing (Palm quote + TH/EN mission · kept)
 *   9. Final CTA         · Discord + LINE community buttons (community-first)
 *  10. Footer            (in /layout)
 *
 * Section bg alternates `--color-bg` (cream) ↔ `--color-surface-2` (sky) so
 * the page reads with natural breathing in light mode. Dark mode falls back
 * to the existing cyber-dark palette via [data-theme="dark"].
 */

export const metadata: Metadata = {
  title: {
    absolute:
      "CUVETSMO Web3 — Web3 Playground สำหรับนิสิตสัตวแพทย์ จุฬาฯ",
  },
  description:
    "เรียนรู้ ทดลอง สร้าง — Web3 playground และ creation platform สำหรับนิสิตคณะสัตวแพทย์ จุฬาฯ. ครบทั้ง 4 เสาหลัก: Learn, Play, Build, The Lab.",
  openGraph: {
    url: "https://web3.cuvetsmo.com",
    title:
      "CUVETSMO Web3 — Web3 Playground for Thai Vet Students",
    description:
      "Learn, Play, Build, The Lab. Educational testnet by students, for students.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "CUVETSMO Web3 — 4 pillars: Learn, Play, Build, The Lab",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CUVETSMO Web3 — Web3 Playground for Thai Vet Students",
    description:
      "Learn, Play, Build, The Lab. Built on Base, educational testnet.",
    images: ["/og.png"],
  },
};

// ─── Hero inline brand chips ────────────────────────────────────────────
// Text-only chips (no external logos · no IP risk). Each picks up its brand
// color from .chip-* classes in globals.css.
const HERO_CHIPS = [
  { label: "Base",    cls: "chip-base" },
  { label: "Privy",   cls: "chip-privy" },
  { label: "Pimlico", cls: "chip-pimlico" },
  { label: "EAS",     cls: "chip-eas" },
] as const;

// ─── Trusted-by strip · 8 partners, doubled for seamless infinite loop ───
const TRUSTED_BY = [
  { label: "Base",         cls: "chip-base" },
  { label: "Privy",        cls: "chip-privy" },
  { label: "Pimlico",      cls: "chip-pimlico" },
  { label: "EAS",          cls: "chip-eas" },
  { label: "Pinata",       cls: "chip-pinata" },
  { label: "OpenZeppelin", cls: "chip-openzep" },
  { label: "CUVET",        cls: "chip-cuvet" },
  { label: "Chula",        cls: "chip-chula" },
] as const;

// ─── 6-feature differentiator grid (Mozi "Why MOZI's" pattern) ──────────
const FEATURES = [
  {
    title: "Gasless Mint",
    blurb: "Mint Vet SBT Card · Quest Badges · NFT ฟรีไม่เสีย ETH.",
    detail:
      "Pimlico paymaster sponsor gas ทุก UserOp · นิสิตที่เพิ่งสมัคร wallet ครั้งแรกก็ใช้ได้ทันที.",
    emoji: "🎁",
    accent: "from-sky-300/20 to-sky-500/10",
    border: "border-sky-400/30",
  },
  {
    title: "Chula-Verified Identity",
    blurb: "Vet SBT Card ผูกกับอีเมล @chula.ac.th — โอนไม่ได้ ปลอมไม่ได้.",
    detail:
      "Privy email gate + ERC-721 soulbound + on-chain student id hash · ใช้ flex IG ได้ ใช้พิสูจน์ตัวตน vet ได้.",
    emoji: "🪪",
    accent: "from-amber-300/20 to-amber-500/10",
    border: "border-amber-400/30",
  },
  {
    title: "EAS Quest Badges",
    blurb: "Web3 Quests 10 ข้อ · จบแต่ละข้อได้ on-chain attestation portable.",
    detail:
      "Ethereum Attestation Service บน Base · เห็นใน easscan.org · เอาไปใช้กับ portfolio · job application · DAO governance ได้.",
    emoji: "⛓️",
    accent: "from-emerald-300/20 to-emerald-500/10",
    border: "border-emerald-400/30",
  },
  {
    title: "No-Code Token Studio",
    blurb: "Deploy NFT collection · SBT · DAO ภายใน 30 วินาที.",
    detail:
      "The Lab · 6 no-code tools (NFT Studio · SBT Maker · Token Forge · DAO Quickstart · Page Builder · Templates) · เหมาะกับชมรม + ค่าย.",
    emoji: "🧪",
    accent: "from-purple-300/20 to-purple-500/10",
    border: "border-purple-400/30",
  },
  {
    title: "Soulbound · ของจริงเฉพาะคุณ",
    blurb: "Card + Badge ผูกกับ wallet ตลอดไป · โอน/ขาย/ปลอม ไม่ได้.",
    detail:
      "ERC-721 + ERC-1155 SBT contracts ใช้ OpenZeppelin v5 base + custom transfer guard · audited pattern.",
    emoji: "🔒",
    accent: "from-rose-300/20 to-rose-500/10",
    border: "border-rose-400/30",
  },
  {
    title: "Open Source + Auditable",
    blurb: "MIT license · contracts บน GitHub · 79 Foundry tests green.",
    detail:
      "11 smart contracts · ABIs ใน lib/contracts.ts · pre-audit doc ที่ docs/MAINNET_DEPLOY_AUDIT_PREP.md · ใครก็ verify ได้.",
    emoji: "📖",
    accent: "from-slate-300/20 to-slate-500/10",
    border: "border-slate-400/30",
  },
] as const;

// ─── 4 Pillars (kept from previous design · enhanced framing) ────────────
const PILLARS = [
  {
    title: "Learn",
    titleTh: "เรียนรู้",
    icon: "📚",
    description: "เรียนรู้ web3 แบบไม่กลัวเสียเงิน — Wallet 101, quests, glossary",
    href: "/learn",
    accent: "from-sky-500/10 to-sky-700/10",
    border: "border-sky-700/20",
  },
  {
    title: "Play",
    titleTh: "ทดลองเล่น",
    icon: "🎮",
    description: "ทดลอง mint NFT, sign message, vote บน testnet ฟรี",
    href: "/play",
    accent: "from-emerald-500/10 to-emerald-700/10",
    border: "border-emerald-700/20",
  },
  {
    title: "Build",
    titleTh: "สร้าง",
    icon: "🛠️",
    description: "Claim Vet SBT Card, Profile, Badge collection ของตัวเอง",
    href: "/build",
    accent: "from-amber-500/10 to-amber-700/10",
    border: "border-amber-700/20",
  },
  {
    title: "The Lab",
    titleTh: "ห้องแล็บ",
    icon: "🧪",
    description: "สร้าง token, NFT, DAO ของตัวเองภายใน 30 วินาที ไม่ต้องเขียน code",
    href: "/lab",
    accent: "from-purple-500/10 to-purple-700/10",
    border: "border-purple-700/20",
  },
] as const;

// ─── Comparison table (Mozi "MOZI is Unique" pattern) ────────────────────
type Cell = boolean | string;
const COMPARISON_ROWS: ReadonlyArray<{
  feature: string;
  detail: string;
  generic: Cell;
  tallySnap: Cell;
  cuvet: Cell;
}> = [
  {
    feature: "Chula-verified identity",
    detail: "อีเมล @chula.ac.th + on-chain SBT proof",
    generic: false,
    tallySnap: false,
    cuvet: true,
  },
  {
    feature: "Educational quests",
    detail: "10 hands-on tasks + portable BADGE attestations",
    generic: false,
    tallySnap: false,
    cuvet: true,
  },
  {
    feature: "Free gas (Pimlico-sponsored)",
    detail: "End user mint/post = $0 · paymaster cover all",
    generic: false,
    tallySnap: false,
    cuvet: true,
  },
  {
    feature: "Thai-first UI · TH+EN",
    detail: "Copy + flow ออกแบบเริ่มจาก Thai vet students",
    generic: false,
    tallySnap: false,
    cuvet: true,
  },
  {
    feature: "Soulbound credentials",
    detail: "โอน/ขาย/ปลอม ไม่ได้ · ผูกกับ wallet ตลอดไป",
    generic: false,
    tallySnap: false,
    cuvet: true,
  },
  {
    feature: "Vote / DAO governance",
    detail: "Snapshot off-chain + on-chain Governor pending audit",
    generic: false,
    tallySnap: true,
    cuvet: true,
  },
  {
    feature: "Open source · MIT",
    detail: "Contracts + frontend public บน GitHub",
    generic: "varies",
    tallySnap: true,
    cuvet: true,
  },
];

// ─── Helper: split Thai/English text into words for stagger animation ────
function splitWords(text: string): string[] {
  // Split on whitespace; punctuation stays attached to nearest word.
  return text.split(/\s+/).filter(Boolean);
}

const STAGGER_PARAGRAPH =
  "เริ่มจาก subdomain เล็กๆ ของชมรมนิสิตคณะสัตวแพทย์ CU แต่ออกแบบให้กลายเป็น infrastructure layer สำหรับ student-led web3 ทั่วประเทศไทย.";

export default function LandingPage() {
  return (
    <main>
      {/* ═══════════════════════ 1 · Hero ═══════════════════════ */}
      <section className="relative overflow-hidden cloud-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-14 sm:pb-20">
          <div className="flex justify-center mb-6">
            <Image
              src="/smo-logo.png"
              alt="CUVETSMO"
              width={80}
              height={80}
              className="rounded-2xl shadow-sm ring-1 ring-black/5 animate-float-slow"
              priority
            />
          </div>

          <p className="text-xs sm:text-sm font-semibold text-[var(--color-brand)] uppercase tracking-[0.18em] text-center mb-3 animate-fade-up">
            Web3 for Chula Vet Students
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-center max-w-4xl mx-auto leading-[1.1] animate-fade-up" style={{ animationDelay: "0.05s" }}>
            <span className="block">Learn Web3.</span>
            <span className="block gradient-text mt-1">Build Your Identity.</span>
          </h1>

          <p
            className="mt-6 text-base sm:text-lg text-[var(--color-muted)] text-center max-w-3xl mx-auto leading-relaxed animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="block">เครื่องมือ Web3 สำหรับนิสิตสัตวแพทย์ จุฬาฯ — ครบ 4 เสาหลัก ที่เดียว.</span>
            <span lang="en" className="block mt-2 text-sm sm:text-base opacity-80">
              Built on{" "}
              {HERO_CHIPS.map((c, i) => (
                <span key={c.label}>
                  <span className={`brand-chip ${c.cls}`}>{c.label}</span>
                  {i < HERO_CHIPS.length - 1 ? " · " : ""}
                </span>
              ))}
              {" "}— free wallet in 5 minutes, no ETH needed.
            </span>
          </p>

          <div
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center max-w-2xl mx-auto animate-fade-up"
            style={{ animationDelay: "0.15s" }}
          >
            <Link
              href="/learn/zero-to-hero"
              className="btn-brand text-center flex-1 sm:flex-initial"
            >
              ไม่เคยรู้จัก Web3? เริ่มที่นี่
            </Link>
            <Link
              href="/learn/wallet-101"
              className="btn-outline text-center flex-1 sm:flex-initial"
            >
              ทำ Wallet 101 (5 นาที)
            </Link>
            <Link
              href="/about"
              className="text-center flex-1 sm:flex-initial px-5 py-2.5 rounded-lg font-medium text-sm text-[var(--color-muted)] hover:text-[var(--color-brand)] hover:bg-[var(--color-brand-light)] transition-colors"
            >
              อ่าน Master Plan →
            </Link>
          </div>

          <p className="mt-3 text-xs text-center text-[var(--color-muted)]">
            อ่าน 3 นาที — ไม่ต้องสมัครอะไรเลย — ไม่ต้องมี wallet
          </p>

          <p className="mt-10 text-xs sm:text-sm text-center text-[var(--color-muted)] flex flex-wrap justify-center items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"
              />
              Built on Base
            </span>
            <span aria-hidden className="opacity-30">—</span>
            <span>Powered by CUVETSMO</span>
            <span aria-hidden className="opacity-30">—</span>
            <span>Educational testnet</span>
          </p>
        </div>
      </section>

      {/* ═══════════════════════ 2 · Trusted-by infinite strip ═══════════════════════ */}
      <section className="border-y border-[var(--color-border)] bg-[var(--color-surface-2)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)] mb-5">
            Built on · ผสานกับ
          </p>
          <div className="chip-strip-mask">
            <div className="chip-strip">
              {/* Duplicate the list once so the loop is seamless */}
              {[...TRUSTED_BY, ...TRUSTED_BY, ...TRUSTED_BY, ...TRUSTED_BY].map(
                (c, i) => (
                  <span
                    key={`${c.label}-${i}`}
                    className={`brand-chip ${c.cls} text-base`}
                  >
                    {c.label}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ 3 · Word-stagger vision paragraph ═══════════════════════ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand)] text-center mb-4">
          10-Year Vision
        </p>
        <p className="stagger-words text-xl sm:text-2xl md:text-3xl font-medium leading-relaxed text-center text-[var(--color-text)]">
          {splitWords(STAGGER_PARAGRAPH).map((w, i) => (
            <span key={`${w}-${i}`} className="mr-[0.25em]">
              {w}
            </span>
          ))}
        </p>
        <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
          Palm · VP Planning, CUVETSMO 68
        </p>
      </section>

      {/* ═══════════════════════ 4 · Why CUVETSMO Web3 · 6-feature grid ═══════════════════════ */}
      <section className="bg-[var(--color-surface-2)] border-y border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand)] mb-2">
              Why CUVETSMO Web3
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Web3 ที่ไม่ต้องกลัว · ทำงานได้จริงตั้งแต่นาทีแรก
            </h2>
            <p className="mt-3 text-[var(--color-muted)] max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              6 จุดที่ทำให้ Vet 86+ ใช้ได้ทันที — ไม่ต้องมี ETH ไม่ต้องมีพื้นฐาน crypto ไม่ต้องสมัครอะไรเพิ่ม.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {FEATURES.map((f) => (
              <article
                key={f.title}
                className={`group rounded-2xl p-5 sm:p-6 bg-gradient-to-br ${f.accent} border ${f.border} hover:shadow-lg transition-all`}
              >
                <div className="text-3xl sm:text-4xl mb-3 leading-none">
                  {f.emoji}
                </div>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight mb-2">
                  {f.title}
                </h3>
                <p className="text-sm font-medium text-[var(--color-text)] mb-2 leading-snug">
                  {f.blurb}
                </p>
                <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                  {f.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ 5 · 4 Pillars ═══════════════════════ */}
      <section
        id="pillars"
        className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20"
      >
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand)] mb-2">
            4 เสาหลัก — 4 Pillars
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Learn · Play · Build · The Lab
          </h2>
          <p className="mt-3 text-[var(--color-muted)] max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            แต่ละเสาหลักออกแบบให้เสริมกัน — เริ่มจากเรียน ไปทดลอง สร้าง credentials ของตัวเอง แล้วจบที่สร้าง asset ของกลุ่มเอง.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {PILLARS.map((p) => (
            <Link
              key={p.title}
              href={p.href}
              className={`group relative rounded-2xl p-5 sm:p-6 bg-gradient-to-br ${p.accent} border ${p.border} hover:border-[var(--color-brand)] transition-all hover:shadow-lg hover:-translate-y-0.5`}
            >
              <div aria-hidden className="text-3xl sm:text-4xl mb-3 leading-none">
                {p.icon}
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                  {p.title}
                </h3>
                <span className="text-xs sm:text-sm text-[var(--color-muted)]">
                  {p.titleTh}
                </span>
              </div>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4 min-h-[3.5rem]">
                {p.description}
              </p>
              <span className="text-sm font-medium text-[var(--color-brand)] inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                เข้าสู่ {p.title}
                <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════ 6 · Comparison table ═══════════════════════ */}
      <section className="bg-[var(--color-surface-2)] border-y border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand)] mb-2">
              CUVETSMO Web3 ไม่เหมือนใคร
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-3xl mx-auto">
              ทำไมไม่ใช้ DApp ทั่วไป · Tally · Snapshot ไปเลย?
            </h2>
            <p className="mt-3 text-[var(--color-muted)] max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              เครื่องมือ generic ขาดบริบทของ Vet 86 · เราออกแบบจากศูนย์เพื่อนิสิตสัตวแพทย์ CU.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="text-left p-4 font-semibold w-2/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)] block mb-1">
                      Capability
                    </span>
                  </th>
                  <th className="text-center p-4 font-semibold">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)] block mb-1">
                      Generic DApp
                    </span>
                    <span className="text-xs text-[var(--color-muted)]">
                      Uniswap · OpenSea
                    </span>
                  </th>
                  <th className="text-center p-4 font-semibold">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)] block mb-1">
                      Governance
                    </span>
                    <span className="text-xs text-[var(--color-muted)]">
                      Tally · Snapshot
                    </span>
                  </th>
                  <th className="text-center p-4 font-semibold bg-[var(--color-brand-light)]/40">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand)] block mb-1">
                      CUVETSMO Web3
                    </span>
                    <span className="text-xs text-[var(--color-brand)] font-semibold">
                      Built for Chula Vet
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={
                      i % 2 === 1
                        ? "bg-[var(--color-surface-2)]/40 border-t border-[var(--color-border)]"
                        : "border-t border-[var(--color-border)]"
                    }
                  >
                    <td className="p-4">
                      <p className="font-semibold">{row.feature}</p>
                      <p className="text-xs text-[var(--color-muted)] mt-0.5">
                        {row.detail}
                      </p>
                    </td>
                    <td className="text-center p-4">
                      <CompareCell value={row.generic} />
                    </td>
                    <td className="text-center p-4">
                      <CompareCell value={row.tallySnap} />
                    </td>
                    <td className="text-center p-4 bg-[var(--color-brand-light)]/30">
                      <CompareCell value={row.cuvet} highlight />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ 7 · Mission TH/EN ═══════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand)] mb-3 text-center">
            Mission
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-3">
            สี่หัวข้อที่เราต้องส่งให้ได้
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="card">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-brand)] mb-2">
              ภารกิจ — Mission
            </h3>
            <ul className="space-y-2 text-sm text-[var(--color-text)] leading-relaxed list-disc pl-5 marker:text-[var(--color-brand)]">
              <li>ทำให้นิสิตคนแรกที่ไม่เคยรู้จัก crypto ใช้ web3 ได้ใน 5 นาที</li>
              <li>ให้ทุกคนสร้าง token/DApp ของตัวเองได้ใน 30 วินาที</li>
              <li>มี product ที่ใช้งานจริง ไม่ใช่แค่ demo</li>
              <li>เตรียมพร้อม regulatory — flip switch ไป production ได้ทันที</li>
            </ul>
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-brand)] mb-2">
              Mission (English)
            </h3>
            <ul className="space-y-2 text-sm text-[var(--color-text)] leading-relaxed list-disc pl-5 marker:text-[var(--color-brand)]">
              <li>Onboard a complete beginner to web3 in 5 minutes</li>
              <li>Empower anyone to deploy their own token/DApp in 30s</li>
              <li>Ship real products, not demos</li>
              <li>Be regulatory-ready — switch to production the day rules allow</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ 8 · Final CTA · community-first ═══════════════════════ */}
      <section className="bg-[var(--color-surface-2)] border-t border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div
            className="card bg-[var(--color-brand-light)] border-[var(--color-brand)]/30"
            style={{
              background:
                "linear-gradient(135deg, var(--color-brand-light) 0%, color-mix(in srgb, var(--color-brand-light) 60%, transparent) 100%)",
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--color-brand)] mb-2">
                  พร้อมรับ Vet SBT Card หรือยัง?
                </p>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">
                  10 นาที — จาก zero สู่ web3
                </h3>
                <p className="text-sm text-[var(--color-muted)]">
                  ไม่ต้องมีพื้นฐาน, ไม่ใช้เงินจริง, ไม่ต้องโหลด app
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <Link href="/learn/wallet-101" className="btn-brand text-center">
                  เริ่ม Wallet 101
                </Link>
                <Link href="/about" className="btn-outline text-center">
                  อ่าน Vision
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// ─── Helper components ──────────────────────────────────────────────────

function CompareCell({
  value,
  highlight = false,
}: {
  value: boolean | string;
  highlight?: boolean;
}) {
  if (value === true) {
    return (
      <span
        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
          highlight
            ? "bg-emerald-500 text-white"
            : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
        }`}
        aria-label="Yes"
      >
        ✓
      </span>
    );
  }
  if (value === false) {
    return (
      <span
        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-border)] text-[var(--color-muted)] text-sm font-bold"
        aria-label="No"
      >
        ✕
      </span>
    );
  }
  // string · partial / "varies"
  return (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-amber-500/15 text-amber-700 dark:text-amber-300">
      {value}
    </span>
  );
}
