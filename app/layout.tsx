import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai, Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  variable: "--font-ibm-plex-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://web3.cuvetsmo.com"),
  title: {
    default: "CUVETSMO Web3 — Playground สำหรับนิสิตสัตวแพทย์",
    template: "%s · CUVETSMO Web3",
  },
  description:
    "Web3 playground for Thai vet students — learn, play, build, create. 4 เสาหลัก: Learn, Play, Build, The Lab. Educational testnet.",
  applicationName: "CUVETSMO Web3",
  keywords: [
    "web3",
    "cuvetsmo",
    "chulalongkorn",
    "veterinary",
    "blockchain education",
    "base sepolia",
    "soulbound token",
    "nft",
    "dao",
    "thai web3",
  ],
  authors: [{ name: "CUVETSMO Web3 Working Group" }],
  creator: "CUVETSMO",
  publisher: "CUVETSMO",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "CUVETSMO Web3 — Playground for Thai Vet Students",
    description:
      "Learn, Play, Build, The Lab. Educational testnet by students, for students.",
    type: "website",
    locale: "th_TH",
    alternateLocale: ["en_US"],
    siteName: "CUVETSMO Web3",
    url: "https://web3.cuvetsmo.com",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "CUVETSMO Web3 — 4 pillars: Learn, Play, Build, The Lab",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CUVETSMO Web3 — Playground for Thai Vet Students",
    description:
      "Learn, Play, Build, The Lab. Built on Base, educational testnet.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://web3.cuvetsmo.com",
  },
};

// Inline script runs before React hydrates. Reads the user's stored choice
// from localStorage and applies it as data-theme, otherwise falls back to
// the system preference. Prevents the "flash of wrong theme" on load.
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('cuvetsmo-web3-theme');
    var dark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${ibmPlexSansThai.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
