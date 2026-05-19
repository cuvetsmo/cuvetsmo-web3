"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { cn } from "@/lib/utils";
import { cdpPaymasterReady } from "@/lib/cdp";
import type { EasNetwork } from "@/lib/eas";

/**
 * Network toggle — Testnet (Base Sepolia · เรียน · ทดลอง)
 *                  vs Mainnet (Base · จริง · ฟรี via EAS + CDP).
 *
 * Wave 2F · Free Base mainnet path.
 *
 * Default: testnet (safer for learners). Persisted in localStorage so the
 * student's choice survives reloads. Emits a context event so attestation
 * cards, faucet, and lab factories can re-query.
 *
 * Usage:
 *   1. Wrap any page that needs network awareness in <NetworkProvider>.
 *   2. Inside the page, call `useNetwork()` to read + set.
 *   3. Render <NetworkToggle /> wherever the switcher belongs (header right
 *      side or page top).
 */

const STORAGE_KEY = "cuvetsmo:network";

interface NetworkContextValue {
  network: EasNetwork;
  setNetwork: (n: EasNetwork) => void;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);

export function NetworkProvider({
  children,
  defaultNetwork = "base-sepolia",
}: {
  children: React.ReactNode;
  defaultNetwork?: EasNetwork;
}) {
  // Hydrate from localStorage lazily during initial state. SSR-safe: on
  // server `window` is undefined so we return the prop default; client
  // hydration then sees the same initial value (React handles the mismatch
  // because we render no localStorage-derived text on the server).
  const [network, setNetworkState] = useState<EasNetwork>(() => {
    if (typeof window === "undefined") return defaultNetwork;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "base" || stored === "base-sepolia") return stored;
    } catch {
      // localStorage unavailable (private mode, etc.) — ignore.
    }
    return defaultNetwork;
  });

  const setNetwork = useCallback((n: EasNetwork) => {
    setNetworkState(n);
    try {
      window.localStorage.setItem(STORAGE_KEY, n);
    } catch {
      // ignore
    }
    // Fire a window event so non-React listeners (older code) can react.
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cuvetsmo:network", { detail: n }));
    }
  }, []);

  const value = useMemo(
    () => ({ network, setNetwork }),
    [network, setNetwork],
  );

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}

/**
 * Hook to read + set the active network. Throws if used outside a provider.
 */
export function useNetwork(): NetworkContextValue {
  const ctx = useContext(NetworkContext);
  if (!ctx) {
    throw new Error(
      "useNetwork must be used inside <NetworkProvider>. " +
        "Wrap the page (or app/providers.tsx) with NetworkProvider.",
    );
  }
  return ctx;
}

/**
 * Optional hook for non-provider callers (e.g. legacy SSR shells).
 * Falls back to `defaultNetwork` if no provider is mounted.
 */
export function useNetworkOptional(
  defaultNetwork: EasNetwork = "base-sepolia",
): NetworkContextValue {
  const ctx = useContext(NetworkContext);
  const [fallback, setFallback] = useState<EasNetwork>(defaultNetwork);
  if (ctx) return ctx;
  return {
    network: fallback,
    setNetwork: setFallback,
  };
}

// ──────────────────────────────────────────────────────────────────────
// UI
// ──────────────────────────────────────────────────────────────────────

interface NetworkToggleProps {
  className?: string;
  /** Show the "Powered by EAS + CDP" banner under the switch on mainnet. */
  showBanner?: boolean;
}

/**
 * Two-button segmented control: Testnet vs Mainnet.
 *
 * Visual: a single pill with two halves. Active half = brand color background +
 * white text. Inactive half = card surface + muted text.
 */
export function NetworkToggle({
  className,
  showBanner = true,
}: NetworkToggleProps) {
  const { network, setNetwork } = useNetwork();
  const cdpReady = cdpPaymasterReady();

  return (
    <div className={cn("inline-flex flex-col gap-2", className)}>
      <div
        role="radiogroup"
        aria-label="เลือก network"
        className="inline-flex items-stretch rounded-full border border-[var(--color-border)] bg-[var(--color-card)] p-1 shadow-sm"
      >
        <TogglePill
          active={network === "base-sepolia"}
          onClick={() => setNetwork("base-sepolia")}
          icon="🧪"
          title="Testnet"
          subtitle="เรียน · ทดลอง"
        />
        <TogglePill
          active={network === "base"}
          onClick={() => setNetwork("base")}
          icon="🌐"
          title="Mainnet"
          subtitle="จริง · ฟรี"
        />
      </div>

      {showBanner && network === "base" && (
        <p className="text-xs text-[var(--color-muted)] leading-relaxed max-w-xs">
          Powered by{" "}
          <a
            href="https://attest.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-[var(--color-brand)] hover:text-[var(--color-brand-hover)]"
          >
            EAS
          </a>{" "}
          +{" "}
          <a
            href="https://portal.cdp.coinbase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-[var(--color-brand)] hover:text-[var(--color-brand-hover)]"
          >
            Coinbase Paymaster
          </a>{" "}
          · gas sponsored {cdpReady ? "✓" : "(pending CDP setup)"}
        </p>
      )}
    </div>
  );
}

function TogglePill({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      role="radio"
      type="button"
      onClick={onClick}
      aria-checked={active}
      className={cn(
        "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]",
        active
          ? "bg-[var(--color-brand)] text-white shadow-sm"
          : "text-[var(--color-muted)] hover:text-[var(--color-text)]",
      )}
    >
      <span aria-hidden className="text-base leading-none">
        {icon}
      </span>
      <span className="flex flex-col items-start leading-tight">
        <span>{title}</span>
        <span
          className={cn(
            "text-[10px] font-normal opacity-90",
            !active && "opacity-70",
          )}
        >
          {subtitle}
        </span>
      </span>
    </button>
  );
}

/**
 * Display chain id + label — handy for cards that show "you are on X".
 */
export function NetworkLabel({ className }: { className?: string }) {
  const { network } = useNetwork();
  const label = network === "base" ? "Base Mainnet" : "Base Sepolia";
  const chainId = network === "base" ? 8453 : 84532;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)]",
        className,
      )}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{
          background:
            network === "base"
              ? "var(--color-brand)"
              : "var(--color-muted)",
        }}
      />
      {label} <span className="opacity-60">· chain {chainId}</span>
    </span>
  );
}
