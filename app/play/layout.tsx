import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PillarNav } from "./_components/pillar-nav";

export default function PlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <PillarNav />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
