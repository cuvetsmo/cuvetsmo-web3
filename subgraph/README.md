# CUVETSMO Web3 · Goldsky subgraph

Indexes 3 contracts on Base Sepolia testnet:

| Contract | Address | Events |
|---|---|---|
| Guestbook | `0x070e7D...1fBc` | `MessagePosted` |
| BadgeRegistry | `0xabBb31...A67e` | `BadgeDefined` · `BadgeMinted` · `BadgeMinterChanged` |
| VetSBTCard | `0xE679d2...E6F5` | `CardClaimed` |

Output: GraphQL endpoint that the Next.js app queries instead of doing chunked `eth_getLogs` calls (Base Sepolia caps log range at 2000 blocks — see [`docs/INDEXER_SETUP.md`](../docs/INDEXER_SETUP.md) for the long-form rationale).

---

## Deploy (≈10 min)

```bash
# 0. Sign up at app.goldsky.com (GitHub auth · free tier)
npm install -g @goldskycom/cli
goldsky login

# 1. Build contract ABIs (writes contracts/out/<Name>.sol/<Name>.json)
cd contracts && forge build && cd ..

# 2. Copy the 3 ABIs we care about into subgraph/abis/
mkdir -p subgraph/abis
jq '.abi' contracts/out/Guestbook.sol/Guestbook.json     > subgraph/abis/Guestbook.json
jq '.abi' contracts/out/BadgeRegistry.sol/BadgeRegistry.json > subgraph/abis/BadgeRegistry.json
jq '.abi' contracts/out/VetSBTCard.sol/VetSBTCard.json   > subgraph/abis/VetSBTCard.json

# 3. Update startBlock in subgraph.yaml to the actual deploy block per contract
#    (find via BaseScan or `cast tx <deploy-tx-hash> -j | jq .blockNumber`)
#    Currently set to 27000000 as a conservative recent block.

# 4. Deploy
cd subgraph
goldsky subgraph deploy cuvetsmo-web3/0.0.1 --path .
```

After deploy the CLI prints a query URL like:
```
https://api.goldsky.com/api/public/<team-id>/subgraphs/cuvetsmo-web3/0.0.1/gn
```

Drop it into `.env.local` (and Vercel) as:
```
NEXT_PUBLIC_GOLDSKY_URL=https://api.goldsky.com/api/public/.../gn
```

Initial backfill takes ~5–10 min. Watch the dashboard for sync progress.

---

## Query examples

### Recent Guestbook posts
```graphql
query RecentPosts {
  guestbookPosts(first: 50, orderBy: timestamp, orderDirection: desc) {
    id
    author
    message
    timestamp
    blockNumber
    txHash
  }
}
```

### Badges held by an address
```graphql
query MyBadges($user: Bytes!) {
  badgeAwards(where: { user: $user }, orderBy: mintedAt, orderDirection: desc) {
    id
    mintedAt
    badge {
      id
      metadataURI
    }
  }
}
```

### Vet card by holder
```graphql
query MyCard($holder: ID!) {
  vetCard(id: $holder) {
    tokenId
    yearAdmitted
    facultyCode
    departmentCode
    mintedAt
    txHash
  }
}
```

---

## Where the frontend reads from

Once `NEXT_PUBLIC_GOLDSKY_URL` is set, swap these call sites from chunked `eth_getLogs` → indexer:

| Component | Current | New helper |
|---|---|---|
| `app/play/board/_guestbook.tsx` initial history fetch | `getContractEvents` × ranges | `query GuestbookPosts(first: 50, orderBy: timestamp desc)` |
| `app/build/profile/page.tsx` badge listing | wagmi `useReadContract({ functionName: "badgesOf" })` | `query BadgeAwards(where: { user: $address })` (no on-chain call · cached server-side) |
| `app/build/card/_components/vet-card.tsx` cardOf read | direct contract read | OK to keep direct read (single-record lookup is fast) |

The `useWatchContractEvent` hook (live updates) stays — the indexer is for historical bulk reads.

---

## Free-tier sanity

Goldsky free = ~1M req/month. For Vet 86 cohort (≤200 active users · 10 visits/day · 5 queries per visit) = ~300k req/month. Plenty of headroom.

If quota exhausted: bump to paid tier ($10–25/mo) OR switch to Envio (50k req/day free).

---

## Re-deploy after schema change

Schema changes (`schema.graphql`) require a new subgraph version:

```bash
goldsky subgraph deploy cuvetsmo-web3/0.0.2 --path .
```

Old versions keep serving until you point the env var at the new URL. Plan a grace period of 24h so existing browser tabs don't 404.

---

## Re-pin ABIs after contract redeploy

The contract addresses are hardcoded in `subgraph.yaml`. If contracts get redeployed (new address), bump the addresses + bump the subgraph version + redeploy.

---

## File tree

```
subgraph/
├─ subgraph.yaml      datasource declarations · 3 contracts
├─ schema.graphql     entity definitions · 4 types
├─ src/
│  └─ mappings.ts     AssemblyScript event handlers
├─ abis/              ← populated by Step 2 above
│  ├─ Guestbook.json
│  ├─ BadgeRegistry.json
│  └─ VetSBTCard.json
└─ README.md          ← this file
```
