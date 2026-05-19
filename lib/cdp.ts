/**
 * Coinbase Developer Platform (CDP) Paymaster + Coinbase Smart Wallet
 * integration for CUVETSMO Web3
 *
 * Wave 2F · Free Base mainnet path.
 *
 * Two pieces:
 *   1. CDP Paymaster — sponsors ERC-4337 user operations so users pay $0 gas.
 *      Free tier: ~$25/month credit (sign up at portal.cdp.coinbase.com).
 *      With $25/mo and ~$0.10 per attestation, we cover ~250 mainnet ops/mo
 *      free.
 *   2. Coinbase Smart Wallet — passkey-based smart account, no seed phrase.
 *      Lives at keys.coinbase.com. Built-in support via wagmi's
 *      `coinbaseWallet` connector with `preference: 'smartWalletOnly'`.
 *
 * Combined, a vet student lands at CUVETSMO Web3, taps "Connect with
 * Coinbase Smart Wallet", logs in with their phone's passkey, and can attest
 * credentials on Base mainnet with $0 gas — no seed phrase, no MetaMask.
 *
 * Docs:
 *   - CDP Paymaster: https://docs.cdp.coinbase.com/paymaster/docs/welcome
 *   - Coinbase Smart Wallet: https://www.smartwallet.dev/
 *   - wagmi connector: https://wagmi.sh/react/api/connectors/coinbaseWallet
 */

import { coinbaseWallet } from "wagmi/connectors";

// ──────────────────────────────────────────────────────────────────────
// Paymaster config
// ──────────────────────────────────────────────────────────────────────

/**
 * CDP Paymaster RPC URL.
 *
 * After signing up at portal.cdp.coinbase.com, Palm gets a URL of the form
 *   https://api.developer.coinbase.com/rpc/v1/base/<projectId>
 * Set this in .env.local as NEXT_PUBLIC_CDP_PAYMASTER_URL.
 *
 * If unset, sponsorship is disabled and we fall back to user-paid txs
 * (which on Base mainnet costs ~$0.10 per attestation in user gas).
 */
export const CDP_PAYMASTER_URL =
  process.env.NEXT_PUBLIC_CDP_PAYMASTER_URL ?? "";

/** True when CDP Paymaster is configured — sponsorship available. */
export function cdpPaymasterReady(): boolean {
  return CDP_PAYMASTER_URL.startsWith("https://");
}

/**
 * ERC-4337 user operation shape (v0.7).
 * Includes optional EOA-style fields for ergonomic call sites.
 */
export interface UserOperation {
  sender: `0x${string}`;
  nonce: `0x${string}`;
  factory?: `0x${string}`;
  factoryData?: `0x${string}`;
  callData: `0x${string}`;
  callGasLimit?: `0x${string}`;
  verificationGasLimit?: `0x${string}`;
  preVerificationGas?: `0x${string}`;
  maxFeePerGas?: `0x${string}`;
  maxPriorityFeePerGas?: `0x${string}`;
  paymaster?: `0x${string}`;
  paymasterVerificationGasLimit?: `0x${string}`;
  paymasterPostOpGasLimit?: `0x${string}`;
  paymasterData?: `0x${string}`;
  signature?: `0x${string}`;
}

export interface SponsoredUserOperation extends UserOperation {
  paymaster: `0x${string}`;
  paymasterData: `0x${string}`;
}

/**
 * Standard ERC-4337 EntryPoint v0.7 address (same on every chain).
 */
export const ENTRY_POINT_07 =
  "0x0000000071727De22E5E9d8BAf0edAc6f37da032" as const;

/**
 * Standard ERC-4337 EntryPoint v0.6 address — kept for completeness; CDP
 * Paymaster currently lives on v0.7.
 */
export const ENTRY_POINT_06 =
  "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789" as const;

