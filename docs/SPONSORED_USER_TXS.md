# Gas-Sponsored User Transactions

End users mint with $0 gas via Pimlico's Verifying Paymaster + Coinbase Smart Wallet (ERC-4337 v0.6).

**Status**: infrastructure ready · `lib/aa-client.ts` + `lib/use-sponsored-write.ts` shipped · opt-in per call-site (existing wagmi flows untouched).

---

## Why

Day-1 flows on `/build/card` and `/play/board` use wagmi's `useWriteContract`, which expects the connected wallet to pay its own gas. That works for tech-curious students with funded wallets, but breaks the "first-time, never-held-crypto" onboarding promise:

> นิสิตคนแรกที่ไม่เคยรู้จัก crypto ใช้ web3 ได้ใน 5 นาที (มิชชั่นจาก Marketing landing)

Pimlico's paymaster signs over the user's UserOp and pays gas to the bundler. Free-tier covers ~250 ops/month on Base Sepolia — plenty for the Vet 86 cohort.

---

## Architecture

```
   Privy embedded wallet (EOA · brand-new on email login)
              │  signs UserOp digest via EIP-1193
              ▼
   Coinbase Smart Account (CREATE2 · version 1.1 · same as deploy script)
              │  packs contract call into UserOp
              ▼
   Pimlico Bundler + Verifying Paymaster (EntryPoint v0.6)
              │  submits to L2
              ▼
   Base Sepolia · target contract (msg.sender = Smart Account address)
```

Same EntryPoint + Smart Account version that `contracts/script/deploy-via-pimlico.mts` uses, so the address is derived deterministically from the EOA owner. First sponsored UserOp deploys the Smart Account; subsequent ones reuse it.

---

## API

### Hook: `useSponsoredWrite()`

Drop-in alternative to wagmi's `useWriteContract`. Returns `{ send, status, result, error, available, reset }`.

```tsx
"use client";
import { useSponsoredWrite } from "@/lib/use-sponsored-write";
import { CONTRACTS, GUESTBOOK_ABI } from "@/lib/contracts";

export function GuestbookPostButton({ message }: { message: string }) {
  const { send, status, result, error, available } = useSponsoredWrite();

  if (!available) {
    // Fall back to wagmi useWriteContract here.
    return <FallbackPostButton message={message} />;
  }

  return (
    <div>
      <button
        disabled={status !== "idle" && status !== "error"}
        onClick={() =>
          send({
            address: CONTRACTS.GUESTBOOK,
            abi: GUESTBOOK_ABI,
            functionName: "post",
            args: [message],
          })
        }
      >
        {status === "signing" && "กำลังเซ็น..."}
        {status === "confirming" && "ส่งเข้า block..."}
        {status === "success" && "✓ Posted (gasless)"}
        {(status === "idle" || status === "error") && "🎁 Post (Free · Smart Wallet)"}
      </button>
      {result && (
        <p className="text-xs text-[var(--color-muted)]">
          Posted from {result.smartAccountAddress.slice(0, 6)}...{result.smartAccountAddress.slice(-4)} ·{" "}
          <a href={`https://sepolia.basescan.org/tx/${result.txHash}`} target="_blank">
            ดู tx
          </a>
        </p>
      )}
      {error && <p className="text-xs text-red-700">{error.message}</p>}
    </div>
  );
}
```

### Lower-level: `sendSponsoredCall(wallet, { to, data, value })`

When you already have the encoded calldata (batched calls, server-built UserOps), call the helper directly:

```ts
import { sendSponsoredCall, getSmartAccountAddressFor } from "@/lib/aa-client";

const result = await sendSponsoredCall(privyWallet, {
  to: CONTRACTS.VET_SBT_CARD,
  data: encodedClaimCalldata,
});

console.log("smart account:", result.smartAccountAddress);
console.log("tx:", result.txHash);
console.log("explorer:", `https://sepolia.basescan.org/tx/${result.txHash}`);
```

### Read helper: `getSmartAccountAddressFor(wallet)`

The user's "primary address" after switching to AA is their Smart Account, NOT the Privy EOA. Use this when reading contract state on behalf of the user:

```ts
import { getSmartAccountAddressFor } from "@/lib/aa-client";

