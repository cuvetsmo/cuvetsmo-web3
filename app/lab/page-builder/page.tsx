import type { Metadata } from "next";
import { PageBuilder } from "./_builder";

export const metadata: Metadata = {
  title: "Page Builder",
  description:
    "สร้าง DApp page ของตัวเอง · drag & drop components · save แล้ว share ลิงก์ได้.",
};

export default function PageBuilderPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <header className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          🧱 Page Builder
        </h2>
        <p className="text-[var(--color-muted)] text-sm leading-relaxed">
          สร้างหน้า DApp ของคุณแบบ no-code · drag component จากด้านซ้ายมา drop
          ในเฟรม · ตั้งค่า contract address ที่ผูก · save → ได้ JSON config
          เก็บไว้ · ปล่อย public page ใน Wave 3.
        </p>
      </header>
      <PageBuilder />
    </main>
  );
}
