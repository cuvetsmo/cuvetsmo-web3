/**
 * Client-side Account Abstraction helpers — CUVETSMO Web3
 *
 * Wrap a Privy embedded wallet as a Coinbase Smart Account and send
 * Pimlico-sponsored UserOps so end users mint without holding ETH.
 *
 * Architecture:
 *
 *     Privy embedded wallet (EOA)
 *               │  signs messages via EIP-1193
 *               ▼
 *     Coinbase Smart Account (CREATE2 · version 1.1)
 *               │  packs calls into UserOps
 *               ▼
 *     Pimlico Bundler + Verifying Paymaster (EntryPoint v0.6)
 *               │
 *               ▼
 *     Base Sepolia · target contract (msg.sender = smart account address)
 *
 * Same Smart Account version (1.1) + EntryPoint v0.6 that the deploy
 * script uses on the server side — so the smart account address is
 * derived deterministically from the EOA owner.
 *
 * Important UX implication: the user's "primary address" becomes their
 * smart account, NOT the Privy EOA. Reads (`balanceOf`, `cardOf`, etc.)
 * must use the smart account address. Use `useSmartAccountAddress()` to
 * fetch it once on connect.
 */
import {
  createPublicClient,
  http,
  type Address,
  type Hex,
  type WalletClient,
} from "viem";

// `PublicClient` from viem has a nominal duplicate via @ethereum-attestation-service/eas-sdk's nested viem.
// Even ReturnType<typeof createPublicClient> drags in the nominal identity, so cast through `unknown`
// where the value crosses the boundary (toCoinbaseSmartAccount, createBundlerClient).
type LocalPublicClient = ReturnType<typeof createPublicClient>;
import { baseSepolia } from "viem/chains";
import { toAccount } from "viem/accounts";
import {
  toCoinbaseSmartAccount,
  createBundlerClient,
  createPaymasterClient,
  entryPoint06Address,
  type SmartAccount,
} from "viem/account-abstraction";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import type { ConnectedWallet } from "@privy-io/react-auth";

// ─────────────────────────────────────────────────────────────────────────
// Env access
// ─────────────────────────────────────────────────────────────────────────

function getPimlicoUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_PIMLICO_BUNDLER_URL;
  return url && url.startsWith("https://") ? url : null;
}

/** True iff Pimlico bundler URL is configured — required for sponsorship. */
export function aaSponsorshipReady(): boolean {
  return getPimlicoUrl() !== null;
}

// ─────────────────────────────────────────────────────────────────────────
// Public client (read-only)
// ─────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _publicClient: any = null;

function getPublicClient(): LocalPublicClient {
  if (_publicClient) return _publicClient as LocalPublicClient;
  _publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(
      process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "https://sepolia.base.org",
    ),
  });
  return _publicClient as LocalPublicClient;
}

// ─────────────────────────────────────────────────────────────────────────
// Owner adapter — Privy EIP-1193 → viem Account
// ─────────────────────────────────────────────────────────────────────────

/**
 * Build a viem `Account` that delegates signing to a Privy embedded wallet
 * via its EIP-1193 provider.
 *
 * Used as the `owner` of the Coinbase Smart Account.
 */
