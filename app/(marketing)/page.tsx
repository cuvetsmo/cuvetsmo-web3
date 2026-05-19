import Link from "next/link";
import Image from "next/image";

/**
 * Landing page (Wave 1 placeholder).
 *
 * Agent E will rewrite with copy, brand assets, real CTAs.
 * Keep enough content here that the site doesn't look broken on first visit.
 */

const PILLARS = [
  {
    title: "Learn",
    titleTh: "เรียนรู้",
    description:
      "เริ่มจากศูนย์ — Wallet 101, quests, glossary. ไม่ต้องมีพื้นฐาน crypto",
    href: "/learn/wallet-101",
    cta: "เริ่ม Wallet 101",
    accent: "from-sky-500 to-sky-700",
  },
  {
    title: "Play",
    titleTh: "ทดลองเล่น",
    description:
      "Sandbox สำหรับลอง mint NFT, swap token, ลงคะแนน DAO โดยไม่ใช้เงินจริง",
    href: "/play/mint",
    cta: "เข้า playground",
    accent: "from-emerald-500 to-emerald-700",
  },
  {
    title: "Build",
    titleTh: "สร้าง",
    description:
      "Vet SBT Card, Profile builder, badge collection. สร้าง credentials ของตัวเองบน-chain",
    href: "/build/card",
    cta: "สร้าง Vet Card",
    accent: "from-amber-500 to-amber-700",
  },
  {
    title: "The Lab",
    titleTh: "ห้องแล็บ",
    description:
      "No-code factory — สร้าง token, NFT collection, DAO, mini-DApp ได้ในไม่กี่นาที",
    href: "/lab/token-forge",
    cta: "เข้าห้องแล็บ",
    accent: "from-purple-500 to-purple-700",
  },
] as const;

export default function LandingPage() {
  return (
    <main>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-12">
        <div className="flex justify-center mb-6">
          <Image
            src="/smo-logo.png"
            alt="CUVETSMO"
            width={72}
            height={72}
            className="rounded-xl shadow-sm"
            priority
          />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-center max-w-3xl mx-auto leading-tight">
          เครื่องมือ Web3{" "}
          <span className="text-[var(--color-brand)]">สำหรับนิสิตสัตวแพทย์</span>{" "}
          จุฬาฯ
        </h1>
        <p className="mt-6 text-base sm:text-lg text-[var(--color-muted)] text-center max-w-2xl mx-auto leading-relaxed">
          เรียนรู้ ทดลอง สร้าง — Web3 playground ที่ออกแบบให้นิสิตทุกคนเข้าใจได้
          ไม่ต้องมีพื้นฐาน crypto. ทุกอย่างรันบน Base Sepolia testnet ไม่ใช้เงินจริง.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/learn/wallet-101" className="btn-brand text-center">
            เริ่มต้น Wallet 101
          </Link>
          <Link href="/about" className="btn-outline text-center">
            อ่าน vision เต็มๆ
          </Link>
        </div>
      </section>

      {/* 4 pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold text-[var(--color-brand)] uppercase tracking-wide mb-2">
            4 เสาหลัก
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Learn, Play, Build, The Lab
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {PILLARS.map((p) => (
            <Link
              key={p.title}
              href={p.href}
              className="card group hover:shadow-md"
            >
              <div className="flex items-baseline gap-3 mb-2">
                <h3 className="text-xl font-bold tracking-tight">{p.title}</h3>
                <span className="text-sm text-[var(--color-muted)]">
                  {p.titleTh}
                </span>
              </div>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">
                {p.description}
              </p>
              <span className="text-sm font-medium text-[var(--color-brand)] group-hover:underline">
                {p.cta} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Status band */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 mb-8">
        <div className="card bg-[var(--color-brand-light)] border-[var(--color-brand)]/30">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--color-brand)] mb-1">
                Phase 0 — Foundation shipping
              </p>
              <p className="text-xs text-[var(--color-muted)]">
                Wave 1 (today): scaffold + auth + routing. Wave 2: contracts +
                content + pages. Wave 3: production deploy.
              </p>
            </div>
            <Link
              href="https://github.com/cuvetsmo/cuvetsmo-web3"
              className="btn-outline text-sm shrink-0"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
