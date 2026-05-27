import Link from "next/link";
import { Reveal } from "@/app/(marketing)/_components/reveal";

export const metadata = {
  title: "Build — ระบบจริงสำหรับนิสิต CU Vet",
  description: "Vet SBT Card, badge collection, profile — ระบบที่ใช้ได้จริงในชีวิตสโม",
};

const ROUTES = [
  {
    href: "/build/card",
    title: "Vet SBT Card",
    sub: "บัตรนิสิตดิจิทัล · soulbound · ของฉันเอง",
    desc: "claim บัตร non-transferable ผูกกับ wallet · ระบุปีที่เข้าเรียน คณะ ภาควิชา · ใช้พิสูจน์ตัวตน vet ได้",
    badge: "MVP",
    badgeColor: "bg-emerald-100 text-emerald-700",
    accent: "from-sky-100/50 to-cyan-50/30",
    border: "border-sky-200/60",
    cta: "Claim card",
    emoji: "🪪",
  },
  {
    href: "/build/profile",
    title: "Profile + Badges",
    sub: "ดู wallet · card · badges · XP",
    desc: "หน้ารวมข้อมูลของคุณ · บัตร badges สะสมจาก quests/events · XP total · พร้อม attestation history",
    badge: "Personal",
    badgeColor: "bg-sky-100 text-sky-700",
    accent: "from-purple-100/40 to-violet-50/20",
    border: "border-purple-200/50",
    cta: "เปิด profile",
    emoji: "👤",
  },
] as const;

const COMING_NEXT = [
  {
    title: "Vet DAO",
    blurb: "โหวตเรื่องสำคัญของสโมบน blockchain · Snapshot mode",
    timing: "Phase 2",
  },
  {
    title: "Welfare Treasury",
    blurb: "บริจาคโปร่งใส · ตามดูเงินไปไหน · RWA รอ regulator",
    timing: "Phase 2",
  },
  {
    title: "Event Check-in via SBT",
    blurb: "กิจกรรมสโม แตะรับ badge ใส่ใน collection",
    timing: "Phase 2",
  },
] as const;

export default function BuildHubPage() {
  return (
    <main>
      <section className="relative overflow-hidden cloud-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-10 sm:pb-14">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-brand)] font-semibold mb-2">
              เสาที่ 3 จาก 4 — Build
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight max-w-3xl">
              ระบบจริงสำหรับนิสิต{" "}
              <span className="text-[var(--color-brand)]">CU Vet</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[var(--color-muted)] max-w-3xl leading-relaxed">
              ไม่ใช่ของเล่น · flagship products ที่นิสิตใช้ได้จริง · เริ่มจาก
              Vet SBT Card identity ที่ติดตัวคุณตลอดอายุการเรียน · gasless mint
              ผ่าน Pimlico ไม่ต้องเสีย ETH
            </p>
          </Reveal>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          {ROUTES.map((r, i) => (
            <Reveal key={r.href} delay={i * 120}>
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

        {/* Coming next · grid of 3 */}
        <Reveal delay={200}>
          <div className="mt-12">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)] font-semibold mb-4">
              Coming in Phase 2 — กำลังพัฒนา
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {COMING_NEXT.map((c, i) => (
                <Reveal key={c.title} delay={i * 80}>
                  <div className="rounded-2xl p-5 bg-[var(--color-card)] border border-dashed border-[var(--color-border)] h-full">
                    <div className="flex items-baseline justify-between mb-2">
                      <h3 className="font-bold text-sm">{c.title}</h3>
                      <span className="text-[10px] font-mono uppercase text-[var(--color-muted)]">
                        {c.timing}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                      {c.blurb}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
