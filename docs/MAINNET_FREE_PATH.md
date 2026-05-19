# MAINNET_FREE_PATH.md

> How `CUVETSMO Web3` runs on **Base mainnet for ~$0** — by leveraging
> EAS (Ethereum Attestation Service) + Coinbase Developer Platform (CDP)
> Paymaster + Coinbase Smart Wallet.
>
> Wave 2F deliverable · เขียน 2026-05-19

---

## TL;DR · สรุปสั้น

| Layer                    | Custom contracts path                    | Free EAS + CDP path                                   |
| ------------------------ | ----------------------------------------- | ------------------------------------------------------ |
| One-time deploy cost     | ~$10–$50 (deploy 6 contracts)             | **~$1.50** (register 3 schemas, ~$0.50 each)            |
| Per-mint cost            | ~$0.05–$0.20 (user pays gas)              | **~$0.10 sponsored** (CDP Paymaster, $0 to user)        |
| Audit cost               | $3k–$20k (custom code = custom risk)      | **$0** (EAS already audited by Ackee + Spearbit)        |
| UX for new student       | Need MetaMask + seed phrase + buy ETH     | **Passkey on phone** via Coinbase Smart Wallet          |
| Migration if grant lands | Re-deploy & migrate users                  | Re-deploy & dual-write while users migrate              |

