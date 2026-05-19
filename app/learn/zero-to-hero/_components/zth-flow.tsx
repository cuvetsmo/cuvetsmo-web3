"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * <ZeroToHeroFlow /> — 5-step beginner onboarding for someone who has never
 * touched crypto. No wallet required, no buttons that cost anything. Pure
 * education with vet-context analogies.
 *
 * Wave 3 · Education Specialist.
 */

type Step = {
  id: number;
  title: string;
  subtitle: string;
  /** plain-language bullets shown as the body */
  bullets: string[];
  /** Optional vet analogy block — only shown if present */
  analogy?: { title: string; body: string };
  /** Optional micro illustration spec — emoji string for now */
  visual?: { emoji: string; caption: string };
  /** Optional handoff link for the last step */
  nextHref?: string;
  nextLabel?: string;
};

const STEPS: Step[] = [
  {
    id: 1,
    title: "Web3 คืออะไรใน 30 วินาที",
    subtitle: "เริ่มจากภาพง่ายๆ ก่อน",
    bullets: [
      "Web1 (1990s) คือ อ่านอย่างเดียว — เว็บข่าวสาร, สารานุกรม",
      "Web2 (2000s ถึงตอนนี้) คือ อ่าน + เขียนได้ แต่ ข้อมูลของคุณอยู่ที่บริษัท — Facebook, Google, ธนาคาร",
      "Web3 (ตั้งแต่ 2015) คือ อ่าน + เขียน + เป็นเจ้าของ ข้อมูลของคุณอยู่ใน wallet ของคุณเอง ไม่ได้อยู่ที่บริษัทใด",
    ],
    analogy: {
      title: "ลองเทียบกับเวชระเบียน",
      body: "เวชระเบียนใน Web2 คือไฟล์ที่อยู่ใน server ของโรงพยาบาล X — ถ้าโรงพยาบาลปิด ข้อมูลหาย. เวชระเบียนใน Web3 คือไฟล์ที่ผู้ป่วยเก็บเอง ทุกคลินิกที่ผู้ป่วยไปอ่านได้ตาม consent ของผู้ป่วย.",
    },
    visual: { emoji: "🌐", caption: "Web1 → Web2 → Web3" },
  },
  {
    id: 2,
    title: "ทำไมมันสำคัญกับ CUVET",
    subtitle: "ไม่ใช่แค่ crypto แต่คือเครื่องมือ",
    bullets: [
      "ใบรับรองที่ verify ได้แม้สโมเลิกอยู่ — ผ่าน SBT (โอนไม่ได้ ผูกกับตัวคุณ)",
      "การโหวตของชมรมที่นับเสียงโปร่งใส — ผ่าน DAO (ทุกคนตรวจสอบผลได้)",
      "Treasury ของชมรมที่ไม่ขึ้นกับบัญชีบุคคล — ทุกบาทดูบน BaseScan ได้",
      "Welfare event attendance ที่ไม่ต้องเซ็นชื่อกระดาษ — POAP NFT",
    ],
    analogy: {
      title: "ทำไมเริ่มที่สโม",
      body: "นิสิตคณะสัตวแพทย์อยู่ในจังหวะที่จะได้ใช้ web3 จริง — ใบรับรอง CE, ผลงานวิจัย, peer review. เรียนรู้ infrastructure ตั้งแต่ตอนนี้ไม่เสียเปรียบ.",
    },
    visual: { emoji: "🏥", caption: "เครื่องมือสำหรับงานจริง" },
  },
  {
    id: 3,
    title: "Wallet เหมือนกระเป๋าเงินจริงไหม",
    subtitle: "ทั้งใช่และไม่ใช่",
    bullets: [
      "ใช่ — มันคือที่เก็บ asset ของคุณ (เหรียญ, NFT, ใบรับรอง)",
      "ไม่ใช่ — มันเก็บ private key ไม่ใช่เก็บเหรียญจริงๆ. เหรียญอยู่บน chain. Wallet แค่ \"กุญแจ\"",
      "ใช่ — ใครจับ wallet คุณ ก็ใช้แทนคุณได้ (เหมือนกระเป๋าจริง)",
      "ไม่ใช่ — wallet ส่วนใหญ่บนเว็บฟรี ไม่ต้องลงทะเบียน ไม่ต้องเปิดบัญชีธนาคาร",
    ],
    analogy: {
      title: "เปรียบกับกุญแจตู้ยา",
      body: "ยาในตู้ก็ยังเป็นยา ไม่ว่าใครถือกุญแจ — แต่กุญแจมีคนเดียวที่เปิดได้. Private key คือกุญแจ, wallet คือพวงกุญแจ, ยาคือ asset บน chain.",
    },
    visual: { emoji: "🔑", caption: "Wallet = กุญแจ ไม่ใช่ตู้นิรภัย" },
  },
  {
    id: 4,
    title: "ลองทำ wallet กันได้เลย",
    subtitle: "5 นาทีที่ Wallet 101 — มีคนพาทำทีละขั้น",
    bullets: [
      "ใช้ CU email login ไม่ต้องโหลด extension อะไรเลย",
      "Privy จะสร้าง wallet ให้อัตโนมัติ ไม่ต้องเซฟ seed phrase",
      "ระบบ sponsor ค่า gas ให้ — คุณไม่ต้องมี ETH เลย",
      "จบขั้นตอนได้ SBT badge แรกของชีวิตเข้า wallet",
    ],
    analogy: {
      title: "ปลอดภัยพอไหม",
      body: "Privy ใช้ multi-party computation เก็บ key ไว้ใน 3 ที่ — ไม่มีที่ไหนรู้ key ทั้งหมด. ถ้าเครื่องคุณหาย ยัง recover ได้ผ่าน email ที่ใช้ตอน login.",
    },
    visual: { emoji: "👛", caption: "Click. Login. Done." },
    nextHref: "/learn/wallet-101",
    nextLabel: "ไปทำ Wallet 101 (5 นาที)",
  },
  {
    id: 5,
    title: "พร้อมแล้ว — เลือกเส้นทาง",
    subtitle: "หลังมี wallet จะไปต่อทางไหนก็ได้",
    bullets: [
      "Quest 1–10 — สอนทุก action พื้นฐาน แต่ละ quest ให้ SBT badge",
      "Vet SBT Card — claim ใบประจำตัวนิสิตสัตวแพทย์ digital",
      "Mint Playground — ลอง mint NFT แรกของตัวเอง",
      "Token Forge — สร้าง ERC-20 ของกลุ่ม/ชมรมใน 60 วินาที",
    ],
    visual: { emoji: "🚀", caption: "พื้นฐานครบ — ลุยต่อได้แล้ว" },
    nextHref: "/learn/quests",
    nextLabel: "ดู Web3 Quests ทั้ง 10 ข้อ",
  },
];

