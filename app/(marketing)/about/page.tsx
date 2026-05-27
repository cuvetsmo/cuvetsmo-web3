import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "../_components/reveal";

export const metadata: Metadata = {
  title: "About",
  description:
    "ทำไมเราสร้าง web3 playground สำหรับนิสิตสัตวแพทย์ — vision, team, 4 pillars, tech stack, roadmap.",
  openGraph: {
    title: "About — CUVETSMO Web3",
    description:
      "วิสัยทัศน์ 10 ปี · 4 เสาหลัก · ทีม · roadmap · tech stack",
    // images omitted · falls through to app/opengraph-image.tsx
  },
};

const PILLARS = [
  {
    name: "Learn",
    nameTh: "เรียนรู้",
    icon: "📚",
    role: "Educational on-ramp",
    detail:
      "Wallet 101 พา beginner จาก 0 ไป wallet แรกใน 10 นาที. Web3 Quests สอน concept แบบ hands-on. Glossary TH/EN ให้ค้นศัพท์ได้ทุกเมื่อ.",
    accent: "from-purple-100/40 to-purple-50/20",
    border: "border-purple-200/50",
  },
  {
    name: "Play",
    nameTh: "ทดลองเล่น",
    icon: "🎮",
    role: "Sandbox — zero risk",
    detail:
      "Mint NFT, sign message, swap token, vote ใน DAO poll — ทุกอย่างบน testnet ไม่มีค่าใช้จ่ายและไม่มีความเสี่ยงเสียเงินจริง.",
    accent: "from-fuchsia-100/40 to-pink-50/20",
    border: "border-fuchsia-200/50",
  },
  {
    name: "Build",
    nameTh: "สร้าง",
    icon: "🛠️",
    role: "Flagship products",
    detail:
      "Vet SBT Card (soulbound identity), Profile, Badge collection. Welfare Treasury และ Vet DAO ตามมาใน Phase 2.",
    accent: "from-sky-100/40 to-cyan-50/20",
    border: "border-sky-200/50",
  },
  {
    name: "The Lab",
    nameTh: "ห้องแล็บ",
    icon: "🧪",
    role: "No-code factory",
    detail:
      "Token Forge, NFT Studio, SBT Maker, DAO Quickstart — สร้าง asset/องค์กร on-chain ของตัวเองได้ใน 30 วินาที โดยไม่ต้องเขียน Solidity.",
    accent: "from-emerald-100/40 to-teal-50/20",
    border: "border-emerald-200/50",
  },
] as const;

const TECH_STACK = [
  {
    layer: "Smart contracts",
    items: ["Solidity 0.8.x", "Foundry", "OpenZeppelin v5", "ERC-721 / ERC-1155 / ERC-5114 SBT"],
  },
  {
    layer: "Chain",
    items: ["Base Sepolia (Phase 1)", "Base mainnet (audit-gated, Phase 2)", "Multi-tenant orgId"],
  },
  {
    layer: "Frontend",
    items: ["Next.js 16 (App Router)", "React 19", "Tailwind v4", "TypeScript 5"],
  },
  {
    layer: "Auth + Wallet",
    items: ["Privy (embedded wallet · email/social)", "Coinbase Smart Account v1.1", "Pimlico paymaster · ERC-4337"],
  },
  {
    layer: "Storage + Infra",
    items: ["Pinata (IPFS metadata)", "Vercel (hosting)", "Goldsky (subgraph indexer, Phase 1)"],
  },
  {
    layer: "Identity + Attestation",
    items: ["EAS (Ethereum Attestation Service)", "3 schemas: VetCard · Badge · Guestbook", "Privy email gate · @chula.ac.th"],
  },
] as const;

const TEAM = [
  {
    name: "Palm (ปาล์ม)",
    role: "Web3 Lead, CUVETSMO 68 VP Planning",
    detail:
      "Vet 86 — ออกแบบ architecture, ดูแล smart contracts + frontend, เขียน master plan.",
  },
  {
    name: "Boom (บูม)",
    role: "CUVETSMO 69 President",
    detail:
      "Vet 87 — ดูแลการเชื่อม web3 platform กับงานสโมและกิจการนิสิต Phase 2 onwards.",
  },
  {
    name: "Faculty Advisor",
    role: "TBD — กำลังหา",
    detail:
      "อาจารย์ที่ปรึกษาด้าน digital transformation และกิจการนิสิต กำลังประเมินกับทีมที่ปรึกษา CUVET.",
  },
] as const;