**Cap**: CDP free tier gives ~$25/mo of Paymaster credit. At ~$0.10 per
attestation, that's ~250 free mainnet ops/mo. After that, either upgrade CDP
plan or fall back to user-paid gas. ([CDP Pricing](https://portal.cdp.coinbase.com/pricing))

---

## 1. Why this path · ทำไมใช้ EAS + CDP

The master plan assumed we deploy our own `VetSbtCard`, `BadgeRegistry`,
`Guestbook` contracts on Base mainnet. That's ~$10–$50 in deploy gas plus
ongoing per-mint cost that students would have to fund themselves with real
ETH on Base.

For an educational platform — where 90% of users are **first-time wallet
holders** — that's a non-starter UX. Three realisations let us flip the
problem:

1. **EAS gives us identical semantics for free**.
   EAS is "attestation as primitive" — anyone can attest anything to any
   address. We don't need our own SBT contract; we register schemas and
   issue attestations. The contracts are already deployed and audited on
   Base mainnet (`0x4200…0021`). [docs.attest.org](https://docs.attest.org/)

2. **CDP Paymaster sponsors user gas**.
   Coinbase Developer Platform's Paymaster is ERC-4337 compliant and
   gives every new account ~$25/mo of free credit. Wrap an EAS
   `attest()` call in a 4337 userOp → CDP sponsors → user pays $0.
   [docs.cdp.coinbase.com/paymaster](https://docs.cdp.coinbase.com/paymaster/docs/welcome)

3. **Coinbase Smart Wallet eliminates seed phrases**.
   Login with a passkey on the student's phone — no MetaMask install, no
   browser extension, no 12-word panic. The smart account works with CDP
   Paymaster out of the box.
   [smartwallet.dev](https://www.smartwallet.dev/)

Total student onboarding step: **tap "Connect with Coinbase Smart Wallet" →
authenticate with phone passkey → done**.

---

## 2. How EAS schemas differ from contracts

A traditional NFT/SBT contract owns its own state (token id → owner mapping).
EAS instead stores attestations in a single global contract — any address
can issue an attestation against any registered *schema*.

```
                EAS contract (0x4200...0021)
                       │
       ┌───────────────┼─────────────────────────────────┐
       │               │                                 │
   schema A         schema B                       schema C
  (VET_CARD)        (BADGE)                       (GUESTBOOK)
       │               │                                 │
   attestation     attestation                    attestation
   attestation     attestation                    attestation
       ...             ...                              ...
```

A schema is a typed shape:

```solidity
// VET_CARD schema (revocable)
uint16 yearAdmitted, bytes32 studentIdHash, uint8 facultyCode, uint8 departmentCode

// BADGE schema (revocable)
string badgeId, string metadataURI, uint64 awardedAt

// GUESTBOOK schema (immutable — no revocation)
string message
```

**Schema UIDs are deterministic** — same `(schema, resolver, revocable)`
tuple → same UID. So once registered, the UID is fixed forever.

### Trade-offs vs custom contracts

| Concern         | Custom contracts                          | EAS attestations                                |
| --------------- | ------------------------------------------ | ------------------------------------------------- |
| Custom logic    | Yes — modifiers, royalties, allowlists     | No — vanilla attest/revoke only                   |
| ERC-721/SBT API | Yes — wallets show NFTs natively           | No — wallets don't auto-display attestations      |
| Indexer         | Build your own subgraph                    | **Free EAS indexer** (base.easscan.org/graphql)   |
| Revocation      | Custom rules                               | Yes-or-no flag on schema                          |
| Gas per mint    | ~$0.05                                     | ~$0.10                                            |
| Audit risk      | High — your custom code is fresh           | Low — EAS audited by Ackee + Spearbit             |
| Composability   | Lower — every project deploys own contract | Higher — every project shares one global index    |
| Migration cost  | Re-deploy, migrate token ids               | Re-deploy custom, dual-attest during cutover      |

For an educational vet credential, we want the **low audit risk + free
indexer + global composability** — even at the cost of ~2× per-mint gas
(which we sponsor anyway).

---

## 3. One-time setup · ตั้งค่าครั้งแรก

### 3.1 Sign up at CDP (do this before mainnet launch)

1. Go to [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com).
2. Create a project (one-time, free).
3. Enable **Paymaster** for Base mainnet (chain id `8453`).
4. Optionally create a **policy** — e.g. "max 5 ops per user per day, only
   to `0x4200…0021` (EAS contract)". Get the policy ID.
5. Grab the RPC URLs:
   - Paymaster: `https://api.developer.coinbase.com/rpc/v1/base/<projectId>`
   - Bundler:   `https://api.developer.coinbase.com/rpc/v1/base/<projectId>`
     (Same shape; same key. CDP routes by method.)
6. Add to `.env.local`:
   ```
   NEXT_PUBLIC_CDP_PAYMASTER_URL=https://api.developer.coinbase.com/rpc/v1/base/<projectId>
   NEXT_PUBLIC_CDP_BUNDLER_URL=https://api.developer.coinbase.com/rpc/v1/base/<projectId>
   NEXT_PUBLIC_CDP_POLICY_ID=<optional-policy-uuid>
   ```

> ⚠️ These URLs include your project ID and are technically public — the
> Paymaster API checks Origin header server-side. CDP also lets you bind
> to allowed origins (e.g. `https://web3.cuvetsmo.com`). Do that before
> mainnet.

### 3.2 Register the 3 schemas

Two options.

**Option A — admin wallet (recommended).**

```bash
# generate admin keypair (one-time)
cast wallet new

# Fund the printed address with ~$2 of Base mainnet ETH
#   (Coinbase, Binance, or any onramp; or bridge from Ethereum L1)

# Put the private key in .env.local (server-only — NEVER NEXT_PUBLIC_)
echo "EAS_ADMIN_PRIVATE_KEY=0x..." >> .env.local

# Register all three schemas
for name in VET_CARD BADGE GUESTBOOK; do
  curl -X POST http://localhost:3000/api/eas/schemas \
    -H "Content-Type: application/json" \
    -d "{\"schemaName\":\"$name\",\"network\":\"base\"}"
done
```

Each call returns:

```json
{
  "schemaName": "VET_CARD",
  "uid": "0xabc...def",
  "txHash": "0x123...",
  "easExplorerUrl": "https://base.easscan.org/schema/view/0xabc...def"
}
```

Paste each UID into `.env.local`:

```
NEXT_PUBLIC_EAS_SCHEMA_VET_CARD=0xabc...
NEXT_PUBLIC_EAS_SCHEMA_BADGE=0xdef...
NEXT_PUBLIC_EAS_SCHEMA_GUESTBOOK=0x123...
```

Push to Vercel env vars too. Redeploy.

**Option B — CDP-sponsored registration via the connected admin wallet.**

When Palm is signed in with Coinbase Smart Wallet AS the admin role, an
admin-only page calls `lib/eas.ts registerSchema()` directly from the
browser. CDP sponsors gas → admin pays $0. Same end state.

### 3.3 (Optional) Predict schema UIDs before registration

UIDs are deterministic. If you want to know the UID in advance — say to
pre-populate `.env.local` and let the first attestation register the schema
on the fly — use:

```ts
import { computeSchemaUid, SCHEMAS } from "@/lib/eas";

const uid = computeSchemaUid(
  SCHEMAS.VET_CARD.schema,
  "0x0000000000000000000000000000000000000000", // no resolver
  SCHEMAS.VET_CARD.revocable,
);
```

The UID is stable across networks too — same Base mainnet UID also works
on Base Sepolia if you register there.

---

## 4. Ongoing attestation flow · ออก attestation ครั้งต่อๆ ไป

```ts
import { attestVetCard } from "@/lib/eas";
import { sponsorUserOperation, sendUserOperation } from "@/lib/cdp";
import { usePrivy, useWallets } from "@privy-io/react-auth";

// Inside a "use client" component:
const { wallets } = useWallets();
const wallet = wallets.find((w) => w.connectorType === "coinbase_smart_wallet");
const provider = await wallet?.getEthereumProvider();

// Direct path — user pays gas (works today, ~$0.10 on Base mainnet)
const { uid, txHash } = await attestVetCard({
  recipient: studentAddress,
  signer: provider,
  data: {
    yearAdmitted: 2021,
    studentIdHash: "0xabc...",
    facultyCode: 1,
    departmentCode: 0,
  },
});

// 4337 + CDP-sponsored path — user pays $0
// (full pipeline lives in a separate handler — see CDP docs §"Sponsored UserOps")
//   1. Build userOp calling EAS.attest(...) via the Smart Wallet's executeBatch
//   2. getStubPaymasterData → estimate gas → sponsorUserOperation → sendUserOperation
//   3. Poll eth_getUserOperationReceipt
```

For Wave 2F day-1, the **direct path** is wired and works once a user has
~$0.50 of Base mainnet ETH. The **sponsored path** is wired but inert until
`NEXT_PUBLIC_CDP_PAYMASTER_URL` is configured.

---

## 5. Visualisation — what the user sees

```
┌──────────────────────────────────────────────┐
│  🌐 Mainnet (จริง · ฟรี via EAS+CDP)         │
├──────────────────────────────────────────────┤
│                                              │
│  🎓 Vet SBT Card                  immutable │
│  2026-05-19 · 0xA1b2…F0  recipient            │
│                                              │
│  yearAdmitted    2021                        │
│  studentIdHash   0x4f7a…c9                   │
│  facultyCode     1                           │
│  departmentCode  0                           │
│                                              │
│  Issuer 0xabcd…ef01  UID 0xabc1…def8         │
│  ─────────────────────────────────────       │
│  View on EAS explorer →                      │
└──────────────────────────────────────────────┘
```

Provided by the `<EasAttestationCard />` component (in
`components/eas-attestation-card.tsx`).

---

## 6. Cost ceiling — what happens after $25/mo

CDP free tier is ~250 sponsored Base mainnet ops/month. Three escape valves:

1. **Upgrade CDP** — $99/mo for ~1000 ops, $499/mo for ~5000. Negligible if
   the app grows beyond 250 students/mo doing 1 attestation each.
2. **Fall back to user-paid gas** — for users who hit the rate limit, surface
   a "click here to top up 0.0001 ETH" link to a Base onramp. We can detect
   the 429 from CDP and switch UI automatically.
3. **Batch via 4337 `executeBatch`** — multiple attestations in one userOp
   share one verification cost. Cuts per-mint to ~$0.04.

---

## 7. Migration path if grant lands · ถ้ามีงบใหญ่

If the project later gets funded and wants its own audited contracts:

1. Deploy `VetSbtCard`, `BadgeRegistry`, `Guestbook` (the contracts Agent A
   wrote) on Base mainnet.
2. Dual-write: every new credential goes to BOTH the EAS attestation AND the
   custom contract. UI prefers the custom contract.
3. Backfill: a script iterates `getAttestationsBySchema(...)` and re-issues
   existing credentials to the new contract. ~$50 of gas total for ≤500
   credentials.
4. Sunset the EAS path after 1 month dual-write window.

No data loss, no broken links — EAS attestations remain valid on chain
forever, so anyone with a saved EAS explorer link still sees their
credential.

---

## 8. Security notes

- **EAS_ADMIN_PRIVATE_KEY** is server-only — never expose to client. If
  rotated, the schemas don't change UIDs (they're already on chain), only
  the future-attestation issuer changes.
- **CDP project key** in `NEXT_PUBLIC_*` is public-by-design, but CDP rate
  limits per Origin. Bind to `CUVETSMO Web3` before mainnet.
- **Revocable schemas** (VET_CARD, BADGE) let us undo mistakes. Revoke
  events are public and indexed by EAS. Use sparingly — revoking is a
  social signal of "we got it wrong".
- **GUESTBOOK is immutable by design** — `revocable: false`. Once an
  attestation is on chain, it's there forever. Add a content-moderation
  step BEFORE attesting (preview + confirm).

---

## 9. Glossary · คำศัพท์

| Term            | Definition                                                                                |
| --------------- | ------------------------------------------------------------------------------------------ |
| EAS             | Ethereum Attestation Service — generic on-chain attestation primitive                      |
| Schema          | Typed shape describing what an attestation contains                                        |
| Attestation     | Single on-chain record matching a schema, issued by an attester to a recipient             |
| UID             | 32-byte unique id for either a schema or an attestation                                    |
| CDP             | Coinbase Developer Platform — provides Paymaster + bundler + smart wallet                  |
| Paymaster       | ERC-4337 contract that pays gas on behalf of users                                         |
| Bundler         | ERC-4337 service that batches userOps into a single L1 transaction                         |
| Smart Wallet    | Coinbase's passkey-based ERC-4337 account at keys.coinbase.com                             |
| UserOp          | ERC-4337 user operation — like a tx but routed through bundler + paymaster + smart wallet  |

---

## 10. References

- [EAS docs](https://docs.attest.org/)
- [EAS on Base — Schema Registry explorer](https://base.easscan.org/schemas)
- [CDP Paymaster — Welcome](https://docs.cdp.coinbase.com/paymaster/docs/welcome)
- [Coinbase Smart Wallet — smartwallet.dev](https://www.smartwallet.dev/)
- [ERC-4337 spec — entrypoint v0.7](https://eips.ethereum.org/EIPS/eip-4337)
- Wave 2F implementation: `lib/eas.ts`, `lib/cdp.ts`,
  `components/network-toggle.tsx`, `components/eas-attestation-card.tsx`,
  `app/api/eas/schemas/route.ts`.
