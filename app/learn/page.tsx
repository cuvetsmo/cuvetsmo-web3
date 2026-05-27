import Link from "next/link";
import { Reveal } from "@/app/(marketing)/_components/reveal";

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
    accent: "from-purple-100/40 to-purple-50/20",
    border: "border-purple-200/50",
    cta: "อ่าน 3 นาที",
    emoji: "🌱",
  },
  {
    href: "/learn/wallet-101",
    title: "Wallet 101",
    sub: "5 นาที, จาก 0 ถึงมี wallet แรก",
    desc: "นั่งทำตาม wizard 5 ขั้นตอน รับ SBT badge แรกเลย",
    badge: "5 min",
    badgeColor: "bg-emerald-100 text-emerald-700",
    accent: "from-emerald-100/40 to-emerald-50/20",
    border: "border-emerald-200/50",
    cta: "เริ่ม Wallet 101",
    emoji: "👛",
  },
  {
    href: "/learn/quests",
    title: "Web3 Quests",
    sub: "10 quests, 1,000 XP รวม",
    desc: "ภารกิจสั้นๆ สอน sign, mint, vote, swap แต่ละครั้งได้ XP + badge",
    badge: "10 quests",
    badgeColor: "bg-sky-100 text-sky-700",
    accent: "from-sky-100/40 to-sky-50/20",
    border: "border-sky-200/50",
    cta: "ดู quests",
    emoji: "🏆",
  },
  {
    href: "/glossary",
    title: "Glossary TH/EN",
    sub: "พจนานุกรม web3",
    desc: "คำศัพท์ web3 พร้อม analogy คนสัตวแพทย์เข้าใจง่าย",
    badge: "พจนานุกรม",
    badgeColor: "bg-amber-100 text-amber-700",
    accent: "from-amber-100/40 to-amber-50/20",
    border: "border-amber-200/50",
    cta: "เปิด glossary",
    emoji: "📖",
  },
] as const;

export default function LearnHubPage() {
  return (
    <main>
      {/* Hero · cloud-bg + Mozi pastel */}
      <section className="relative overflow-hidden cloud-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-10 sm:pb-14">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-brand)] font-semibold mb-2">
              เสาที่ 1 จาก 4 — Learn
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight max-w-3xl">
              เรียนรู้ Web3 จาก{" "}
              <span className="text-[var(--color-brand)]">0</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[var(--color-muted)] max-w-3xl leading-relaxed">
              ไม่เคยรู้จัก crypto มาก่อนก็เริ่มที่นี่ได้ · ทุกหน้าออกแบบสำหรับ
              นิสิตที่ไม่ใช่ developer · เริ่ม Zero to Hero (3 นาที) แล้วต่อ
              Wallet 101 (5 นาที) แล้วลง Quests
            </p>
          </Reveal>
        </div>
      </section>

      {/* Routes grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {ROUTES.map((r, i) => (
            <Reveal key={r.href} delay={i * 80}>
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

        {/* Path callout */}
        <Reveal delay={200}>
          <aside className="mt-10 rounded-2xl bg-[var(--color-brand-light)] border border-[var(--color-brand)]/15 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand)] mb-3">
              Recommended path
            </p>
            <h3 className="font-bold text-lg mb-3">เริ่มต้นยังไงดี?</h3>
            <ol className="grid sm:grid-cols-5 gap-3 text-sm">
              {[
                { n: "1", t: "Zero to Hero", d: "อ่าน 3 นาที · ไม่ต้องสมัครอะไร" },
                { n: "2", t: "Wallet 101", d: "5 นาที · ได้ wallet แรก" },
                { n: "3", t: "Quest 1-3", d: "sign · mint · vote" },
                { n: "4", t: "Glossary", d: "เปิดค้นเมื่อเจอศัพท์ไม่รู้" },
                { n: "5", t: "Vet SBT Card", d: "ไป /build claim บัตร" },
              ].map((s) => (
                <li
                  key={s.n}
                  className="flex flex-col gap-1 p-3 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)]"
                >
                  <span className="text-xs font-mono text-[var(--color-brand)]">
                    STEP {s.n}
                  </span>
                  <span className="font-semibold text-sm">{s.t}</span>
                  <span className="text-xs text-[var(--color-muted)] leading-snug">
                    {s.d}
                  </span>
                </li>
              ))}
            </ol>
          </aside>
        </Reveal>
      </section>
    </main>
  );
}
