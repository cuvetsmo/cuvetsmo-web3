import type { Metadata } from "next";
import { NftStudioForm } from "./_form";
import { LabModeSwitcher } from "@/components/lab-mode-switcher";
import { NFT_FACTORY_SOURCE } from "../_lib/contract-sources";
import { Reveal } from "@/app/(marketing)/_components/reveal";

export const metadata: Metadata = {
  title: "NFT Studio",
  description:
    "Deploy ERC-721 NFT collections in one click. 1/1 art หรือ quick collection. Images pinned to IPFS, contract on Base Sepolia.",
};

export default function NftStudioPage() {
  return (
    <main>
      <section className="relative overflow-hidden cloud-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-brand)] font-semibold mb-2">
              The Lab — NFT Studio
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-2">
              🎨 NFT Studio
            </h1>
            <p className="text-[var(--color-muted)] text-sm sm:text-base leading-relaxed max-w-2xl">
              อัปโหลดรูป · ตั้งชื่อ collection · เลือก max supply · แล้ว deploy ERC-721
              contract ลง Base Sepolia · IPFS pin อัตโนมัติผ่าน Pinata ·
              เหมาะกับงาน 1/1 art · charity drop · ตั๋วเข้างาน digital.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <LabModeSwitcher
        sourceTitle="NFTFactory.sol"
        sourceCode={NFT_FACTORY_SOURCE}
        githubUrl="https://github.com/cuvetsmo/cuvetsmo-web3/blob/main/contracts/src/NFTFactory.sol"
        remixUrl="https://remix.ethereum.org/#url=https://github.com/cuvetsmo/cuvetsmo-web3/blob/main/contracts/src/NFTFactory.sol"
        contractIntro="โรงงานออก ERC-721 collection ใหม่. baseURI ชี้ไปยัง IPFS folder ที่มี metadata JSON ของแต่ละ token id."
      >
        <NftStudioForm />
      </LabModeSwitcher>
      </div>
    </main>
  );
}
