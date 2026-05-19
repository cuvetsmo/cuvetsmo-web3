import type { Metadata } from "next";
import { GLOSSARY } from "./_data";
import { GlossaryClient } from "./glossary-client";

export const metadata: Metadata = {
  title: "Glossary TH/EN",
  description:
    "ศัพท์ web3 แบบสองภาษา (ไทย/อังกฤษ) — 68 คำที่ใช้บ่อยใน CUVETSMO platform: wallet, NFT, SBT, DAO, gas, blockchain, และอีกมาก.",
  openGraph: {
    title: "Glossary TH/EN — CUVETSMO Web3",
    description:
      "Bilingual web3 dictionary for Thai vet students — 68 essential entries.",
    images: ["/og.png"],
  },
};

export default function GlossaryPage() {
  return <GlossaryClient entries={[...GLOSSARY]} />;
}