async function makeOwnerFromWallet(wallet: ConnectedWallet) {
  const provider = await wallet.getEthereumProvider();
  const ownerAddress = wallet.address as Address;

  return toAccount({
    address: ownerAddress,
    async signMessage({ message }) {
      // viem passes message as `{ raw }` (hex bytes) or string. The provider
      // expects either form; pass through as-is.
      const payload =
        typeof message === "string"
          ? message
          : (message.raw as Hex);
      const sig = (await provider.request({
        method: "personal_sign",
        params: [payload, ownerAddress],
      })) as Hex;
      return sig;
    },
    async signTransaction() {
      // Smart accounts never sign raw transactions through the owner —
      // they only sign UserOp digests via signMessage / signTypedData.
      throw new Error(
        "signTransaction is not used for smart-account owners",
      );
    },
    async signTypedData(typedData) {
      const sig = (await provider.request({
        method: "eth_signTypedData_v4",
        params: [ownerAddress, JSON.stringify(typedData)],
      })) as Hex;
      return sig;
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────
// Smart Account derivation
// ─────────────────────────────────────────────────────────────────────────

const _smartAccountCache = new Map<string, SmartAccount>();

/**
 * Returns (and caches) the Coinbase Smart Account derived from the given
 * Privy embedded wallet. Address is deterministic — same wallet = same
 * smart account every session.
 */
export async function getSmartAccountFor(
  wallet: ConnectedWallet,
): Promise<SmartAccount> {
  const cached = _smartAccountCache.get(wallet.address.toLowerCase());
  if (cached) return cached;

  const owner = await makeOwnerFromWallet(wallet);
  const sa = await toCoinbaseSmartAccount({
    // Dual viem versions in node_modules (root + EAS SDK's nested copy)
    // produce structurally-identical-but-nominally-distinct PublicClient
    // types. Cast through `any` to bridge; runtime behaviour is unaffected.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client: getPublicClient() as any,
    owners: [owner],
    version: "1.1",
  });
  _smartAccountCache.set(wallet.address.toLowerCase(), sa);
  return sa;
}

/**
 * Lightweight helper that returns just the smart account's address —
 * useful for reads (`balanceOf`, `cardOf`, …) before any tx has been sent.
 */
export async function getSmartAccountAddressFor(
  wallet: ConnectedWallet,
): Promise<Address> {
  const sa = await getSmartAccountFor(wallet);
  return sa.address;
}

// ─────────────────────────────────────────────────────────────────────────
// Send sponsored call
// ─────────────────────────────────────────────────────────────────────────

export interface SponsoredCall {
  to: Address;
  data: Hex;
  value?: bigint;
}

export interface SponsoredResult {
  userOpHash: Hex;
  txHash: Hex;
  smartAccountAddress: Address;
  paymaster: Address | null;
  actualGasUsed: bigint;
  blockNumber: bigint;
}

/**
 * Sponsor + send a single contract call from a Privy wallet's Smart Account.
 *
 * The caller pays $0 — Pimlico's Verifying Paymaster covers all gas. The
 * Smart Account is deployed lazily on the first sponsored call (initCode
 * included automatically by viem's `toCoinbaseSmartAccount`).
 *
 * Throws on RPC error, on UserOp revert (`receipt.success === false`),
 * or on missing Pimlico configuration.
 */
export async function sendSponsoredCall(
  wallet: ConnectedWallet,
  call: SponsoredCall,
): Promise<SponsoredResult> {
  const pimlicoUrl = getPimlicoUrl();
  if (!pimlicoUrl) {
    throw new Error(
      "Sponsorship unavailable — NEXT_PUBLIC_PIMLICO_BUNDLER_URL is not set.",
    );
  }

  const publicClient = getPublicClient();
  const smartAccount = await getSmartAccountFor(wallet);

  const bundler = createBundlerClient({
    account: smartAccount,
    // Same dual-viem cast as above — runtime types match, TS nominal types
    // differ across the two viem copies.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client: publicClient as any,
    transport: http(pimlicoUrl),
    paymaster: createPaymasterClient({ transport: http(pimlicoUrl) }),
  });

  const pimlicoClient = createPimlicoClient({
    transport: http(pimlicoUrl),
    entryPoint: { address: entryPoint06Address, version: "0.6" },
  });

  // Pimlico's paymaster rejects userOps without explicit gas prices, so
  // fetch them ahead of time (the bundler doesn't auto-fill before the
  // paymaster call).
  const gasPrice = await pimlicoClient.getUserOperationGasPrice();

  const userOpHash = await bundler.sendUserOperation({
    account: smartAccount,
    calls: [{ to: call.to, value: call.value ?? 0n, data: call.data }],
    maxFeePerGas: gasPrice.fast.maxFeePerGas,
    maxPriorityFeePerGas: gasPrice.fast.maxPriorityFeePerGas,
  });

  const receipt = await bundler.waitForUserOperationReceipt({
    hash: userOpHash,
  });

  if (!receipt.success) {
    throw new Error(
      `UserOp reverted on-chain: ${userOpHash} (tx ${receipt.receipt.transactionHash})`,
    );
  }

  return {
    userOpHash,
    txHash: receipt.receipt.transactionHash,
    smartAccountAddress: smartAccount.address,
    paymaster: (receipt.paymaster as Address) ?? null,
    actualGasUsed: receipt.actualGasUsed ?? 0n,
    blockNumber: receipt.receipt.blockNumber,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Convenience: WalletClient interop (for places that already have one)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Some legacy components hold a wagmi `WalletClient` rather than a Privy
 * `ConnectedWallet`. This helper extracts the underlying provider out of
 * a WalletClient that wraps a Privy embedded wallet — useful for swapping
 * the call site without restructuring the wallet plumbing.
 *
 * Note: only works when the WalletClient's transport is `custom(provider)`
 * over a Privy EIP-1193 provider. Other transports throw.
 */
export function isPrivyWalletClient(client: WalletClient): boolean {
  return client.transport?.type === "custom";
}
