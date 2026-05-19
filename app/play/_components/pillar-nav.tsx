"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const PLAY_LINKS = [
  { href: "/play/mint", label: "Mint", sub: "สร้าง NFT/SBT" },
  { href: "/play/board", label: "Board", sub: "กระดานชุมชน" },
  { href: "/play/swap", label: "Swap", sub: "เรียนรู้ DeFi" },
] as const;

/**
 * Sub-navigation tabs for the Play pillar.
 *
 * Active tab pulled from `usePathname()`. Mobile-responsive (scrollable row).
 */
export function PillarNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Play sub-navigation"
      className="border-b border-[var(--color-border)] bg-[var(--color-card)]/50"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex gap-1 overflow-x-auto -mx-1 px-1 scrollbar-none">
          {PLAY_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors flex flex-col gap-0.5 leading-tight",
                  active
                    ? "border-[var(--color-brand)] text-[var(--color-brand)]"
                    : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]",
                )}
              >
                <span>{link.label}</span>
                <span className="text-[11px] font-normal opacity-70">
                  {link.sub}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
