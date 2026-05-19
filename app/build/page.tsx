import Link from "next/link";

export const metadata = {
  title: "Build — ระบบจริงสำหรับนิสิต CU Vet",
  description: "Vet SBT Card, badge collection, profile — ระบบที่ใช้ได้จริงในชีวิตสโม",
};

const ROUTES = [
  {
    href: "/build/card",
    title: "Vet SBT Card",
    sub: "บัตรนิสิตดิจิทัล (soulbound, ของฉันเอง)",
    desc: "claim บัตร non-transferable ผูกกับ wallet ระบุปีที่เข้าเรียน คณะ ภาควิชา ใช้พิสูจน์ตัวตนได้",
    badge: "MVP",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    href: "/build/profile",
    title: "Profile + Badges",
    sub: "ดู wallet, card, badges, XP",
    desc: "หน้ารวมข้อมูลของคุณ บัตร badges สะสมจาก quests/events XP total",
    badge: "Personal",
    badgeColor: "bg-sky-100 text-sky-700",
  },
] as const;

export default function BuildHubPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <header className="space-y-4 max-w-3xl">
        <p className="text-xs uppercase tracking-wider text-[var(--color-brand)] font-semibold">
          เสาที่ 3 จาก 4
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Build — ระบบจริงสำหรับนิสิต CU Vet
        </h1>
        <p className="text-lg text-[var(--color-text-muted)]">
          ไม่ใช่ของเล่น flagship products ที่นิสิตใช้ได้จริง เริ่มจาก Vet SBT Card identity ที่ติดตัวคุณตลอดอายุการเรียน
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-5">
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
              เริ่ม →
            </span>
          </Link>
        ))}
      </div>

      <aside className="rounded-2xl bg-[var(--color-brand-light)] border border-[var(--color-brand)]/15 p-6">
        <h3 className="font-semibold mb-2">ขั้นถัดไป (กำลังพัฒนา)</h3>
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-[var(--color-text-muted)]">
          <li><strong>Vet DAO</strong> — โหวตเรื่องสำคัญของสโมบน blockchain (Snapshot mode)</li>
          <li><strong>Welfare Treasury</strong> — บริจาคโปร่งใส ตามดูเงินไปไหน (RWA, รอ regulator)</li>
          <li><strong>Event check-in via SBT</strong> — กิจกรรมสโม แตะรับ badge ใส่ใน collection</li>
        </ul>
      </aside>
    </div>
  );
}
