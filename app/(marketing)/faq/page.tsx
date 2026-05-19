import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

/**
 * FAQ — common questions in plain Thai about web3, CUVETSMO, money safety,
 * and what happens to the site when Palm graduates. Built for parents/
 * skeptics, not for crypto natives.
 *
 * Wave 3 · Education Specialist.
 */

export const metadata: Metadata = {
  title: "FAQ — คำถามที่ถามบ่อย",
  description:
    "คำถามที่คนใหม่ web3 ถามบ่อย — เรื่องเงิน, ความปลอดภัย, identity, ทำไมเลือก Base ไม่ใช่ Bitkub. ตอบแบบเข้าใจง่ายสำหรับคนที่ไม่ใช่ developer.",
  openGraph: {
    title: "FAQ — web3.cuvetsmo.com",
    description:
      "Common questions about web3, money safety, and what CUVETSMO does. Plain Thai answers for non-developers.",
    images: ["/og.png"],
  },
};

type FaqEntry = {
  q: string;
  qEn?: string;
  a: React.ReactNode;
  category: "money" | "identity" | "tech" | "project" | "platform";
};

const FAQS: FaqEntry[] = [
  {
    category: "money",
    q: "เคยถูกหลอกซื้อ crypto มาก่อน — จะเชื่อ web3 ได้ยังไง?",
    qEn: "I've been scammed in crypto before — why should I trust web3?",
    a: (
      <>
        <p className="mb-3">
          เข้าใจมาก. Crypto scam มีจริง แต่ส่วนใหญ่เป็น <strong>เกม trading</strong> หรือ
          <strong> rug pull ของโปรเจกต์ใหม่ๆ</strong> — ไม่ใช่ตัว blockchain เอง.
        </p>
        <p className="mb-3">
          ที่ web3.cuvetsmo.com เราอยู่บน <strong>testnet</strong> ทั้งหมด — ทุก asset
          มูลค่า <strong>0 บาท</strong>. คุณไม่มีทางเสียเงินจากระบบนี้ เพราะไม่มีเงินจริงไหลเข้าไปเลย.
        </p>
        <p>
          เป้าหมายของเราคือสอน infrastructure ที่ใช้กันจริงในโลก — เพื่อให้คุณ
          แยก scam ออกจาก real product ได้ดีขึ้น ไม่ใช่ขายของ.
        </p>
      </>
    ),
  },
  {
    category: "identity",
    q: "ต้องใส่บัตรประชาชนไหม? ใส่ KYC ที่ไหน?",
    qEn: "Do I need to submit my ID?",
    a: (
      <>
        <p className="mb-3">
          <strong>ไม่ต้อง.</strong> เราใช้แค่ CU email สำหรับยืนยันว่าคุณเป็นนิสิตจริง — เก็บไว้บน
          Privy server ปลอดภัยตามมาตรฐาน SOC 2.
        </p>
        <p>
          Wallet ที่ระบบสร้างให้ <strong>ไม่ได้ผูกกับชื่อจริง</strong> ของคุณบน chain —
          เป็น address แบบ pseudonymous (เลข hex). ใครเปิด BaseScan เห็น address
          ของคุณ แต่ไม่รู้ว่าคือคุณจนกว่าคุณจะเปิดเผยเอง.
        </p>
      </>
    ),
  },
  {
    category: "money",
    q: "เสียเงินจริงไหม?",
    qEn: "Will this cost me real money?",
    a: (
      <>
        <p className="mb-3">
          <strong>ตอนนี้ไม่.</strong> Phase 1 ทั้งหมดบน Base Sepolia (testnet)
          ค่า gas ฟรี ทุก action ฟรี.
        </p>
        <p>
          ถ้าในอนาคต CUVETSMO ย้ายฟีเจอร์บางตัวไป mainnet (เช่น ใบรับรองจบหลักสูตร
          ที่อยากให้ permanence), <strong>เราจะ sponsor ค่า gas ให้ผ่าน paymaster</strong> — user
          ไม่ต้องโอน ETH มาก่อน. ทุกอย่างฟรีจาก user.
        </p>
      </>
    ),
  },
  {
    category: "project",
    q: "ผมเรียนสัตวแพทย์ — จะใช้ web3 ทำอะไรจริงๆ?",
    qEn: "I'm a vet student — what's web3 actually useful for?",
    a: (
      <>
        <ul className="space-y-2 list-disc pl-5">
          <li>
            <strong>SBT credential</strong> — ใบรับรอง CE/seminar/หลักสูตรเสริม
            ที่ verify ได้ตลอดชีวิตแม้สถาบันที่ออกใบจะปิดไป
          </li>
          <li>
            <strong>Welfare attendance</strong> — POAP NFT แทนการเซ็นชื่อกระดาษ
            งานอาสา save dog adoption
          </li>
          <li>
            <strong>ชมรม treasury</strong> — บัญชีของชมรมที่ทุกบาทดูบน BaseScan ได้
            ไม่ผูกกับชื่อบุคคล
          </li>
          <li>
            <strong>DAO governance</strong> — โหวต กก. ชมรม แบบนับเสียงเปิดเผย
          </li>
          <li>
            <strong>Research data provenance</strong> — บันทึก timestamp ของผลแล็บ
            ผ่าน EAS attestation
          </li>
        </ul>
      </>
    ),
  },
  {
    category: "platform",
    q: "แม่จะเข้าใจไหม?",
    qEn: "Will my mom understand this?",
    a: (
      <>
        <p className="mb-3">
          ถ้าเราอธิบายว่า &quot;ใบรับรองที่สถาบันออกให้ลูก แต่อยู่ในมือลูกถาวร
          แม้สถาบันจะปิดไป&quot; — คนทั่วไปเข้าใจในนาทีเดียว.
        </p>
        <p>
          คำที่เราพยายามเลี่ยงคือ: blockchain, NFT, crypto, DeFi.
          คำที่เราใช้แทนคือ: ใบรับรอง digital, ลายเซ็นที่ verify ได้, สมุดบันทึกที่แก้ย้อนหลังไม่ได้.
        </p>
      </>
    ),
  },
  {
    category: "platform",
    q: "ทำไมเลือก Base ไม่ใช่ Bitkub?",
    qEn: "Why Base instead of Bitkub Chain?",
    a: (
      <>
        <p className="mb-3">
          เลือก Base เพราะ <strong>(1)</strong> เป็น L2 ที่ secure ผ่าน Ethereum mainnet
          ไม่ใช่ chain ที่เพิ่งเริ่ม, <strong>(2)</strong> developer tooling โตที่สุด
          ใน Asia-Pacific, <strong>(3)</strong> Coinbase ให้ paymaster credits ฟรี
          สำหรับโครงการการศึกษา, <strong>(4)</strong> สามารถ port ไป chain อื่นได้
          ถ้ามี regulatory shift ในไทย.
        </p>
        <p>
          ไม่ใช่ว่า Bitkub ไม่ดี — แต่ ecosystem ของ Base ใหญ่กว่า 100x
          และ contract เราเขียนแบบ chain-agnostic ย้ายได้ทุกเมื่อ.
        </p>
      </>
    ),
  },
  {
    category: "project",
    q: "ใครเป็นคนทำเว็บนี้?",
    qEn: "Who built this?",
    a: (
      <>
        <p className="mb-3">
          เริ่มโดย <strong>Palm (อนุทิน ดาน้อย)</strong> — นิสิตสัตวแพทย์ Vet 86, VP Planning
          ของ CUVETSMO 68 — ด้วยจุดประสงค์ให้คณะมี playground สำหรับเรียน web3
          แบบไม่กลัวเสียเงิน.
        </p>
        <p>
          Source code, contract, infrastructure ทุกชิ้นเปิด open source บน{" "}
          <a
            href="https://github.com/cuvetsmo/cuvetsmo-web3"
            className="text-[var(--color-brand)] underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/cuvetsmo
          </a>{" "}
          — ใครก็ contribute ได้.
        </p>
      </>
    ),
  },
  {
    category: "project",
    q: "ถ้า Palm จบไป — จะมีคนทำต่อไหม?",
    qEn: "What happens when the founder graduates?",
    a: (
      <>
        <p className="mb-3">
          ออกแบบมาตั้งแต่ Day 1 ให้ไม่ขึ้นกับใครคนเดียว:
        </p>
        <ul className="space-y-1.5 list-disc pl-5">
          <li>Smart contract เป็น public good — deploy แล้วใครก็ใช้ต่อได้</li>
          <li>SBT/NFT ที่ออกไปแล้ว <strong>ยังอยู่ใน wallet ผู้รับ</strong> แม้เว็บปิด</li>
          <li>Domain web3.cuvetsmo.com อยู่ใต้ control ของสโม ไม่ใช่บุคคล</li>
          <li>มี working group ของนิสิตรุ่นต่อๆ ไปที่รับช่วงต่อตามอายุการเป็นนิสิต</li>
        </ul>
      </>
    ),
  },
  {
    category: "tech",
    q: "Mainnet vs Testnet ต่างยังไง?",
    qEn: "What's the difference between mainnet and testnet?",
    a: (
      <>
        <p className="mb-3">
          <strong>Mainnet</strong> = network จริง — asset มีมูลค่าจริง ใช้ ETH จริงจ่าย gas.
          <br />
          <strong>Testnet</strong> = network ฝึก — asset มูลค่า 0 บาท ใช้ test ETH (ฟรี).
        </p>
        <p>
          เปรียบเหมือนสอบจริง vs สอบ mock — กฎเหมือนกัน, แต่ไม่มีผลต่อ transcript จริง.
          web3.cuvetsmo.com ทั้งหมดอยู่บน <strong>Base Sepolia</strong> ซึ่งเป็น testnet
          ของ Base.
        </p>
      </>
    ),
  },
  {
    category: "identity",
    q: "เปลี่ยนใจไม่อยากใช้แล้ว — ลบ wallet ได้ไหม?",
    qEn: "Can I delete my wallet?",
    a: (
      <>
        <p className="mb-3">
          คุณ <strong>เลิกใช้</strong> wallet ได้ทุกเมื่อ — แค่หยุดเข้าระบบเฉยๆ ก็พอ.
          Wallet ของคุณยังอยู่บน chain แต่ &quot;ตาย&quot; (dormant) ไม่กระทบใคร.
        </p>
        <p className="mb-3">
          แต่ <strong>ลบ on-chain history ของ wallet</strong> ไม่ได้ — เพราะนั่นคือ feature
          ของ blockchain: เขียนแล้วลบไม่ได้. นี่คือเหตุผลที่เราให้ user คุม identity เอง,
          ไม่ใช่ใช้ชื่อจริง.
        </p>
        <p>
          ส่วน private key ที่ Privy เก็บไว้ — คุณขอลบได้ผ่าน{" "}
          <a
            href="mailto:palm@cuvetsmo.com"
            className="text-[var(--color-brand)] underline"
          >
            palm@cuvetsmo.com
          </a>{" "}
          (GDPR/PDPA compliant).
        </p>
      </>
    ),
  },
  {
    category: "tech",
    q: "ทำไมต้อง sign ทุกครั้ง — มันต้องเสียเงินไหม?",
    qEn: "Why sign every time — does it cost money?",
    a: (
      <>
        <p className="mb-3">
          <strong>Sign message ฟรี</strong> ไม่กระทบ chain. คุณ sign เพื่อให้ DApp พิสูจน์ว่า
          เป็น wallet ของคุณจริง — เหมือนกดยืนยัน OTP.
        </p>
        <p>
          ส่วน <strong>send transaction</strong> เสีย gas — แต่บน testnet ค่า gas
          เป็น test ETH ที่ฟรี + เรา sponsor ให้.
        </p>
      </>
    ),
  },
  {
    category: "platform",
    q: "ใช้บน iPhone/Android ได้ไหม?",
    qEn: "Does it work on mobile?",
    a: (
      <>
        <p className="mb-3">
          <strong>ได้.</strong> ทั้งเว็บออกแบบ mobile-first — เปิด Safari (iOS) หรือ Chrome
          (Android) แล้ว login ได้เลย ไม่ต้องโหลด app.
        </p>
        <p>
          ถ้าอยากเก็บไว้บนหน้าจอ home → กด &quot;Add to Home Screen&quot; ใน browser. กลายเป็น PWA
          แบบ app เลย.
        </p>
      </>
    ),
  },
  {
    category: "money",
    q: "ใครจ่ายค่า hosting ของ site นี้?",
    qEn: "Who pays for hosting?",
    a: (
      <>
        <p className="mb-3">
          ตอนนี้ Palm จ่ายเอง — ใช้ Vercel Hobby (ฟรี) + Coinbase CDP paymaster (ฟรี
          credits สำหรับ educational) + Privy (ฟรี tier ≤1000 user).
        </p>
        <p>
          ระยะยาวจะขอ <strong>budget จากสโม</strong> หรือ grant จาก Coinbase/Base
          ถ้า scale เกิน free tier.
        </p>
      </>
    ),
  },
  {
    category: "project",
    q: "ทำไมต้องเป็น web3 — ทำเว็บปกติไม่ได้เหรอ?",
    qEn: "Why web3? Why not just a normal website?",
    a: (
      <>
        <p className="mb-3">
          ทำเว็บปกติได้! และจริงๆ ฟีเจอร์ 80% ของ CUVETSMO ใช้ database ปกติก็พอ.
        </p>
        <p className="mb-3">
          แต่ 20% ที่เหลือ — <strong>ใบรับรองที่อยู่ตลอดชีวิต</strong>,
          <strong> โหวตที่นับเสียงเปิดเผย</strong>,
          <strong> treasury ที่ไม่ขึ้นกับบุคคล</strong> — ทำใน web2 ไม่ได้
          เพราะต้องไว้ใจ server.
        </p>
        <p>
          และเรา <strong>เรียนรู้เครื่องมือใหม่</strong> ที่จะใช้ในอนาคต — เริ่มตอนสมัยเรียน
          ไม่ต้องรอจบมาแล้วเรียนทีหลัง.
        </p>
      </>
    ),
  },
  {
    category: "tech",
    q: "ลืม password / เปลี่ยน device — จะกลับเข้าได้ไหม?",
    qEn: "What if I lose my device or password?",
    a: (
      <>
        <p className="mb-3">
          <strong>เข้าได้.</strong> Privy ใช้ social/email recovery —
          login ด้วย CU email บน device ใหม่ ระบบจะ reassemble wallet
          จาก encrypted shards เดิม.
        </p>
        <p>
          ไม่ใช่ระบบ seed phrase ที่หายแล้ว wallet หาย —
          ตราบใดที่ยัง access CU email ได้ wallet กลับมาเสมอ.
        </p>
      </>
    ),
  },
];

