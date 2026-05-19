import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "ทำไมเราสร้าง web3 playground สำหรับนิสิตสัตวแพทย์ · vision, team, 4 pillars, tech stack, roadmap.",
  openGraph: {
    title: "About · web3.cuvetsmo.com",
    description:
      "วิสัยทัศน์ 10 ปี · 4 เสาหลัก · ทีม · roadmap · tech stack.",
    images: ["/og.png"],
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
  },
  {
    name: "Play",
    nameTh: "ทดลองเล่น",
    icon: "🎮",
    role: "Sandbox · zero risk",
    detail:
      "Mint NFT, sign message, swap token, vote ใน DAO poll — ทุกอย่างบน testnet ไม่มีค่าใช้จ่ายและไม่มีความเสี่ยงเสียเงินจริง.",
  },
  {
    name: "Build",
    nameTh: "สร้าง",
    icon: "🛠️",
    role: "Flagship products",
    detail:
      "Vet SBT Card (soulbound identity), Profile, Badge collection. Welfare Treasury และ Vet DAO ตามมาใน Phase 2.",
  },
  {
    name: "The Lab",
    nameTh: "ห้องแล็บ",
    icon: "🧪",
    role: "No-code factory",
    detail:
      "Token Forge, NFT Studio, SBT Maker, DAO Quickstart — สร้าง asset/องค์กร on-chain ของตัวเองได้ใน 30 วินาที โดยไม่ต้องเขียน Solidity.",
  },
] as const;

const TECH_STACK = [
  {
    layer: "Smart contracts",
    items: ["Solidity 0.8.x", "Foundry", "OpenZeppelin", "ERC-721 / ERC-1155 / ERC-5114 SBT"],
  },
  {
    layer: "Chain",
    items: ["Base Sepolia (Phase 1)", "Base mainnet (SBT only, Phase 2)", "Multi-tenant orgId"],
  },
  {
    layer: "Frontend",
    items: ["Next.js 16 (App Router)", "React 19", "Tailwind v4", "TypeScript"],
  },
  {
    layer: "Auth + Wallet",
    items: ["Privy (embedded wallet · email/social)", "Account Abstraction (ERC-4337)", "wagmi + viem"],
  },
  {
    layer: "Storage + Infra",
    items: ["Pinata (IPFS metadata)", "Vercel (hosting)", "Supabase (off-chain · later)"],
  },
] as const;

const TEAM = [
  {
    name: "Palm · ปาล์ม",
    role: "Web3 Lead · CUVETSMO 68 VP Planning",
    detail:
      "Vet 86 · ออกแบบ architecture, ดูแล smart contracts + frontend, เขียน master plan.",
  },
  {
    name: "Boom · บูม",
    role: "CUVETSMO 69 President",
    detail:
      "Vet 87 · ดูแลการเชื่อม web3 platform กับงานสโมและกิจการนิสิต Phase 2 onwards.",
  },
  {
    name: "Faculty Advisor",
    role: "TBD · กำลังหา",
    detail:
      "อาจารย์ที่ปรึกษาด้าน digital transformation · กิจการนิสิต · กำลังประเมินกับทีมที่ปรึกษา CUVET.",
  },
] as const;

const ROADMAP = [
  {
    phase: "Phase 0",
    label: "Foundation",
    status: "done",
    detail: "Scaffold, auth, routing, brand tokens · Wave 1 (May 2026)",
  },
  {
    phase: "Phase 1",
    label: "MVP — 4 pillars stub",
    status: "done",
    detail: "Contracts (Vet SBT Card, factories), Learn pillar, Play sandbox, Lab factory shells",
  },
  {
    phase: "Phase 1.5",
    label: "Polish + DNS",
    status: "done",
    detail: "Landing rewrite, glossary, OG image, web3.cuvetsmo.com live",
  },
  {
    phase: "Phase 2",
    label: "Welfare Treasury + DAO",
    status: "done",
    detail: "Welfare donation contracts, Vet DAO governance, Quest expansion",
  },
  {
    phase: "Phase 3",
    label: "Multi-faculty + scale",
    status: "active",
    detail: "Onboard 2-3 more CU faculties · prep public launch · case study writing",
  },
] as const;