const ROADMAP = [
  {
    phase: "Phase 0",
    label: "Educational testnet",
    status: "done",
    detail: "11 contracts บน Base Sepolia · marketing landing · 4 pillars · EAS pipeline e2e",
  },
  {
    phase: "Phase 1",
    label: "Pre-mainnet polish",
    status: "active",
    detail: "Indexer + audit prep + mobile perf · ดู /roadmap หน้าเฉพาะ",
  },
  {
    phase: "Phase 2",
    label: "Mainnet · audit-gated",
    status: "next",
    detail: "5 low-risk contracts mainnet · real Vet SBT Card mint · funded deployer",
  },
  {
    phase: "Phase 3",
    label: "Cross-faculty CU",
    status: "future",
    detail: "Eng / Med / Dent / Pharm · cross-faculty Quest schemas",
  },
  {
    phase: "Phase 4",
    label: "Multi-university",
    status: "future",
    detail: "Open onboarding · federated EAS · student-led DAO Treasury",
  },
] as const;

export default function AboutPage() {
  return (
    <main>
      {/* Hero · cloud-bg */}
      <section className="relative overflow-hidden cloud-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-10 sm:pb-14">
          <Reveal>
            <p className="text-xs font-semibold text-[var(--color-brand)] uppercase tracking-[0.18em] mb-2">
              About — เกี่ยวกับเรา
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 max-w-4xl">
              ทำไมเราสร้าง{" "}
              <span className="text-[var(--color-brand)]">web3 platform</span>
              {" "}สำหรับนิสิตสัตวแพทย์
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-muted)] max-w-3xl leading-relaxed">
              Web3 ในไทยถูก dominate ด้วย trader culture · ไม่มี on-ramp ที่
              ปลอดภัยสำหรับนิสิตที่อยากเรียนรู้ + สร้างโดยไม่ต้องเสี่ยงเงินจริง ·
              CUVETSMO เริ่มต้นจากตรงนี้ — เพื่อให้นิสิตสัตวแพทย์ CU
              เข้าใจและทดลอง web3 ได้แบบที่อาจารย์ก็แนะนำต่อได้
            </p>
          </Reveal>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-16">
        {/* Origin story */}
        <section>
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">
              จุดเริ่มต้น — The origin
            </h2>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            <Reveal delay={80}>
              <div className="card h-full">
                <p className="text-sm leading-relaxed text-[var(--color-text)]">
                  <strong className="text-[var(--color-brand)]">
                    Account Abstraction (ERC-4337)
                  </strong>{" "}
                  mature พอแล้วที่จะเปลี่ยน wallet UX จาก geek tool เป็น consumer product. L2 อย่าง Base ทำให้ gas ไม่ใช่ปัญหา. และกฎหมายไทยกำลังเปิดทาง educational + non-financial DApps อย่างปลอดภัย.
                </p>
              </div>
            </Reveal>
            <Reveal delay={160}>
              <div className="card h-full">
                <p className="text-sm leading-relaxed text-[var(--color-text)]">
                  ขณะเดียวกัน{" "}
                  <strong className="text-[var(--color-brand)]">
                    ยังไม่มี Thai-language web3 education platform
                  </strong>{" "}
                  ที่จริงจัง — first-mover advantage ชัด. เทรนด์ student-led web3 ขึ้นทั่วโลก (Berkeley Blockchain, Stanford Blyth) แต่ใน ASEAN ยังว่าง — เริ่มที่นี่ก่อน scale.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={240}>
            <div className="mt-6 p-5 sm:p-6 rounded-xl bg-[var(--color-brand-light)] border border-[var(--color-brand)]/20">
              <p className="text-sm leading-relaxed text-[var(--color-text)]">
                <strong className="text-[var(--color-brand)]">
                  เริ่มที่นิสิตสัตวแพทย์ CU เพราะ:
                </strong>{" "}
                เล็กพอที่ iterate เร็ว · มี community เหนียวแน่น · vet เป็น domain ที่มี real-world use case (welfare treasury, attendance SBT) ที่ทรงพลังกว่า generic student club platform
              </p>
            </div>
          </Reveal>
        </section>

        {/* 4 Pillars detail */}
        <section>
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              4 เสาหลัก — ทำไมต้อง 4 ไม่ใช่ 2 ไม่ใช่ 6
            </h2>
            <p className="text-sm text-[var(--color-muted)] mb-6 max-w-2xl">
              2 เสา (Learn + Build) ไม่พอ — ขาด safe space ทดลองและขาด user creation. 6+ เสา confusing และ dilute focus.{" "}
              <strong>4 เสา</strong>เป็น sweet spot — แต่ละอันมี job-to-be-done ชัด
            </p>
          </Reveal>
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
            {PILLARS.map((p, i) => (
              <Reveal key={p.name} delay={i * 80}>
                <div
                  className={`rounded-2xl p-5 sm:p-6 bg-gradient-to-br ${p.accent} border ${p.border} h-full`}
                >
                  <div className="flex items-start gap-3">
                    <div aria-hidden className="text-3xl leading-none shrink-0">
                      {p.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <h3 className="text-lg font-bold tracking-tight">{p.name}</h3>
                        <span className="text-xs text-[var(--color-muted)]">
                          {p.nameTh}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[var(--color-brand)] mb-2 uppercase tracking-wide">
                        {p.role}
                      </p>
                      <p className="text-sm leading-relaxed text-[var(--color-text)]">
                        {p.detail}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={400}>
            <p className="mt-6 text-center text-sm text-[var(--color-muted)] max-w-3xl mx-auto">
              User journey: Learn → Play → Build → The Lab. แต่ละ pillar
              reinforce กัน — ของจาก Lab feed กลับไป Play, achievements จาก
              Quests สะสมเป็น badge บน SBT
            </p>
          </Reveal>
        </section>

        {/* Tech stack */}
        <section>
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              Tech stack — เลือก boring solutions
            </h2>
            <p className="text-sm text-[var(--color-muted)] mb-6 max-w-2xl">
              เราเลือกสิ่งที่ pragmatic ไม่ใช่ trendy — battle-tested libraries · mainstream patterns · contributors เยอะ · docs ดี
            </p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TECH_STACK.map((s, i) => (
              <Reveal key={s.layer} delay={i * 60}>
                <div className="card h-full">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-brand)] mb-3">
                    {s.layer}
                  </h3>
                  <ul className="space-y-1.5 text-sm text-[var(--color-text)]">
                    {s.items.map((i) => (
                      <li key={i} className="leading-relaxed flex gap-2">
                        <span className="text-[var(--color-brand)] font-bold shrink-0">•</span>
                        <span>{i}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Team */}
        <section>
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">
              ทีม — Team
            </h2>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {TEAM.map((m, i) => (
              <Reveal key={m.name} delay={i * 80}>
                <div className="card h-full">
                  <h3 className="text-base font-bold tracking-tight mb-1">
                    {m.name}
                  </h3>
                  <p className="text-xs font-medium text-[var(--color-brand)] uppercase tracking-wide mb-2">
                    {m.role}
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                    {m.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={300}>
            <p className="mt-4 text-xs text-[var(--color-muted)] text-center">
              อยากร่วม contribute? เปิด issue ใน{" "}
              <a
                href="https://github.com/cuvetsmo/cuvetsmo-web3"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-brand)] hover:underline"
              >
                GitHub
              </a>{" "}
              หรือทักไลน์ <span className="font-mono">@cuvetsmo</span>
            </p>
          </Reveal>
        </section>

        {/* Roadmap teaser → /roadmap */}
        <section>
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">
              Roadmap
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <ol className="relative border-l-2 border-[var(--color-border)] pl-6 space-y-6">
              {ROADMAP.map((p) => {
                const isDone = p.status === "done";
                const isActive = p.status === "active";
                const isNext = p.status === "next";
                return (
                  <li key={p.phase} className="relative">
                    <span
                      aria-hidden
                      className={`absolute -left-[33px] top-1 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-[var(--color-bg)] ${
                        isDone
                          ? "bg-emerald-500"
                          : isActive
                            ? "bg-[var(--color-brand)]"
                            : isNext
                              ? "bg-amber-400"
                              : "bg-[var(--color-border)]"
                      }`}
                    >
                      {isDone && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      {isActive && (
                        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                      )}
                    </span>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                      <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-muted)]">
                        {p.phase}
                      </span>
                      <h3 className="text-base font-bold tracking-tight">
                        {p.label}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          isDone
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : isActive
                              ? "bg-[var(--color-brand-light)] text-[var(--color-brand)]"
                              : isNext
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                                : "bg-[var(--color-border)]/40 text-[var(--color-muted)]"
                        }`}
                      >
                        {isDone ? "shipped" : isActive ? "in progress" : isNext ? "next up" : "planned"}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                      {p.detail}
                    </p>
                  </li>
                );
              })}
            </ol>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-6 text-center">
              <Link href="/roadmap" className="btn-outline">
                ดู roadmap เต็มๆ →
              </Link>
            </div>
          </Reveal>
        </section>

        {/* Links */}
        <Reveal>
          <section className="card bg-[var(--color-brand-light)] border-[var(--color-brand)]/30">
            <h2 className="text-lg font-bold tracking-tight mb-3">
              อ่านต่อ — Resources
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <a
                href="https://github.com/cuvetsmo/cuvetsmo-web3"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg px-4 py-3 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-brand)] hover:-translate-y-0.5 transition-all"
              >
                <div>
                  <div className="text-sm font-semibold">GitHub repo</div>
                  <div className="text-xs text-[var(--color-muted)]">
                    Source code · issues · PRs
                  </div>
                </div>
                <span aria-hidden className="text-[var(--color-brand)]">
                  →
                </span>
              </a>
              <a
                href="https://github.com/cuvetsmo/cuvetsmo-web3/blob/main/docs/MAINNET_DEPLOY_AUDIT_PREP.md"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg px-4 py-3 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-brand)] hover:-translate-y-0.5 transition-all"
              >
                <div>
                  <div className="text-sm font-semibold">Mainnet Audit Prep</div>
                  <div className="text-xs text-[var(--color-muted)]">
                    Pre-audit doc · risk model · 5 low-risk contracts
                  </div>
                </div>
                <span aria-hidden className="text-[var(--color-brand)]">
                  →
                </span>
              </a>
              <Link
                href="/glossary"
                className="flex items-center justify-between rounded-lg px-4 py-3 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-brand)] hover:-translate-y-0.5 transition-all"
              >
                <div>
                  <div className="text-sm font-semibold">Glossary TH/EN</div>
                  <div className="text-xs text-[var(--color-muted)]">
                    ศัพท์ web3 68 รายการ · พร้อมคำอธิบาย
                  </div>
                </div>
                <span aria-hidden className="text-[var(--color-brand)]">
                  →
                </span>
              </Link>
              <Link
                href="/learn/wallet-101"
                className="flex items-center justify-between rounded-lg px-4 py-3 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-brand)] hover:-translate-y-0.5 transition-all"
              >
                <div>
                  <div className="text-sm font-semibold">Wallet 101</div>
                  <div className="text-xs text-[var(--color-muted)]">
                    เริ่มต้นเข้า web3 ใน 5 นาที
                  </div>
                </div>
                <span aria-hidden className="text-[var(--color-brand)]">
                  →
                </span>
              </Link>
              <Link
                href="/learn/zero-to-hero"
                className="flex items-center justify-between rounded-lg px-4 py-3 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-brand)] hover:-translate-y-0.5 transition-all"
              >
                <div>
                  <div className="text-sm font-semibold">Zero to Hero</div>
                  <div className="text-xs text-[var(--color-muted)]">
                    อ่าน 3 นาที · เข้าใจ web3 จาก 0
                  </div>
                </div>
                <span aria-hidden className="text-[var(--color-brand)]">
                  →
                </span>
              </Link>
              <Link
                href="/faq"
                className="flex items-center justify-between rounded-lg px-4 py-3 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-brand)] hover:-translate-y-0.5 transition-all"
              >
                <div>
                  <div className="text-sm font-semibold">FAQ</div>
                  <div className="text-xs text-[var(--color-muted)]">
                    คำถามที่ถามบ่อย · ตอบแบบเข้าใจง่าย
                  </div>
                </div>
                <span aria-hidden className="text-[var(--color-brand)]">
                  →
                </span>
              </Link>
            </div>
          </section>
        </Reveal>
      </div>
    </main>
  );
}