const CATEGORIES = {
  money: { label: "เรื่องเงิน", icon: "💰" },
  identity: { label: "ตัวตน / privacy", icon: "🪪" },
  tech: { label: "ทำไมต้องแบบนี้", icon: "🔧" },
  project: { label: "เกี่ยวกับโปรเจกต์", icon: "🏛️" },
  platform: { label: "ใช้งาน", icon: "📱" },
} as const;

export default function FaqPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header className="mb-10">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge tone="brand">FAQ</Badge>
          <Badge tone="muted">{FAQS.length} คำถาม</Badge>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3">
          คำถามที่ถามบ่อย
        </h1>
        <p className="text-base sm:text-lg text-[var(--color-muted)] max-w-2xl leading-relaxed">
          คำถามที่นิสิต, อาจารย์, พ่อแม่ ถามตอนเห็น web3.cuvetsmo.com ครั้งแรก.
          ตอบแบบเข้าใจง่าย ไม่มีศัพท์เทคนิคโดยไม่จำเป็น.
        </p>
      </header>

      {/* Category chips */}
      <div className="mb-8 flex flex-wrap gap-2">
        {(Object.entries(CATEGORIES) as Array<[keyof typeof CATEGORIES, typeof CATEGORIES[keyof typeof CATEGORIES]]>).map(
          ([key, info]) => {
            const count = FAQS.filter((f) => f.category === key).length;
            return (
              <a
                key={key}
                href={`#cat-${key}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-brand)] text-sm font-medium transition-colors"
              >
                <span aria-hidden>{info.icon}</span>
                <span>{info.label}</span>
                <span className="text-xs text-[var(--color-muted)]">
                  {count}
                </span>
              </a>
            );
          },
        )}
      </div>

      {/* Grouped sections */}
      {(Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>).map((cat) => {
        const entries = FAQS.filter((f) => f.category === cat);
        if (entries.length === 0) return null;
        const info = CATEGORIES[cat];
        return (
          <section key={cat} id={`cat-${cat}`} className="mb-10 scroll-mt-24">
            <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
              <span aria-hidden className="text-2xl">
                {info.icon}
              </span>
              {info.label}
            </h2>
            <div className="space-y-3">
              {entries.map((entry, i) => (
                <details
                  key={i}
                  className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] open:border-[var(--color-brand)]/30 open:shadow-sm transition-all"
                >
                  <summary className="cursor-pointer list-none px-5 py-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-base sm:text-lg leading-snug text-[var(--color-text)]">
                        {entry.q}
                      </p>
                      {entry.qEn && (
                        <p className="text-xs text-[var(--color-muted)] mt-0.5 italic">
                          {entry.qEn}
                        </p>
                      )}
                    </div>
                    <svg
                      aria-hidden
                      className="shrink-0 mt-1 transition-transform group-open:rotate-180 text-[var(--color-muted)] group-open:text-[var(--color-brand)]"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-5 border-t border-[var(--color-border)] pt-4 text-sm sm:text-[15px] leading-relaxed text-[var(--color-text)] [&_p]:mb-2 [&_a]:text-[var(--color-brand)] [&_a]:underline">
                    {entry.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        );
      })}

      {/* Ask another */}
      <div className="mt-12 p-6 rounded-xl bg-[var(--color-brand-light)] border border-[var(--color-brand)]/20">
        <h3 className="font-bold mb-2 text-[var(--color-brand)]">
          คำถามไม่มีในนี้?
        </h3>
        <p className="text-sm leading-relaxed mb-3">
          เปิด issue บน{" "}
          <a
            href="https://github.com/cuvetsmo/cuvetsmo-web3/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-brand)] underline"
          >
            GitHub
          </a>{" "}
          หรือทักสโมโดยตรง — เราจะตอบและเพิ่มเข้า FAQ ให้คนอื่นด้วย.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/learn/zero-to-hero" className="btn-brand text-sm">
            ไปอ่าน Zero to Hero
          </Link>
          <Link href="/glossary" className="btn-outline text-sm">
            ดู Glossary
          </Link>
        </div>
      </div>
    </main>
  );
}
