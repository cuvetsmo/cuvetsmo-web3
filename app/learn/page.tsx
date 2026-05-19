import Link from "next/link";

export const metadata = {
  title: "Learn — เรียนรู้ Web3 จาก 0",
  description:
    "Wallet 101, Web3 Quests, Glossary — เรียนรู้ web3 ทีละขั้นแบบไม่กลัวเสียเงิน",
};

const ROUTES = [
  {
    href: "/learn/zero-to-hero",
    title: "Zero to Hero",
    sub: "3 นาที, เข้าใจ Web3 จาก 0",
    desc: "ไม่เคยได้ยินคำว่า blockchain เลยก็เริ่มได้ — 5 ขั้นสั้นๆ พร้อม analogy",
    badge: "เริ่มต้น",
    badgeColor: "bg-purple-100 text-purple-700",
  },
  {
    href: "/learn/wallet-101",
    title: "Wallet 101",
    sub: "5 นาที, จาก 0 ถึงมี wallet แรก",
    desc: "นั่งทำตาม wizard 5 ขั้นตอน รับ SBT badge แรกเลย",
    badge: "5 min",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    href: "/learn/quests",
    title: "Web3 Quests",
    sub: "10 quests, 1,000 XP รวม",
    desc: "ภารกิจสั้นๆ สอน sign, mint, vote, swap แต่ละครั้งได้ XP + badge",
    badge: "10 quests",
    badgeColor: "bg-sky-100 text-sky-700",
  },
  {
    href: "/glossary",
    title: "Glossary TH/EN",
    sub: "พจนานุกรม web3",
    desc: "คำศัพท์ web3 พร้อม analogy คนสัตวแพทย์เข้าใจง่าย",
    badge: "พจนานุกรม",
    badgeColor: "bg-amber-100 text-amber-700",
  },
] as const;

export default function LearnHubPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <header className="space-y-4 max-w-3xl">
        <p className="text-xs uppercase tracking-wider text-[var(--color-brand)] font-semibold">
          เสาที่ 1 จาก 4
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Learn — เรียนรู้ Web3 จาก 0
        </h1>
        <p className="text-lg text-[var(--color-text-muted)]">
          ไม่เคยรู้จัก crypto มาก่อนก็เริ่มที่นี่ได้ ทุกหน้าออกแบบสำหรับนิสิตที่ไม่ใช่ developer
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
              เริ่มเรียน →
            </span>
          </Link>
        ))}
      </div>

      <aside className="rounded-2xl bg-[var(--color-brand-light)] border border-[var(--color-brand)]/15 p-6">
        <h3 className="font-semibold mb-2">เริ่มต้นยังไงดี?</h3>
        <ol className="list-decimal pl-5 space-y-1.5 text-sm text-[var(--color-text-muted)]">
          <li>ถ้ายังไม่เข้าใจ Web3 เลย — ทำ Zero to Hero ก่อน (3 นาที, อ่านอย่างเดียว)</li>
          <li>จากนั้น Wallet 101 (5 นาที, ได้ wallet แรก)</li>
          <li>ลองทำ Quest 1-3 (sign, mint, vote)</li>
          <li>เปิด Glossary ทุกครั้งที่เจอศัพท์ไม่รู้</li>
          <li>พร้อมแล้วไปทำต่อที่ Build (Vet SBT Card)</li>
        </ol>
      </aside>
    </div>
  );
}
