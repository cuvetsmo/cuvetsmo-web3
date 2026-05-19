"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { WalletButton } from "./wallet-button";

/**
 * Top navigation.
 * - Logo + wordmark link to /
 * - 5 nav links: Learn, Play, Build, The Lab, About
 * - Wallet button (right)
 * - Mobile: hamburger menu
 */

const NAV_LINKS = [
  { href: "/learn/wallet-101", label: "Learn" },
  { href: "/play/mint", label: "Play" },
  { href: "/build/card", label: "Build" },
  { href: "/lab/token-forge", label: "The Lab" },
  { href: "/about", label: "About" },
] as const;

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 bg-[var(--color-bg)]/85 backdrop-blur border-b border-[var(--color-border)]"
      role="banner"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0"
          aria-label="CUVETSMO Web3 home"
        >
          <Image
            src="/smo-logo.png"
            alt="CUVETSMO"
            width={32}
            height={32}
            className="rounded"
            priority
          />
          <span className="font-semibold text-[15px] tracking-tight">
            <span className="hidden sm:inline">CUVETSMO Web3</span>
            <span className="sm:hidden">Web3</span>
          </span>
        </Link>

        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-md text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-brand-light)] hover:text-[var(--color-brand)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <WalletButton />
          </div>
          <button
            type="button"
            className="md:hidden p-2 rounded-md hover:bg-[var(--color-border)]/40"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {mobileOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-bg)]">
          <nav
            className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1"
            aria-label="Mobile navigation"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 rounded-md text-sm font-medium hover:bg-[var(--color-brand-light)] hover:text-[var(--color-brand)]"
              >
                {link.label}
              </Link>
            ))}
            <div className="sm:hidden pt-2 mt-1 border-t border-[var(--color-border)]">
              <WalletButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
