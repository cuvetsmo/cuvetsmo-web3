import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Stat } from "./_components/stat";

/**
 * Landing page — Wave 2E (Agent E · Marketing).
 *
 * Sections (top → bottom):
 *   1. Hero — logo · big title · bilingual subtitle · 3 CTAs · trust signal
 *   2. Four Pillars — Learn · Play · Build · The Lab
 *   3. Stats — placeholder counters (animate count-up via <Stat />)
 *   4. Vision quote + bilingual mission
 *   5. Final CTA band
 *
 * Footer is rendered by the marketing layout.
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

export default function LandingPage() {
  return (
    <main>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        {/* gradient backdrop */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, rgba(3,105,161,0.18) 0%, rgba(3,105,161,0) 60%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-brand)]/40 to-transparent -z-10"
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-14 sm:pb-20">
          <div className="flex justify-center mb-6">
            <Image
              src="/smo-logo.png"
              alt="CUVETSMO"
              width={80}
              height={80}
              className="rounded-2xl shadow-sm ring-1 ring-black/5"
              priority
            />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-center max-w-4xl mx-auto leading-[1.15] animate-fade-up">
            <span className="block">เครื่องมือ Web3</span>
            <span className="block gradient-text mt-1">
              สำหรับนิสิตสัตวแพทย์ จุฬาฯ
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[var(--color-muted)] text-center max-w-2xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: "0.05s" }}>
            เรียนรู้ ทดลอง สร้าง — ครบในที่เดียว
            <br className="hidden sm:block" />
            <span className="text-sm sm:text-base">
              A web3 playground built by Thai vet students, for Thai vet
              students.
            </span>
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.1s" }}>
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
            <span aria-hidden className="opacity-30">
              —
            </span>
            <span>Powered by CUVETSMO</span>
            <span aria-hidden className="opacity-30">
              —
            </span>
            <span>Educational testnet</span>
          </p>
        </div>
      </section>

      {/* ─── 4 Pillars ─── */}
      <section
        id="pillars"
        className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20"
      >
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold text-[var(--color-brand)] uppercase tracking-wider mb-2">
            4 เสาหลัก — 4 Pillars
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Learn, Play, Build, The Lab
          </h2>
          <p className="mt-3 text-[var(--color-muted)] max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            แต่ละเสาหลักออกแบบให้เสริมกัน — เริ่มจากเรียน
            ไปทดลอง สร้าง credentials ของตัวเอง แล้วจบที่สร้าง asset ของกลุ่มเอง.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {PILLARS.map((p) => (
            <Link
              key={p.title}
              href={p.href}
              className={`group relative rounded-2xl p-5 sm:p-6 bg-gradient-to-br ${p.accent} border ${p.border} hover:border-[var(--color-brand)] transition-all hover:shadow-lg hover:-translate-y-0.5`}
            >
              <div
                aria-hidden
                className="text-3xl sm:text-4xl mb-3 leading-none"
              >
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

      {/* ─── Stats ─── */}
      <section className="border-y border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold text-[var(--color-brand)] uppercase tracking-wider mb-2">
              Phase 0 · Foundation
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              ตอนนี้บนเครือข่าย
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <Stat
              value={0}
              suffix="+"
              label="Vet SBT Card holders"
              hint="นิสิตที่ claim card แล้ว"
            />
            <Stat
              value={0}
              suffix="+"
              label="assets created"
              hint="token/NFT/DAO จาก The Lab"
            />
            <Stat
              value={0}
              suffix="+"
              label="quest completions"
              hint="Web3 Quests ที่ทำสำเร็จ"
            />
          </div>

          <p className="mt-8 text-center text-xs text-[var(--color-muted)]">
            ตัวเลขจะเริ่มนับเมื่อ Phase 1 launch บน Base Sepolia — ทุก asset เป็น testnet มูลค่า 0 บาท
          </p>
        </div>
      </section>

      {/* ─── Vision quote ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold text-[var(--color-brand)] uppercase tracking-wider mb-3 text-center">
            10-Year Vision
          </p>
          <blockquote className="text-lg sm:text-2xl font-medium leading-relaxed text-center text-[var(--color-text)]">
            <span className="text-[var(--color-brand)] text-3xl leading-none align-top mr-1">
              &ldquo;
            </span>
            เริ่มจาก subdomain เล็กๆ ของชมรมนิสิตคณะสัตวแพทย์ CU แต่ออกแบบให้กลายเป็น
            infrastructure layer สำหรับ student-led web3 ทั่วประเทศไทย — ที่ใดก็ตามที่มีกลุ่มนิสิตอยากเรียนรู้ ทดลอง สร้าง พวกเขาจะเริ่มที่นี่
            <span className="text-[var(--color-brand)] text-3xl leading-none align-bottom ml-1">
              &rdquo;
            </span>
          </blockquote>
          <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
            Palm — VP Planning, CUVETSMO 68
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 gap-4 sm:gap-6">
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

      {/* ─── Final CTA ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div
          className="card bg-[var(--color-brand-light)] border-[var(--color-brand)]/30"
          style={{
            background:
              "linear-gradient(135deg, var(--color-brand-light) 0%, rgba(224,242,254,0.4) 100%)",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--color-brand)] mb-2">
                พร้อมเริ่มต้นหรือยัง?
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
      </section>
    </main>
  );
}
