import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-sm font-mono text-[var(--color-muted)] mb-3">404</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          ไม่พบหน้านี้
        </h1>
        <p className="text-[var(--color-muted)] mb-8">
          Page not found. ลองกลับไปที่หน้าแรก หรือลองหน้าใดหน้าหนึ่งด้านล่าง.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-brand">
            กลับหน้าแรก
          </Link>
          <Link href="/learn/wallet-101" className="btn-outline">
            เริ่ม Wallet 101
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