const userAddress = await getSmartAccountAddressFor(embeddedWallet);
const { data: card } = useReadContract({
  address: CONTRACTS.VET_SBT_CARD,
  abi: VET_SBT_CARD_ABI,
  functionName: "cardOf",
  args: [userAddress],
});
```

---

## Wiring checklist · per call-site

For each existing `useWriteContract` call you want to make gasless:

- [ ] Identify the Privy embedded wallet for the connected user
  ```ts
  const { wallets } = useWallets();
  const embedded = wallets.find((w) => w.walletClientType === "privy");
  ```
- [ ] Replace `writeContractAsync({ ... })` with `send({ ... })` from `useSponsoredWrite()`
- [ ] Add a fallback for users on external wallets (MetaMask, OKX, etc.) — they probably already pay their own gas, so route them through the existing wagmi path
- [ ] Update related reads — if the write mints to `msg.sender`, the recipient is now the Smart Account address. Change `cardOf(eoaAddress)` → `cardOf(smartAccountAddress)` and likewise everywhere the user's identity matters
- [ ] Test with a brand-new Privy email login (zero ETH) — first sponsored UserOp should also deploy the Smart Account

### Suggested rollout order

1. **`/play/board` Guestbook.post()** — lowest stakes (just a message · no value at risk)
2. **`/learn/quests` verify endpoint** — already EAS-sponsored on the server side; future client-side mints can opt-in similarly
3. **`/build/card` VetSBTCard.claim()** — biggest UX win · users with no ETH can finally claim
4. **`/play/mint` Mint Playground** — demo the gasless mint of a free NFT

---

## Required env vars

In `.env.local` (already set per `register-eas-schemas-via-pimlico.mts` run):

```
NEXT_PUBLIC_PIMLICO_BUNDLER_URL=https://api.pimlico.io/v2/84532/rpc?apikey=...
NEXT_PUBLIC_BASE_SEPOLIA_RPC=https://sepolia.base.org   # optional · falls back if unset
```

That's it. No server-side keys needed — sponsorship is signed by Pimlico, not by us.

For production Vercel:
- Mirror both env vars to the Vercel project (Settings → Environment Variables).
- Apply to **Production + Preview** so PR deployments get tested gasless too.
- No need to expose any private key to the browser bundle.

---

## Failure modes & graceful degradation

| Symptom | Cause | Fix |
|---|---|---|
| `available === false` on first render | No Privy embedded wallet (user logged in with external wallet) OR `NEXT_PUBLIC_PIMLICO_BUNDLER_URL` missing | UI: hide the "Free" button, fall back to wagmi path |
| UserOp reverts with "AA21 didn't pay prefund" | Paymaster declined sponsorship — likely free-tier quota exhausted | Check Pimlico dashboard · upgrade plan OR switch to free fallback (user pays gas) |
| UserOp reverts with contract error | Same root cause as a regular tx revert | Same handling as wagmi · surface the error to UI |
| Smart Account deploys on first UserOp · subsequent should reuse | Expected behaviour — first call pays for deployment + business logic in one UserOp | No fix — gas is sponsored either way |

The hook surfaces all of these via `status === "error"` + `error.message`. UI should keep the wagmi-based fallback visible whenever `available` is false so the user is never locked out.

---

## Known limitations

- **Smart Account ≠ EOA address** — anything tied to the user's identity (badges · cards · profiles) needs to use the Smart Account address going forward. Plan for: a one-time "migrate from EOA" UI for early adopters who claimed via the EOA path.
- **Single-chain only** — `lib/aa-client.ts` hardcodes `baseSepolia`. Multi-chain support means parameterising `chain` + `entryPoint` per call.
- **No tx batching yet** — `sendSponsoredCall` packs one call per UserOp. For batched flows (approve + transfer in one tx), extend the helper to accept `calls: SponsoredCall[]` and pass through to `bundler.sendUserOperation({ calls })`.
- **EntryPoint v0.6** — chosen to match the deploy script. v0.7 is also Pimlico-supported; switching requires regenerating the Smart Account address (different version = different CREATE2 salt).
