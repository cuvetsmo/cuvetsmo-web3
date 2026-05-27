# Indexer Setup — Goldsky · Envio · self-hosted

**Status**: deferred · awaits Palm signup + deploy (≈30–60 min)
**Replaces**: chunked `eth_getLogs` / `getContractEvents` calls (lib/contracts.ts, `/play/board`, anywhere reading historical logs)
**Why**: Base Sepolia RPC enforces a 2000-block window per `eth_getLogs`. We chunk requests today (`90bc222`, `e7b4a39`), but reads still cost 5+ round-trips for any non-trivial range. An indexer collapses that to a single GraphQL query (~100 ms p50) and unlocks search/filter/sort against historical events.

---

## TL;DR — pick one

| Option | Cost (free tier) | Setup time | When to pick |
|---|---|---|---|
| **Goldsky** | up to 1M req/mo | ~20 min | recommended for cuvetsmo-web3 · easy schema · CLI deploy |
| **Envio** | 50k req/day | ~30 min | TypeScript-native handlers · ReScript-free path · more flexible logic |
| **Self-hosted (Ponder)** | $0 (your infra) | ~2 h | full control · need a hosted Postgres + cron worker |

Default recommendation: **Goldsky** for Phase 1 — least friction, free tier covers the entire Vet 86 cohort for the year. Switch to Envio if Goldsky's quota gets tight.

---

## Goldsky walkthrough

### 0 · Sign up
1. Go to <https://app.goldsky.com/dashboard>
2. Sign in with GitHub (auto-creates a team)
3. Verify the team email (Goldsky sends a magic link)
4. Free tier auto-applies — no credit card

### 1 · Install CLI + login
```bash
npm install -g @goldskycom/cli
goldsky login
# Browser opens → click Approve → CLI gets a token
```

### 2 · Create subgraph project
Create `subgraph/` at the repo root (sibling of `contracts/`). Minimum files:

```
subgraph/
├─ subgraph.yaml        # network + start block + ABI refs
├─ schema.graphql       # entity types (Guestbook posts, badges, etc.)
├─ src/mappings.ts      # event → entity transformers
└─ abis/
   ├─ Guestbook.json
   ├─ BadgeRegistry.json
   └─ VetSBTCard.json
```

Sample `subgraph.yaml` for the 3 priority contracts:
```yaml
specVersion: 0.0.5
schema:
  file: ./schema.graphql
dataSources:
  - kind: ethereum
    name: Guestbook
    network: base-sepolia
    source:
      address: "0x070e7D457546ab4cD4aD8C56c1253DC85a4a1fBc"
      abi: Guestbook
      startBlock: 14000000   # replace with the actual deploy block (see broadcast/ in contracts/)
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      language: wasm/assemblyscript
      file: ./src/mappings.ts
      entities: [GuestbookPost]
      abis:
        - name: Guestbook
          file: ./abis/Guestbook.json
      eventHandlers:
        - event: PostCreated(indexed address,indexed uint256,string,uint64)
          handler: handlePostCreated
  - kind: ethereum
    name: BadgeRegistry
    network: base-sepolia
    source:
      address: "0xabBb31fa07EBB4e6dC56c9BE2Dd65A73bFBfA67e"
      abi: BadgeRegistry
      startBlock: 14000000
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      language: wasm/assemblyscript
      file: ./src/mappings.ts
      entities: [Badge, BadgeAward]
      abis:
        - name: BadgeRegistry
          file: ./abis/BadgeRegistry.json
      eventHandlers:
        - event: BadgeDefined(indexed uint256,string,indexed address)
          handler: handleBadgeDefined
        - event: BadgeMinted(indexed address,indexed uint256)
          handler: handleBadgeMinted
```

Sample `schema.graphql`:
```graphql
type GuestbookPost @entity {
  id: ID!                    # tx-hash + log-index
  author: Bytes!             # indexed address
  postId: BigInt!
  message: String!
  timestamp: BigInt!
  blockNumber: BigInt!
}

type Badge @entity {
  id: ID!                    # badgeId as string
  metadataURI: String!
  minter: Bytes!
}

type BadgeAward @entity {
  id: ID!                    # user-badge composite
  user: Bytes!
  badge: Badge!
  mintedAt: BigInt!
}
```

(Copy ABIs from `contracts/out/<Name>.sol/<Name>.json` — the `abi` field only.)

### 3 · Deploy
```bash
cd subgraph
goldsky subgraph deploy cuvetsmo-web3/0.0.1 --path .
```
First deploy takes ~5–10 min to index history. Watch progress in the dashboard.

