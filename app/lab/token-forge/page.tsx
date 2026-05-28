import type { Metadata } from "next";
import { TokenForgeForm } from "./_form";
import { LabModeSwitcher } from "@/components/lab-mode-switcher";
import { TOKEN_FACTORY_SOURCE } from "../_lib/contract-sources";
import { Reveal } from "@/app/(marketing)/_components/reveal";

export const metadata: Metadata = {
  title: "Token Forge",
  description:
    "Deploy ERC-20 tokens in 60 seconds. Pick a name, symbol, supply, click deploy. ลง Base Sepolia ฟรี.",
};

export default function TokenForgePage() {
  return (
    <main>
      <section className="relative overflow-hidden cloud-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-brand)] font-semibold mb-2">
              The Lab — Token Forge
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-2">
              🪙 Token Forge
            </h1>
            <p className="text-[var(--color-muted)] text-sm sm:text-base leading-relaxed max-w-2xl">
              สร้าง ERC-20 token ของคุณเอง — ใส่ชื่อ · symbol · supply · กด deploy ·
              ได้ contract address ที่ verify ได้บน BaseScan ·
              เหมาะกับชมรม · meme coin · governance token · reward point.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <LabModeSwitcher
        sourceTitle="TokenFactory.sol"
        sourceCode={TOKEN_FACTORY_SOURCE}
        githubUrl="https://github.com/cuvetsmo/cuvetsmo-web3/blob/main/contracts/src/TokenFactory.sol"
        remixUrl="https://remix.ethereum.org/#url=https://github.com/cuvetsmo/cuvetsmo-web3/blob/main/contracts/src/TokenFactory.sol"
        contractIntro="โรงงานออก ERC-20 ใหม่ผ่าน EIP-1167 minimal proxy — deploy ถูกกว่าธรรมดา ~40 เท่า. มี rate limit 5 token/wallet/24h กัน spam."
      >
        <TokenForgeForm />
      </LabModeSwitcher>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        <Tip emoji="🎯" title="Use case ของชมรม">
          ออก reward token ให้สมาชิกตอบคำถาม เก็บไว้แลก stickers ปลายปี
        </Tip>
        <Tip emoji="🧪" title="ทดลอง tokenomics">
          ลองออก token แล้วกระจายให้เพื่อน เห็น flow ของ transfer/burn จริง
        </Tip>
        <Tip emoji="🎓" title="โปรเจกต์เรียน">
          เอาไปอ้างเป็นผลงาน Web3 — contract verify ได้ public on BaseScan
        </Tip>
      </section>
      </div>
    </main>
  );
}

function Tip({
  emoji,
  title,
  children,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <p className="text-2xl mb-1.5" aria-hidden>
        {emoji}
      </p>
      <p className="text-sm font-semibold mb-1">{title}</p>
      <p className="text-xs text-[var(--color-muted)] leading-relaxed">
        {children}
      </p>
    </div>
  );
}
