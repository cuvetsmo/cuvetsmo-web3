import Link from "next/link";
import { Reveal } from "@/app/(marketing)/_components/reveal";

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
    desc: "drag-drop รูป กรอกชื่อ กด mint รูปขึ้น IPFS + token ขึ้น blockchain ใน 30 วินาที",
    badge: "30 วินาที",
    badgeColor: "bg-fuchsia-100 text-fuchsia-700",
    accent: "from-fuchsia-100/40 to-pink-50/20",
    border: "border-fuchsia-200/50",
    cta: "mint ตอนนี้",
    emoji: "🎨",
  },
  {
    href: "/play/board",
    title: "On-chain Board",
    sub: "Guestbook + Polls",
    desc: "เขียนข้อความฝากไว้ตลอดกาลบน blockchain หรือเปิดโพลให้คนโหวต",
    badge: "ลายเซ็นถาวร",
    badgeColor: "bg-sky-100 text-sky-700",
    accent: "from-sky-100/40 to-blue-50/20",
    border: "border-sky-200/50",
    cta: "เปิด board",
    emoji: "📝",
  },
  {
    href: "/play/swap",
    title: "Swap Sandbox",
    sub: "DEMO เรียน AMM ไม่เสียเงิน",
    desc: "เลื่อน slider ดู constant product curve กับ impermanent loss ก่อนเข้าใจ DeFi",
    badge: "DEMO",
    badgeColor: "bg-amber-100 text-amber-700",
    accent: "from-amber-100/40 to-yellow-50/20",
    border: "border-amber-200/50",
    cta: "ลอง swap",
    emoji: "🔁",
  },
] as const;

export default function PlayHubPage() {
  return (
    <main>
      <section className="relative overflow-hidden cloud-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-10 sm:pb-14">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-brand)] font-semibold mb-2">
              เสาที่ 2 จาก 4 — Play
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight max-w-3xl">
              ทดลอง Web3 บน{" "}
              <span className="text-[var(--color-brand)]">sandbox</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[var(--color-muted)] max-w-3xl leading-relaxed">
              ทดลองเล่นทุก primitive ของ web3 บน Base Sepolia testnet ฟรี ·
              ไม่ต้องกลัวพลาดเสียเงิน · เริ่ม Mint NFT ก่อน แล้วลอง Board / Swap
            </p>
          </Reveal>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {ROUTES.map((r, i) => (
            <Reveal key={r.href} delay={i * 100}>
              <Link
                href={r.href}
                className={`group relative flex flex-col gap-3 p-5 sm:p-6 rounded-2xl bg-gradient-to-br ${r.accent} border ${r.border} hover:border-[var(--color-brand)] hover:shadow-lg hover:-translate-y-0.5 transition-all h-full`}
              >
                <div className="flex items-start justify-between">
                  <span aria-hidden className="text-3xl leading-none">
                    {r.emoji}
                  </span>
                  <span
                    className={`inline-block self-start text-[11px] font-semibold px-2 py-0.5 rounded-full ${r.badgeColor}`}
                  >
                    {r.badge}
                  </span>
                </div>
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
                  {r.cta} <span aria-hidden>→</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* Testnet warning · Reveal in */}
        <Reveal delay={200}>
          <aside className="mt-10 rounded-2xl bg-amber-50 border border-amber-200 p-6 sm:p-8 dark:bg-amber-900/20 dark:border-amber-700/40">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <span aria-hidden className="text-3xl leading-none shrink-0">
                ⚠️
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-amber-900 dark:text-amber-200 mb-1">
                  Testnet · ไม่มีค่าเงินจริง
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                  ทุก token / NFT / message ที่สร้างที่นี่อยู่บน Base Sepolia
                  testnet (chainId 84532) · กดเล่นได้สบายใจ · ไม่มีอะไรเสีย · ไม่มี
                  real-money exposure จาก side ใดเลย
                </p>
              </div>
              <Link
                href="/learn/wallet-101"
                className="btn-outline shrink-0 whitespace-nowrap text-sm"
              >
                ยังไม่มี wallet? เริ่ม Wallet 101 →
              </Link>
            </div>
          </aside>
        </Reveal>
      </section>
    </main>
  );
}
