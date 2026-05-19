import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

/**
 * Marketing layout — public, no auth required.
 * Wraps landing, about, glossary.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
