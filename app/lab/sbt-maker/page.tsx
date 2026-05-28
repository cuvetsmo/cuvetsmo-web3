import type { Metadata } from "next";
import { SbtMakerForm } from "./_form";
import { LabModeSwitcher } from "@/components/lab-mode-switcher";
import { SBT_FACTORY_SOURCE } from "../_lib/contract-sources";
import { Reveal } from "@/app/(marketing)/_components/reveal";

export const metadata: Metadata = {
  title: "SBT Maker",
  description:
    "ออก Soulbound Token (SBT) สำหรับ event attendance, course completion, volunteer record — ผูกกับ wallet โอนไม่ได้.",
};

export default function SbtMakerPage() {
  return (
    <main>
      <section className="relative overflow-hidden cloud-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-brand)] font-semibold mb-2">
              The Lab — SBT Maker
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-2">
              🎖️ SBT Maker
            </h1>
            <p className="text-[var(--color-muted)] text-sm sm:text-base leading-relaxed max-w-2xl">
              Soulbound Tokens คือ NFT ที่{" "}
              <span className="font-semibold">โอนต่อไม่ได้</span> — เหมาะกับ
              credential · สิทธิ์ · record การเข้าร่วมที่ไม่ควรซื้อขายได้ ·
              อัปโหลด CSV ที่อยู่ wallet เพื่อ bulk mint.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <UseCases />

      <LabModeSwitcher
        sourceTitle="SBTFactory.sol"
        sourceCode={SBT_FACTORY_SOURCE}
        githubUrl="https://github.com/cuvetsmo/cuvetsmo-web3/blob/main/contracts/src/SBTFactory.sol"
        remixUrl="https://remix.ethereum.org/#url=https://github.com/cuvetsmo/cuvetsmo-web3/blob/main/contracts/src/SBTFactory.sol"
        contractIntro="โรงงานออก Soulbound Token collection. transfer function ถูก override ให้ revert — mint ได้ burn ได้ แต่ส่งหากันไม่ได้ ทำให้เหมาะกับ credential ที่ไม่ควรซื้อขาย."
      >
        <SbtMakerForm />
      </LabModeSwitcher>
      </div>
    </main>
  );
}

function UseCases() {
  const cases = [
    { emoji: "🎟️", title: "Event attendance", desc: "POAP-style ออกให้คนเข้า workshop" },
    { emoji: "📚", title: "Course completion", desc: "ใบประกาศจบหลักสูตรบน-chain" },
    { emoji: "🤝", title: "Volunteer record", desc: "บันทึกการทำกิจกรรมจิตอาสา" },
  ];
  return (
    <ul className="grid sm:grid-cols-3 gap-3 mb-6">
      {cases.map((c) => (
        <li
          key={c.title}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-3"
        >
          <p className="text-xl mb-1" aria-hidden>
            {c.emoji}
          </p>
          <p className="text-sm font-semibold">{c.title}</p>
          <p className="text-xs text-[var(--color-muted)]">{c.desc}</p>
        </li>
      ))}
    </ul>
  );
}
