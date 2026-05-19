import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function LabLayout({
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
