import type { Metadata } from "next";
import { TokenForgeForm } from "./_form";

export const metadata: Metadata = {
  title: "Token Forge",
  description:
    "Deploy ERC-20 tokens in 60 seconds. Pick a name, symbol, supply, click deploy. ลง Base Sepolia ฟรี.",
};

export default function TokenForgePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <header className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          🪙 Token Forge
        </h2>
        <p className="text-[var(--color-muted)] text-sm leading-relaxed">
          สร้าง ERC-20 token ของคุณเอง · ใส่ชื่อ · symbol · supply ·
          กด deploy · ได้ contract address ที่ verify ได้บน BaseScan.
          เหมาะกับชมรม · meme coin · governance token · reward point.
        </p>
      </header>

      <TokenForgeForm />

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        <Tip emoji="🎯" title="Use case ของชมรม">
          ออก reward token ให้สมาชิกตอบคำถาม · เก็บไว้แลก stickers ปลายปี
        </Tip>
        <Tip emoji="🧪" title="ทดลอง tokenomics">
          ลองออก token + กระจายให้เพื่อน · เห็น flow ของ transfer/burn จริง
        </Tip>
        <Tip emoji="🎓" title="โปรเจกต์เรียน">
          เอาไปอ้างเป็นผลงาน Web3 · contract verify ได้ · public on BaseScan
        </Tip>
      </section>
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
