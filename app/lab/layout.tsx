import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LabSubnav } from "./_components/lab-subnav";
import { LabDisclaimer } from "./_components/lab-disclaimer";
import { ContractStatusBanner } from "./_components/contract-status-banner";

export const metadata: Metadata = {
  title: {
    default: "The Lab",
    template: "%s · The Lab",
  },
  description:
    "The Lab — no-code creation tools: deploy ERC-20 tokens, NFT collections, soulbound badges, DAOs, and DApp pages on Base Sepolia. Educational testnet only.",
};

export default function LabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="flex-1">
        <section className="border-b border-[var(--color-border)] bg-[var(--color-card)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-3">
            <span className="inline-block px-2 py-0.5 rounded bg-[var(--color-brand-light)] text-[var(--color-brand)] text-[11px] font-semibold uppercase tracking-wider mb-3">
              The Lab · ห้องทดลอง
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
              สร้างของคุณเอง · No code needed
            </h1>
            <p className="text-[var(--color-muted)] leading-relaxed max-w-3xl">
              เครื่องมือสำหรับ deploy smart contracts ด้วยฟอร์ม · เหมาะกับชมรม
              · event · งานวิจัย · หรือเล่นสนุก · ทุกอย่าง deploy ลง Base Sepolia
              testnet ฟรี.
            </p>
            <LabDisclaimer />
          </div>
          <LabSubnav />
        </section>
        <ContractStatusBanner />
        {children}
      </div>
      <Footer />
    </>
  );
}