export default function AboutPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Header */}
      <header className="mb-12">
        <p className="text-xs font-semibold text-[var(--color-brand)] uppercase tracking-wider mb-2">
          About · เกี่ยวกับเรา
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
          ทำไมเราสร้าง <span className="text-[var(--color-brand)]">web3 platform</span>?
        </h1>
        <p className="text-base sm:text-lg text-[var(--color-muted)] max-w-3xl leading-relaxed">
          Web3 ในไทยถูก dominate ด้วย trader culture และไม่มี on-ramp ที่ปลอดภัยสำหรับนิสิตที่อยากเรียนรู้และสร้างโดยไม่ต้องเสี่ยงเงินจริง. CUVETSMO เริ่มต้นจากตรงนี้ — เพื่อให้นิสิตสัตวแพทย์ CU เข้าใจและทดลอง web3 ได้แบบที่อาจารย์ก็แนะนำต่อได้.
        </p>
      </header>

      {/* Origin story */}
      <section className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">
          จุดเริ่มต้น · The origin
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
          <div className="card">
            <p className="text-sm leading-relaxed text-[var(--color-text)]">
              <strong className="text-[var(--color-brand)]">Account Abstraction
              (ERC-4337)</strong> mature พอแล้วที่จะเปลี่ยน wallet UX จาก geek tool เป็น consumer product. L2 อย่าง Base ทำให้ gas ไม่ใช่ปัญหา. และกฎหมายไทยกำลังเปิดทาง educational + non-financial DApps อย่างปลอดภัย.
            </p>
          </div>
          <div className="card">
            <p className="text-sm leading-relaxed text-[var(--color-text)]">
              ขณะเดียวกัน <strong className="text-[var(--color-brand)]">ยังไม่มี Thai-language web3 education platform</strong> ที่จริงจัง — first-mover advantage ชัด. เทรนด์ student-led web3 ขึ้นทั่วโลก (Berkeley Blockchain, Stanford Blyth) แต่ใน ASEAN ยังว่าง — เริ่มที่นี่ก่อน scale.
            </p>
          </div>
        </div>

        <div className="mt-6 p-5 rounded-xl bg-[var(--color-brand-light)] border border-[var(--color-brand)]/20">
          <p className="text-sm leading-relaxed text-[var(--color-text)]">
            <strong className="text-[var(--color-brand)]">เริ่มที่นิสิตสัตวแพทย์ CU เพราะ:</strong>{" "}
            เล็กพอที่ iterate เร็ว · มี community เหนียวแน่น · vet เป็น domain ที่มี real-world use case (welfare treasury, attendance SBT) ที่ทรงพลังกว่า generic student club platform.
          </p>
        </div>
      </section>

      {/* 4 Pillars detail */}
      <section className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          4 เสาหลัก · ทำไมต้อง 4 ไม่ใช่ 2 ไม่ใช่ 6
        </h2>
        <p className="text-sm text-[var(--color-muted)] mb-6 max-w-2xl">
          2 เสา (Learn + Build) ไม่พอ — ขาด safe space ทดลองและขาด user creation.
          6+ เสา confusing และ dilute focus. <strong>4 เสา</strong>เป็น sweet spot —
          แต่ละอันมี job-to-be-done ชัด.
        </p>
        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
          {PILLARS.map((p) => (
            <div key={p.name} className="card">
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
          ))}
        </div>
        <div className="mt-6 text-center text-sm text-[var(--color-muted)]">
          User journey: Learn → Play → Build → The Lab ·
          แต่ละ pillar reinforce กัน — ของจาก Lab feed กลับไป Play, achievements จาก Quests สะสมเป็น badge บน SBT.
        </div>
      </section>

      {/* Tech stack */}
      <section className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Tech stack · เลือก boring solutions
        </h2>
        <p className="text-sm text-[var(--color-muted)] mb-6 max-w-2xl">
          เราเลือกสิ่งที่ &ldquo;pragmatic&rdquo; ไม่ใช่ &ldquo;trendy&rdquo; — battle-tested libraries, mainstream patterns, contributors เยอะ, docs ดี.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TECH_STACK.map((s) => (
            <div key={s.layer} className="card">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-brand)] mb-2">
                {s.layer}
              </h3>
              <ul className="space-y-1 text-sm text-[var(--color-text)]">
                {s.items.map((i) => (
                  <li key={i} className="leading-relaxed">
                    · {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">
          ทีม · Team
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {TEAM.map((m) => (
            <div key={m.name} className="card">
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
          ))}
        </div>
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
          หรือทักไลน์ <span className="font-mono">@cuvetsmo</span>.
        </p>
      </section>

      {/* Roadmap */}
      <section className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">
          Roadmap
        </h2>
        <ol className="relative border-l-2 border-[var(--color-border)] pl-6 space-y-6">
          {ROADMAP.map((p) => {
            const isDone = p.status === "done";
            const isActive = p.status === "active";
            return (
              <li key={p.phase} className="relative">
                <span
                  aria-hidden
                  className={`absolute -left-[33px] top-1 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-[var(--color-bg)] ${
                    isDone
                      ? "bg-emerald-500"
                      : isActive
                        ? "bg-[var(--color-brand)]"
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
                          : "bg-[var(--color-border)]/40 text-[var(--color-muted)]"
                    }`}
                  >
                    {isDone ? "shipped" : isActive ? "in progress" : "planned"}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                  {p.detail}
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Links */}
      <section className="card bg-[var(--color-brand-light)] border-[var(--color-brand)]/30">
        <h2 className="text-lg font-bold tracking-tight mb-3">
          อ่านต่อ · Resources
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <a
            href="https://github.com/cuvetsmo/cuvetsmo-web3"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg px-4 py-3 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-colors"
          >
            <div>
              <div className="text-sm font-semibold">GitHub repo</div>
              <div className="text-xs text-[var(--color-muted)]">
                Source code, issues, PRs
              </div>
            </div>
            <span aria-hidden className="text-[var(--color-brand)]">
              →
            </span>
          </a>
          <a
            href="https://github.com/cuvetsmo/cuvetsmo-web3/blob/main/docs/masterplan.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg px-4 py-3 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-colors"
          >
            <div>
              <div className="text-sm font-semibold">Master Plan v0.1</div>
              <div className="text-xs text-[var(--color-muted)]">
                Full whitepaper · 20 sections + 4 appendices
              </div>
            </div>
            <span aria-hidden className="text-[var(--color-brand)]">
              →
            </span>
          </a>
          <Link
            href="/glossary"
            className="flex items-center justify-between rounded-lg px-4 py-3 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-colors"
          >
            <div>
              <div className="text-sm font-semibold">Glossary TH/EN</div>
              <div className="text-xs text-[var(--color-muted)]">
                ศัพท์ web3 25 รายการ พร้อมคำอธิบาย
              </div>
            </div>
            <span aria-hidden className="text-[var(--color-brand)]">
              →
            </span>
          </Link>
          <Link
            href="/learn/wallet-101"
            className="flex items-center justify-between rounded-lg px-4 py-3 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-colors"
          >
            <div>
              <div className="text-sm font-semibold">Wallet 101 →</div>
              <div className="text-xs text-[var(--color-muted)]">
                เริ่มต้นเข้า web3 · 10 นาที
              </div>
            </div>
            <span aria-hidden className="text-[var(--color-brand)]">
              →
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
