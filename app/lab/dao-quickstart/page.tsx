import type { Metadata } from "next";
import { DaoQuickstartForm } from "./_form";
import { Reveal } from "@/app/(marketing)/_components/reveal";

export const metadata: Metadata = {
  title: "DAO Quickstart",
  description:
    "เปิด DAO ของกลุ่มคุณใน 5 นาที · Snapshot (free, off-chain) หรือ on-chain Governor contract.",
};

export default function DaoQuickstartPage() {
  return (
    <main>
      <section className="relative overflow-hidden cloud-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-brand)] font-semibold mb-2">
              The Lab — DAO Quickstart
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-2">
              🏛️ DAO Quickstart
            </h1>
            <p className="text-[var(--color-muted)] text-sm sm:text-base leading-relaxed max-w-2xl">
              เปลี่ยน group ของคุณเป็น DAO · เริ่มจาก{" "}
              <span className="font-semibold">Snapshot</span> (ฟรี · off-chain
              voting) แล้วค่อย upgrade เป็น on-chain Governor contract ทีหลัง.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <DaoQuickstartForm />
      </div>
    </main>
  );
}
