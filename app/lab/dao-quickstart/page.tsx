import type { Metadata } from "next";
import { DaoQuickstartForm } from "./_form";

export const metadata: Metadata = {
  title: "DAO Quickstart",
  description:
    "เปิด DAO ของกลุ่มคุณใน 5 นาที · Snapshot (free, off-chain) หรือ on-chain Governor contract.",
};

export default function DaoQuickstartPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <header className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          🏛️ DAO Quickstart
        </h2>
        <p className="text-[var(--color-muted)] text-sm leading-relaxed">
          เปลี่ยน group ของคุณเป็น DAO · เริ่มจาก{" "}
          <span className="font-semibold">Snapshot</span> (ฟรี · off-chain
          voting) แล้วค่อย upgrade เป็น on-chain Governor contract ทีหลัง.
        </p>
      </header>
      <DaoQuickstartForm />
    </main>
  );
}