export function ZeroToHeroFlow() {
  const [current, setCurrent] = useState(0);
  const step = STEPS[current];
  const isLast = current === STEPS.length - 1;
  const isFirst = current === 0;
  const progress = ((current + 1) / STEPS.length) * 100;

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden shadow-sm">
      {/* progress bar */}
      <div className="px-5 sm:px-7 pt-5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-[var(--color-brand)] uppercase tracking-wider">
            ขั้นที่ {step.id} จาก {STEPS.length}
          </p>
          <p className="text-xs text-[var(--color-muted)]">
            {Math.round(progress)}%
          </p>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--color-border)]/60 overflow-hidden">
          <div
            className="h-full bg-[var(--color-brand)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* step dots */}
        <div className="mt-3 flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`ไปขั้นที่ ${s.id}: ${s.title}`}
              className={`h-2 rounded-full transition-all ${
                i === current
                  ? "w-8 bg-[var(--color-brand)]"
                  : i < current
                    ? "w-2 bg-[var(--color-brand)]/50"
                    : "w-2 bg-[var(--color-border)]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* step content */}
      <div className="px-5 sm:px-7 py-6 sm:py-8 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          {step.visual && (
            <div className="shrink-0 sm:w-32 flex sm:flex-col items-center gap-2 sm:gap-3">
              <div className="text-5xl sm:text-6xl leading-none" aria-hidden>
                {step.visual.emoji}
              </div>
              <p className="text-xs text-[var(--color-muted)] text-center hidden sm:block">
                {step.visual.caption}
              </p>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1.5">
              {step.title}
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-muted)] mb-4 leading-relaxed">
              {step.subtitle}
            </p>
            <ul className="space-y-2.5 mb-5">
              {step.bullets.map((b, i) => (
                <li key={i} className="flex gap-3 text-sm sm:text-base leading-relaxed">
                  <span
                    aria-hidden
                    className="shrink-0 mt-0.5 h-5 w-5 rounded-full bg-[var(--color-brand-light)] text-[var(--color-brand)] flex items-center justify-center text-[10px] font-bold"
                  >
                    {i + 1}
                  </span>
                  <span className="text-[var(--color-text)]">{b}</span>
                </li>
              ))}
            </ul>

            {step.analogy && (
              <div className="rounded-lg bg-[var(--color-brand-light)] border-l-4 border-[var(--color-brand)] px-4 py-3 mb-2">
                <p className="text-xs font-semibold text-[var(--color-brand)] uppercase tracking-wide mb-1">
                  Analogy — {step.analogy.title}
                </p>
                <p className="text-sm leading-relaxed text-[var(--color-text)]">
                  {step.analogy.body}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* navigation */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-bg)]/40 px-5 sm:px-7 py-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={isFirst}
          className="text-sm text-[var(--color-muted)] hover:text-[var(--color-brand)] disabled:opacity-30 disabled:hover:text-[var(--color-muted)] flex items-center gap-1.5 px-2 py-1.5"
        >
          <span aria-hidden>←</span> ก่อนหน้า
        </button>
        <div className="flex items-center gap-2">
          {!isLast && (
            <button
              type="button"
              onClick={() => setCurrent((c) => Math.min(STEPS.length - 1, c + 1))}
              className="btn-brand text-sm"
            >
              ถัดไป <span aria-hidden>→</span>
            </button>
          )}
          {isLast && step.nextHref && (
            <Link href={step.nextHref} className="btn-brand text-sm">
              {step.nextLabel ?? "ทำต่อ"}
            </Link>
          )}
          {!isLast && step.nextHref && (
            <Link
              href={step.nextHref}
              className="hidden sm:inline-flex btn-outline text-sm items-center gap-1.5"
            >
              {step.nextLabel ?? "ข้าม"}
            </Link>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out; }
      `}</style>
    </div>
  );
}