/**
 * Ask CDP Paymaster to sponsor a user operation on Base mainnet.
 *
 * Returns the same userOp with `paymaster` + `paymasterData` fields set.
 * The caller then submits via the bundler RPC (also CDP).
 *
 * If CDP is not configured, returns the input unchanged — caller can detect
 * this via `result.paymaster === undefined`.
 *
 * RPC method: `pm_getPaymasterStubData` (free, returns stub) then
 *             `pm_getPaymasterData` (with real signature, costs a credit).
 *
 * See: https://docs.cdp.coinbase.com/paymaster/docs/welcome
 */
export async function sponsorUserOperation(
  userOp: UserOperation,
  chainId: number = 8453,
  entryPoint: string = ENTRY_POINT_07,
): Promise<UserOperation | SponsoredUserOperation> {
  if (!cdpPaymasterReady()) {
    // Soft fallback: log a hint in dev, return unsponsored userOp so caller
    // can still send it (will fail unless user has funded Base mainnet ETH).
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      console.warn(
        "[cdp.ts] CDP_PAYMASTER_URL not set — userOp will not be sponsored. " +
          "Sign up at https://portal.cdp.coinbase.com and add " +
          "NEXT_PUBLIC_CDP_PAYMASTER_URL to .env.local.",
      );
    }
    return userOp;
  }

  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "pm_getPaymasterData",
    params: [
      userOp,
      entryPoint,
      `0x${chainId.toString(16)}`,
      { policy: process.env.NEXT_PUBLIC_CDP_POLICY_ID ?? undefined },
    ],
  };

  const res = await fetch(CDP_PAYMASTER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(
      `CDP paymaster ${res.status}: ${await res.text().catch(() => "<no body>")}`,
    );
  }
  const json = (await res.json()) as {
    result?: {
      paymaster: `0x${string}`;
      paymasterData: `0x${string}`;
      paymasterVerificationGasLimit?: `0x${string}`;
      paymasterPostOpGasLimit?: `0x${string}`;
    };
    error?: { code: number; message: string };
  };
  if (json.error) {
    throw new Error(`CDP paymaster error ${json.error.code}: ${json.error.message}`);
  }
  if (!json.result) {
    throw new Error("CDP paymaster returned no result");
  }
  return {
    ...userOp,
    paymaster: json.result.paymaster,
    paymasterData: json.result.paymasterData,
    paymasterVerificationGasLimit:
      json.result.paymasterVerificationGasLimit ?? userOp.paymasterVerificationGasLimit,
    paymasterPostOpGasLimit:
      json.result.paymasterPostOpGasLimit ?? userOp.paymasterPostOpGasLimit,
  };
}

/**
 * Ask CDP Paymaster for stub paymaster data (used for gas estimation).
 *
 * Stub data is free, returns dummy paymaster + paymasterData so the bundler
 * can estimate verificationGasLimit / paymasterVerificationGasLimit.
 *
 * Call this BEFORE sponsorUserOperation when running the standard 4337 flow:
 *   1. stub → estimate gas (free)
 *   2. real → sponsor & submit (1 credit)
 */
export async function getStubPaymasterData(
  userOp: UserOperation,
  chainId: number = 8453,
  entryPoint: string = ENTRY_POINT_07,
): Promise<UserOperation | SponsoredUserOperation> {
  if (!cdpPaymasterReady()) return userOp;

  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "pm_getPaymasterStubData",
    params: [
      userOp,
      entryPoint,
      `0x${chainId.toString(16)}`,
      { policy: process.env.NEXT_PUBLIC_CDP_POLICY_ID ?? undefined },
    ],
  };

  const res = await fetch(CDP_PAYMASTER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(
      `CDP paymaster stub ${res.status}: ${await res.text().catch(() => "<no body>")}`,
    );
  }
  const json = (await res.json()) as {
    result?: {
      paymaster: `0x${string}`;
      paymasterData: `0x${string}`;
      paymasterVerificationGasLimit?: `0x${string}`;
      paymasterPostOpGasLimit?: `0x${string}`;
    };
    error?: { code: number; message: string };
  };
  if (json.error) {
    throw new Error(
      `CDP paymaster stub error ${json.error.code}: ${json.error.message}`,
    );
  }
  if (!json.result) return userOp;
  return {
    ...userOp,
    paymaster: json.result.paymaster,
    paymasterData: json.result.paymasterData,
    paymasterVerificationGasLimit:
      json.result.paymasterVerificationGasLimit ?? userOp.paymasterVerificationGasLimit,
    paymasterPostOpGasLimit:
      json.result.paymasterPostOpGasLimit ?? userOp.paymasterPostOpGasLimit,
  };
}

