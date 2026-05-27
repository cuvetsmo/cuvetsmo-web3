import Link from "next/link";
import { Reveal } from "@/app/(marketing)/_components/reveal";

export const metadata = {
  title: "The Lab — สร้าง Token NFT DAO เอง",
  description:
    "Token Forge, NFT Studio, SBT Maker, DAO Quickstart, Page Builder, Template Library — สร้างได้ใน 30 วินาทีไม่ต้องเขียน code",
};

const ROUTES = [
  {
    href: "/lab/token-forge",
    title: "Token Forge",
    sub: "ERC-20 deployer",
    desc: "กรอกชื่อ · symbol · supply แล้ว deploy เหรียญของชมรมตัวเองได้ใน 30 วินาที",
    icon: "🪙",
    accent: "from-amber-100/40 to-yellow-50/20",
    border: "border-amber-200/50",
  },
  {
    href: "/lab/nft-studio",
    title: "NFT Studio",
    sub: "ERC-721 collection deployer",
    desc: "upload รูป · metadata · mint page ของตัวเอง · royalty ก็ใส่ได้",
    icon: "🖼️",
    accent: "from-pink-100/40 to-rose-50/20",
    border: "border-pink-200/50",
  },
  {
    href: "/lab/sbt-maker",
    title: "SBT Maker",
    sub: "Soulbound · non-transferable",
    desc: "ออก credential / badge / attendance / certificate ผูกติด address ตลอดกาล",
    icon: "🎖️",
    accent: "from-emerald-100/40 to-teal-50/20",
    border: "border-emerald-200/50",
  },
  {
    href: "/lab/dao-quickstart",
    title: "DAO Quickstart",
    sub: "Snapshot space หรือ Governor",
    desc: "ตั้ง DAO โหวตของชมรม · Snapshot ฟรี · on-chain Governor advanced",
    icon: "🏛️",
    accent: "from-sky-100/40 to-blue-50/20",
    border: "border-sky-200/50",
  },
  {
    href: "/lab/page-builder",
    title: "Page Builder",
    sub: "DApp page · drag and drop",
    desc: "ลาก component · mint button · vote widget · สร้างหน้าเว็บ web3 ของตัวเอง",
    icon: "🧩",
    accent: "from-purple-100/40 to-violet-50/20",
    border: "border-purple-200/50",
  },
  {
    href: "/lab/templates",
    title: "Template Library",
    sub: "Lottery · Tip Jar · Staking ฯลฯ",
    desc: "7 contract templates พร้อม source code · ดู edit fork on Remix · vet-specific 3 ตัวพิเศษ",
    icon: "📚",
    accent: "from-slate-100/40 to-gray-50/20",
    border: "border-slate-200/50",
  },
] as const;

export default function LabHubPage() {
  return (
    <main>
      <section className="relative overflow-hidden cloud-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-10 sm:pb-14">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-brand)] font-semibold mb-2">
              เสาที่ 4 จาก 4 — The Lab
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight max-w-3xl">
              สร้าง Token / NFT / DAO{" "}
              <span className="text-[var(--color-brand)]">เอง</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[var(--color-muted)] max-w-3xl leading-relaxed">
              ไม่ต้องเขียน Solidity เป็น · กรอกฟอร์ม · กดปุ่ม · ก็ได้ contract
              ของตัวเองบน blockchain ใน 30 วินาที · gasless ผ่าน Pimlico paymaster
            </p>
          </Reveal>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {ROUTES.map((r, i) => (
            <Reveal key={r.href} delay={i * 70}>
              <Link
                href={r.href}
                className={`group relative flex flex-col gap-3 p-5 sm:p-6 rounded-2xl bg-gradient-to-br ${r.accent} border ${r.border} hover:border-[var(--color-brand)] hover:shadow-lg hover:-translate-y-0.5 transition-all h-full`}
              >
                <span aria-hidden className="text-3xl leading-none mb-1">
                  {r.icon}
                </span>
                <h2 className="text-lg font-bold tracking-tight group-hover:text-[var(--color-brand)] transition-colors">
                  {r.title}
                </h2>
                <p className="text-sm text-[var(--color-muted)] font-medium">
                  {r.sub}
                </p>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                  {r.desc}
                </p>
                <span className="mt-auto text-sm font-medium text-[var(--color-brand)] inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  เปิดเครื่องมือ <span aria-hidden>→</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* Testnet warning */}
        <Reveal delay={250}>
          <aside className="mt-10 rounded-2xl bg-amber-50 border border-amber-200 p-6 sm:p-8 dark:bg-amber-900/20 dark:border-amber-700/40">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <span aria-hidden className="text-3xl leading-none shrink-0">
                🧪
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-amber-900 dark:text-amber-200 mb-1">
                  Educational testnet
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                  ทุก contract ที่ deploy จาก The Lab อยู่บน Base Sepolia testnet
                  (chainId 84532) · ของ user-created ไม่ได้รับการ audit หรือ
                  endorse จาก CUVETSMO Web3 · ใช้สำหรับเรียนรู้และทดลองเท่านั้น ·
                  ห้ามใช้กับ asset ที่มีค่าจริง
                </p>
              </div>
              <Link
                href="/about"
                className="btn-outline shrink-0 whitespace-nowrap text-sm"
              >
                อ่าน roadmap mainnet →
              </Link>
            </div>
          </aside>
        </Reveal>
      </section>
    </main>
  );
}
