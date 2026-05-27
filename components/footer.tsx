import Image from "next/image";
import Link from "next/link";

/**
 * Site footer · 3 columns + brand watermark + powered-by strip + disclaimer.
 *
 * Powered-by row uses the actual public/partners/*.svg images (the same
 * official brand-kit files the trusted-by marquee renders). Each link
 * points to the partner's home page · target="_blank" with rel="noopener".
 */

const PROJECT_LINKS = [
  { href: "/about", label: "About" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/faq", label: "FAQ" },
  { href: "/glossary", label: "Glossary (TH/EN)" },
  { href: "/learn/zero-to-hero", label: "Zero to Hero" },
  { href: "/learn/wallet-101", label: "Wallet 101" },
];

const TOOL_LINKS = [
  { href: "/build/card", label: "Vet SBT Card" },
  { href: "/learn/quests", label: "Web3 Quests" },
  { href: "/play/mint", label: "Mint Playground" },
  { href: "/play/board", label: "On-chain Board" },
  { href: "/lab/token-forge", label: "Token Forge" },
  { href: "/lab/nft-studio", label: "NFT Studio" },
];

const CONTACT_LINKS = [
  { href: "https://cuvetsmo.com", label: "cuvetsmo.com" },
  { href: "https://github.com/cuvetsmo", label: "github.com/cuvetsmo" },
  { href: "https://status.cuvetsmo.com", label: "status.cuvetsmo.com" },
  { href: "mailto:palm@cuvetsmo.com", label: "palm@cuvetsmo.com" },
];

const POWERED_BY = [
  { name: "Base",         href: "https://base.org",         src: "/partners/base.svg",         color: "#0052ff" },
  { name: "Privy",        href: "https://privy.io",         src: "/partners/privy.png",        color: "#5b48ee" },
  { name: "Pimlico",      href: "https://pimlico.io",       src: "/partners/pimlico-mark.svg", color: "#ff6b35" },
  { name: "EAS",          href: "https://attest.org",       src: "/partners/eas.png",          color: "#0ea5e9" },
  { name: "Pinata",       href: "https://pinata.cloud",     src: "/partners/pinata.svg",       color: "#6a48ff" },
  { name: "OpenZeppelin", href: "https://openzeppelin.com", src: "/partners/openzep.svg",      color: "#4f56fa" },
];

export function Footer() {
  return (
    <footer
      className="relative mt-auto border-t border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden"
      role="contentinfo"
    >
      {/* Brand watermark · large infinity-loop mark fades behind the content */}
      <Image
        src="/web3-logo-mark.png"
        alt=""
        aria-hidden
        width={520}
        height={520}
        className="pointer-events-none select-none absolute -right-24 -bottom-24 opacity-[0.04] dark:opacity-[0.07]"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Powered-by row · top of footer for prominence */}
        <div className="pb-10 mb-10 border-b border-[var(--color-border)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)] mb-4">
            Powered by · ผสานกับ
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {POWERED_BY.map((p) => (
              <a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-brand)] hover:-translate-y-0.5 transition-all text-sm font-semibold"
                style={{ color: p.color }}
              >
                <img
                  src={p.src}
                  alt=""
                  aria-hidden
                  width={16}
                  height={16}
                  decoding="async"
                  loading="lazy"
                  className="block object-contain"
                  style={{ width: 16, height: 16 }}
                />
                <span>{p.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Site map · 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12">
          <FooterColumn title="Project" links={PROJECT_LINKS} />
          <FooterColumn title="Tools" links={TOOL_LINKS} />
          <FooterColumn title="Contact" links={CONTACT_LINKS} external />
        </div>

        {/* Bottom strip · brand + chain + made-in */}
        <div className="mt-12 pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-[var(--color-muted)]">
          <div className="flex items-center gap-2.5">
            <Image
              src="/web3-logo-mark.png"
              alt="CUVETSMO Web3"
              width={24}
              height={24}
              className="rounded-sm"
            />
            <p>Built by students, for students · Made in Bangkok 🇹🇭</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono">CUVETSMO Web3</span>
            <span className="inline-flex items-center gap-1.5 font-mono text-emerald-700 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Base Sepolia testnet
            </span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 rounded-xl bg-[var(--color-brand-light)] text-[var(--color-text)] text-xs leading-relaxed border border-[var(--color-brand)]/15">
          <strong className="font-semibold text-[var(--color-brand)]">
            Disclaimer ·
          </strong>{" "}
          educational testnet · not financial advice · not an investment
          offering. ทุก asset ในระบบเป็น testnet มูลค่า 0 บาท ·
          ใช้สำหรับการเรียนรู้เท่านั้น · contracts ยังไม่ผ่าน external audit ·
          mainnet deploy gated on audit + funded deployer (Phase 2 per{" "}
          <Link href="/roadmap" className="underline hover:text-[var(--color-brand)]">
            /roadmap
          </Link>
          ).
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  external,
}: {
  title: string;
  links: { href: string; label: string }[];
  external?: boolean;
}) {
  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)] mb-4">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            {external ? (
              <a
                href={link.href}
                target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="text-sm text-[var(--color-text)] hover:text-[var(--color-brand)] transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-sm text-[var(--color-text)] hover:text-[var(--color-brand)] transition-colors"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