// ──────────────────────────────────────────────────────────────────────
// Coinbase Smart Wallet connector
// ──────────────────────────────────────────────────────────────────────

/**
 * Build a Coinbase Smart Wallet wagmi connector.
 *
 * We use `preference: { options: 'smartWalletOnly' }` so users always get the
 * passkey Smart Wallet flow — no Coinbase Wallet extension fallback. This is
 * the "no seed phrase" UX target.
 *
 * App name + logo show up inside the Smart Wallet popup at keys.coinbase.com.
 *
 * Usage in `lib/wagmi.ts` (when Agent A wires mainnet):
 *
 *   import { getCoinbaseSmartWalletConnector } from "./cdp";
 *   const config = createConfig({
 *     chains: [base, baseSepolia],
 *     connectors: [getCoinbaseSmartWalletConnector()],
 *     ...
 *   });
 */
export function getCoinbaseSmartWalletConnector() {
  return coinbaseWallet({
    appName: "CUVETSMO Web3",
    appLogoUrl: "https://web3.cuvetsmo.com/smo-logo.png",
    preference: { options: "smartWalletOnly" },
  });
}

// ──────────────────────────────────────────────────────────────────────
// Bundler config (CDP also provides the bundler)
// ──────────────────────────────────────────────────────────────────────

/**
 * CDP bundler RPC URL — same shape as the paymaster URL, just a different
 * route. After Palm signs up at CDP, set NEXT_PUBLIC_CDP_BUNDLER_URL.
 *
 * If unset, falls back to public bundler — but public Base mainnet bundlers
 * aren't a free service, so practical use requires the CDP bundler.
 */
export const CDP_BUNDLER_URL = process.env.NEXT_PUBLIC_CDP_BUNDLER_URL ?? "";

export function cdpBundlerReady(): boolean {
  return CDP_BUNDLER_URL.startsWith("https://");
}

/**
 * Submit a (sponsored) user operation via CDP bundler.
 *
 * Returns the userOp hash — call eth_getUserOperationReceipt to poll.
 */
export async function sendUserOperation(
  userOp: UserOperation | SponsoredUserOperation,
  entryPoint: string = ENTRY_POINT_07,
): Promise<{ userOpHash: `0x${string}` }> {
  if (!cdpBundlerReady()) {
    throw new Error(
      "CDP_BUNDLER_URL not set — cannot submit user operation. " +
        "Set NEXT_PUBLIC_CDP_BUNDLER_URL in .env.local.",
    );
  }
  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_sendUserOperation",
    params: [userOp, entryPoint],
  };
  const res = await fetch(CDP_BUNDLER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(
      `CDP bundler ${res.status}: ${await res.text().catch(() => "<no body>")}`,
    );
  }
  const json = (await res.json()) as {
    result?: `0x${string}`;
    error?: { code: number; message: string };
  };
  if (json.error) {
    throw new Error(`CDP bundler error ${json.error.code}: ${json.error.message}`);
  }
  if (!json.result) {
    throw new Error("CDP bundler returned no result");
  }
  return { userOpHash: json.result };
}

// ──────────────────────────────────────────────────────────────────────
// Diagnostics
// ──────────────────────────────────────────────────────────────────────

export interface CdpStatus {
  paymasterConfigured: boolean;
  bundlerConfigured: boolean;
  policyId: string | null;
}

/** Snapshot of CDP setup — useful for an admin/status page. */
export function getCdpStatus(): CdpStatus {
  return {
    paymasterConfigured: cdpPaymasterReady(),
    bundlerConfigured: cdpBundlerReady(),
    policyId: process.env.NEXT_PUBLIC_CDP_POLICY_ID ?? null,
  };
}
