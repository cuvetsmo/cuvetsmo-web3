import Link from "next/link";

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
    desc: "กรอกชื่อ symbol supply แล้ว deploy เหรียญของชมรมตัวเองได้ใน 30 วินาที",
    icon: "🪙",
  },
  {
    href: "/lab/nft-studio",
    title: "NFT Studio",
    sub: "ERC-721 collection deployer",
    desc: "upload รูป metadata mint page ของตัวเอง royalty ก็ใส่ได้",
    icon: "🖼️",
  },
  {
    href: "/lab/sbt-maker",
    title: "SBT Maker",
    sub: "Soulbound non-transferable",
    desc: "ออก credential badge attendance certificate ผูกติด address ตลอดกาล",
    icon: "🎖️",
  },
  {
    href: "/lab/dao-quickstart",
    title: "DAO Quickstart",
    sub: "Snapshot space หรือ Governor",
    desc: "ตั้ง DAO โหวตของชมรม Snapshot ฟรี on-chain Governor advanced",
    icon: "🏛️",
  },
  {
    href: "/lab/page-builder",
    title: "Page Builder",
    sub: "DApp page drag and drop",
    desc: "ลาก component mint button vote widget สร้างหน้าเว็บ web3 ของตัวเอง",
    icon: "🧩",
  },
  {
    href: "/lab/templates",
    title: "Template Library",
    sub: "Lottery, Tip Jar, Staking ฯลฯ",
    desc: "7 contract template พร้อม source code ดู edit fork on Remix",
    icon: "📚",
  },
] as const;

export default function LabHubPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <header className="space-y-4 max-w-3xl">
        <p className="text-xs uppercase tracking-wider text-[var(--color-brand)] font-semibold">
          เสาที่ 4 จาก 4
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          The Lab — สร้าง Token NFT DAO เอง
        </h1>
        <p className="text-lg text-[var(--color-text-muted)]">
          ไม่ต้องเขียน Solidity เป็น กรอกฟอร์ม กดปุ่ม ก็ได้ contract ของตัวเองบน blockchain
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {ROUTES.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="group flex flex-col gap-3 p-6 rounded-2xl border border-[var(--color-border)] bg-white hover:border-[var(--color-brand)] hover:shadow-lg transition-all"
          >
            <span className="text-3xl leading-none" aria-hidden>
              {r.icon}
            </span>
            <h2 className="text-lg font-semibold tracking-tight group-hover:text-[var(--color-brand)]">
              {r.title}
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] font-medium">
              {r.sub}
            </p>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              {r.desc}
            </p>
            <span className="mt-auto text-sm font-medium text-[var(--color-brand)] group-hover:translate-x-1 transition-transform">
              เปิด →
            </span>
          </Link>
        ))}
      </div>

      <aside className="rounded-2xl bg-amber-50 border border-amber-200 p-6 text-sm">
        <p className="font-semibold text-amber-900 mb-1">🧪 Educational testnet</p>
        <p className="text-amber-800 leading-relaxed">
          ทุก contract ที่ deploy จาก The Lab อยู่บน Base Sepolia testnet
          ของ user-created ไม่ได้รับการ audit หรือ endorse จาก CUVETSMO Web3
          ใช้สำหรับเรียนรู้และทดลองเท่านั้น ห้ามใช้กับ asset ที่มีค่าจริง
        </p>
      </aside>
    </div>
  );
}
