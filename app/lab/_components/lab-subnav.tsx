"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Horizontal sub-nav for The Lab. 6 tools.
 * Scrolls horizontally on mobile.
 */
const LAB_LINKS = [
  { href: "/lab/token-forge", label: "Token Forge", emoji: "🪙" },
  { href: "/lab/nft-studio", label: "NFT Studio", emoji: "🎨" },
  { href: "/lab/sbt-maker", label: "SBT Maker", emoji: "🎖️" },
  { href: "/lab/dao-quickstart", label: "DAO Quickstart", emoji: "🏛️" },
  { href: "/lab/page-builder", label: "Page Builder", emoji: "🧱" },
  { href: "/lab/templates", label: "Templates", emoji: "📚" },
] as const;

export function LabSubnav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label="The Lab tools"
      className="max-w-6xl mx-auto px-4 sm:px-6 overflow-x-auto"
    >
      <ul className="flex gap-1 sm:gap-2 pb-3 min-w-fit">
        {LAB_LINKS.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  active
                    ? "bg-[var(--color-brand)] text-white"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-brand-light)] hover:text-[var(--color-brand)]",
                )}
              >
                <span aria-hidden="true">{link.emoji}</span>
                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