### 4 · Save the query URL
The CLI prints something like:
```
https://api.goldsky.com/api/public/<team-id>/subgraphs/cuvetsmo-web3/0.0.1/gn
```
Add to `.env.local`:
```
NEXT_PUBLIC_GOLDSKY_URL=https://api.goldsky.com/api/public/<team-id>/subgraphs/cuvetsmo-web3/0.0.1/gn
```

### 5 · Replace chunked log reads in the frontend
Files to patch:
- `app/play/board/page.tsx` — list Guestbook posts
- `app/build/profile/page.tsx` — list user's badges
- anywhere we call `publicClient.getLogs(...)` or `getContractEvents(...)`

New helper (add to `lib/indexer.ts`):
```typescript
const ENDPOINT = process.env.NEXT_PUBLIC_GOLDSKY_URL;

export async function indexer<T = unknown>(query: string, variables?: object): Promise<T> {
  if (!ENDPOINT) throw new Error("NEXT_PUBLIC_GOLDSKY_URL missing");
  const abort = new AbortController();
  const t = setTimeout(() => abort.abort(), 10_000);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
      signal: abort.signal,
    });
    if (!res.ok) throw new Error(`Indexer HTTP ${res.status}`);
    const json = await res.json();
    if (json.errors) throw new Error(`Indexer error: ${json.errors[0]?.message}`);
    return json.data as T;
  } finally {
    clearTimeout(t);
  }
}
```

Then in `/play/board`:
```typescript
const data = await indexer<{ guestbookPosts: GBPost[] }>(`
  query Posts($limit: Int = 50) {
    guestbookPosts(first: $limit, orderBy: timestamp, orderDirection: desc) {
      id author postId message timestamp blockNumber
    }
  }
`);
```

### 6 · Verify + decommission chunked reads
- Confirm the indexer returns Phase 0 posts within 100 ms p50
- Delete the `chunkLogs(...)` calls + their helpers from `lib/contracts.ts`
- Keep on-chain RPC reads ONLY for current state (`balanceOf`, `cardOf`, etc.) — never for history

---

## Envio walkthrough (alternative)

Same shape, different tooling:

1. `npm install -g envio` · `envio login`
2. `envio init` in a new `indexer/` folder · choose `Base Sepolia`, paste 3 contract addresses
3. Define `schema.graphql` (same as Goldsky)
4. Write handlers in TypeScript (no AssemblyScript) — `src/EventHandlers.ts`
5. `envio dev` to test locally · `envio deploy` to ship
6. Save the GraphQL URL → `NEXT_PUBLIC_ENVIO_URL`
7. Same swap-out as Goldsky in step 5 above

**Envio pros**: TypeScript handlers, faster local iteration, hot-reload.
**Envio cons**: smaller community, daily quota tighter than Goldsky's monthly.

---

## Risks / gotchas

- **Start block must match the deploy block**. Set `startBlock` to the block where each contract was deployed (find in `contracts/broadcast/<chain>/run-latest.json`). Indexing from block 0 wastes 10+ min.
- **Re-deploys break entity ids**. If a contract is redeployed (new address), bump the subgraph version (`cuvetsmo-web3/0.0.2`) and point the env var at the new URL. Old indexer keeps running for grace period.
- **Free tier quota tracking**. Goldsky shows req/mo in the dashboard. Set a Vercel cron to ping the indexer dashboard if heading toward 80% quota.
- **GraphQL caching**. Next.js may aggressively cache `/graphql` POSTs — pass `cache: 'no-store'` on the fetch when you need fresh data.

---

## When to revisit

- **Now**: keep using chunked `getLogs` — works for ≤ a few hundred events.
- **Phase 1 (cohort onboarding)**: ship Goldsky as soon as we have ≥ 50 active users — the chunk reads become noticeable.
- **Phase 2 (mainnet)**: required. Free tier still covers mainnet.

---

## Owner action checklist

- [ ] Sign up at app.goldsky.com (GitHub login)
- [ ] `npm i -g @goldskycom/cli && goldsky login`
- [ ] Scaffold `subgraph/` per template above (~20 min)
- [ ] Run `goldsky subgraph deploy cuvetsmo-web3/0.0.1 --path .`
- [ ] Paste query URL into `.env.local` + Vercel env (`NEXT_PUBLIC_GOLDSKY_URL`)
- [ ] Replace chunked log reads in `/play/board` first (smallest surface)
- [ ] Smoke-test, then sweep the rest
- [ ] Document the entity schema in `subgraph/README.md`
