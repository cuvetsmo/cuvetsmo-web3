import type { Metadata } from "next";
import { PageBuilder } from "./_builder";
import { Reveal } from "@/app/(marketing)/_components/reveal";

export const metadata: Metadata = {
  title: "Page Builder",
  description:
    "สร้าง DApp page ของตัวเอง — drag & drop components, save แล้ว share ลิงก์ได้.",
};

export default function PageBuilderPage() {
  return (
    <main>
      <section className="relative overflow-hidden cloud-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-brand)] font-semibold mb-2">
              The Lab — Page Builder
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-2">
              🧱 Page Builder
            </h1>
            <p className="text-[var(--color-muted)] text-sm sm:text-base leading-relaxed max-w-2xl">
              สร้างหน้า DApp ของคุณแบบ no-code — drag component จากด้านซ้ายมา drop
              ในเฟรม · ตั้งค่า contract address ที่ผูก · save → ได้ JSON config
              เก็บไว้ · ปล่อย public page ใน Wave 3.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <PageBuilder />
      </div>
    </main>
  );
}
