import type { Metadata } from "next";
import { NftStudioForm } from "./_form";

export const metadata: Metadata = {
  title: "NFT Studio",
  description:
    "Deploy ERC-721 NFT collections in one click. 1/1 art หรือ quick collection. Images pinned to IPFS, contract on Base Sepolia.",
};

export default function NftStudioPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <header className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          🎨 NFT Studio
        </h2>
        <p className="text-[var(--color-muted)] text-sm leading-relaxed">
          อัปโหลดรูป · ตั้งชื่อ collection · เลือก max supply · deploy ERC-721
          contract ลง Base Sepolia. IPFS pin โดยอัตโนมัติผ่าน Pinata.
          เหมาะกับงาน 1/1 art · charity drop · ตั๋วเข้างาน digital.
        </p>
      </header>
      <NftStudioForm />
    </main>
  );
}
