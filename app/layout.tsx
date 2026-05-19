import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  variable: "--font-ibm-plex-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "web3.cuvetsmo.com — Web3 Playground สำหรับนิสิตสัตวแพทย์",
    template: "%s · web3.cuvetsmo.com",
  },
  description:
    "Web3 playground และ creation platform สำหรับนิสิตคณะสัตวแพทยศาสตร์ จุฬาฯ. 4 เสาหลัก: Learn, Play, Build, The Lab. Educational testnet.",
  keywords: [
    "web3",
    "cuvetsmo",
    "chulalongkorn",
    "veterinary",
    "blockchain education",
    "base sepolia",
  ],
  icons: {
    icon: "/smo-logo.png",
    apple: "/smo-logo.png",
  },
  openGraph: {
    title: "web3.cuvetsmo.com — Web3 Playground for Thai Vet Students",
    description:
      "Learn, Play, Build, The Lab. Educational testnet by students, for students.",
    type: "website",
    locale: "th_TH",
    siteName: "web3.cuvetsmo.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${ibmPlexSansThai.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
