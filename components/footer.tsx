import Image from "next/image";
import Link from "next/link";

/**
 * Site footer — 3 columns + brand watermark + disclaimer band.
 */

const PROJECT_LINKS = [
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/glossary", label: "Glossary (TH/EN)" },
  { href: "/learn/zero-to-hero", label: "Zero to Hero" },
  { href: "/learn/wallet-101", label: "Wallet 101" },
];

const TOOL_LINKS = [
  { href: "/play/mint", label: "Mint Playground" },
  { href: "/play/swap", label: "Swap Sandbox" },
  { href: "/lab/token-forge", label: "Token Forge" },
  { href: "/lab/nft-studio", label: "NFT Studio" },
];

const CONTACT_LINKS = [
  { href: "https://cuvetsmo.com", label: "cuvetsmo.com" },
  { href: "https://github.com/cuvetsmo", label: "github.com/cuvetsmo" },
  { href: "https://status.cuvetsmo.com", label: "status.cuvetsmo.com" },
  { href: "mailto:palm@cuvetsmo.com", label: "palm@cuvetsmo.com" },
];

export function Footer() {
  return (
    <footer
      className="relative mt-auto border-t border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden"
      role="contentinfo"
    >
      {/* Brand watermark — large infinity-loop mark fades behind the
          content. Soft enough to read text over, big enough that visitors
          register the logo without it shouting. */}
      <Image
        src="/web3-logo-mark.png"
        alt=""
        aria-hidden
        width={520}
        height={520}
        className="pointer-events-none select-none absolute -right-24 -bottom-24 opacity-[0.04] dark:opacity-[0.07]"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <FooterColumn title="Project" links={PROJECT_LINKS} />
          <FooterColumn title="Tools" links={TOOL_LINKS} />
          <FooterColumn title="Contact" links={CONTACT_LINKS} external />
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-[var(--color-muted)]">
          <div className="flex items-center gap-2.5">
            <Image
              src="/web3-logo-mark.png"
              alt="CUVETSMO Web3"
              width={24}
              height={24}
              className="rounded-sm"
            />
            <p>Built by students, for students. Made in Bangkok.</p>
          </div>
          <p className="font-mono">
            CUVETSMO Web3 — Base Sepolia testnet
          </p>
        </div>

        <div className="mt-4 p-3 rounded-md bg-[var(--color-brand-light)] text-[var(--color-brand)] text-xs leading-relaxed">
          <strong className="font-semibold">Disclaimer:</strong> educational
          testnet, not financial advice, not an investment offering. ทุก asset
          ในระบบเป็น testnet มูลค่า 0 บาท ใช้สำหรับการเรียนรู้เท่านั้น.
        </div>

        {/* Powered-by partner logos */}
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-muted)]">
          <span className="font-medium">Powered by</span>
          <a
            href="https://base.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--color-brand)]"
          >
            Base
          </a>
          <a
            href="https://privy.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--color-brand)]"
          >
            Privy
          </a>
          <a
            href="https://attest.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--color-brand)]"
          >
            EAS
          </a>
          <a
            href="https://pinata.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--color-brand)]"
          >
            Pinata
          </a>
          <a
            href="https://openzeppelin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--color-brand)]"
          >
            OpenZeppelin
          </a>
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
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            {external ? (
              <a
                href={link.href}
                target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="text-sm text-[var(--color-muted)] hover:text-[var(--color-brand)] transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-sm text-[var(--color-muted)] hover:text-[var(--color-brand)] transition-colors"
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
