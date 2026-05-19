import Link from "next/link";

export const metadata = {
  title: "Play — ทดลอง Web3 บน sandbox",
  description:
    "Mint NFT, post ข้อความบน blockchain, ลอง swap ทดสอบกลไกแบบไม่ใช้เงินจริง",
};

const ROUTES = [
  {
    href: "/play/mint",
    title: "Mint Playground",
    sub: "อัพรูปแล้วได้ NFT/SBT ทันที",
    desc: "drag drop รูป กรอกชื่อ กด mint รูปขึ้น IPFS + token ขึ้น blockchain ใน 30 วินาที",
    badge: "30 วินาที",
    badgeColor: "bg-fuchsia-100 text-fuchsia-700",
  },
  {
    href: "/play/board",
    title: "On-chain Board",
    sub: "Guestbook + Polls",
    desc: "เขียนข้อความฝากไว้ตลอดกาลบน blockchain หรือเปิดโพลให้คนโหวต",
    badge: "ลายเซ็นถาวร",
    badgeColor: "bg-sky-100 text-sky-700",
  },
  {
    href: "/play/swap",
    title: "Swap Sandbox",
    sub: "DEMO เรียน AMM ไม่เสียเงิน",
    desc: "เลื่อน slider ดู constant product curve กับ impermanent loss ก่อนเข้าใจ DeFi",
    badge: "DEMO",
    badgeColor: "bg-amber-100 text-amber-700",
  },
] as const;

export default function PlayHubPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <header className="space-y-4 max-w-3xl">
        <p className="text-xs uppercase tracking-wider text-[var(--color-brand)] font-semibold">
          เสาที่ 2 จาก 4
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Play — ทดลอง Web3 บน sandbox
        </h1>
        <p className="text-lg text-[var(--color-text-muted)]">
          ทดลองเล่นทุก primitive ของ web3 บน testnet ฟรี ไม่ต้องกลัวพลาดเสียเงิน
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {ROUTES.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="group flex flex-col gap-3 p-6 rounded-2xl border border-[var(--color-border)] bg-white hover:border-[var(--color-brand)] hover:shadow-lg transition-all"
          >
            <span
              className={`inline-block self-start text-[11px] font-semibold px-2 py-0.5 rounded-full ${r.badgeColor}`}
            >
              {r.badge}
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
              ลองเลย →
            </span>
          </Link>
        ))}
      </div>

      <aside className="rounded-2xl bg-amber-50 border border-amber-200 p-6 text-sm">
        <p className="font-semibold text-amber-900 mb-1">⚠️ Testnet · ไม่มีค่าเงินจริง</p>
        <p className="text-amber-800 leading-relaxed">
          ทุก token, NFT, message ที่สร้างที่นี่อยู่บน Base Sepolia testnet กดเล่นได้สบายใจ ไม่มีอะไรเสีย
        </p>
      </aside>
    </div>
  );
}
