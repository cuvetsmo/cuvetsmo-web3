# STRUCTURE.md — File path conventions for Wave 2 agents

> Wave 1 scaffolded the foundation. Wave 2 has 5 parallel agents working on
> separate pillars. This file is the contract: where each agent puts their work.

## Agent ownership map

| Agent | Pillar | Owns these paths |
|-------|--------|------------------|
| **A — Smart Contracts** | All | `contracts/` (entire Foundry workspace) · `lib/contracts.ts` (addresses + ABIs) |
| **B — Learn/Build content** | Learn, Build | `app/learn/**` · `app/build/**` · `app/api/faucet/**` |
| **C — Play interactives** | Play | `app/play/**` |
| **D — The Lab factories** | The Lab | `app/lab/**` |
| **E — Marketing/Content** | Marketing | `app/(marketing)/**` · landing page · about · glossary · OG images · SEO meta |

## Shared surfaces (DO NOT edit alone — coordinate)

- `app/layout.tsx` — root layout (Wave 1 final)
- `app/providers.tsx` — Privy + Wagmi + Query (Wave 1 final, agent A may add chains)
- `app/globals.css` — brand tokens (Wave 1 final, agent E may extend)
- `components/header.tsx` — nav (Wave 1 final)
- `components/footer.tsx` — footer (Wave 1 final)
- `components/wallet-button.tsx` — connect button (Wave 1 final)
- `components/ui/**` — shared primitives (add yours but document)
- `lib/wagmi.ts` — chain config (agent A may add mainnet here later)
- `lib/privy.ts` — Privy config (agent E may tweak appearance)
- `lib/utils.ts` — shared helpers (everyone may add)
- `.env.local.example` — env template (everyone updates when adding env vars)

## Adding a new page (Wave 2 quick reference)

1. Create folder under your pillar: `app/<pillar>/<slug>/page.tsx`
2. Export default React component + `metadata` constant
3. Mark `"use client"` only if you need hooks (useState, usePrivy, wagmi hooks)
4. Pull contract addresses from `lib/contracts.ts`, never from env directly
5. Import shared components from `@/components/*`
6. Add nav link in `components/header.tsx` only after coordinating with team

## Adding a new component

- **Reusable (used by ≥2 pillars)** → `components/ui/<name>.tsx`
- **Pillar-specific** → `app/<pillar>/_components/<name>.tsx` (underscore prefix
  prevents Next.js from treating as a route)

## Adding contract ABI/address

1. Deploy contract via Foundry
2. Copy address into `.env.local` + Vercel env
3. Append `export const FOO_ABI = [...] as const;` to `lib/contracts.ts`
4. Add entry to `CONTRACTS` const in `lib/contracts.ts` (read from env via `asAddress()`)

## Adding API route

- Put under `app/api/<endpoint>/route.ts`
- Use `NextResponse.json(...)` for responses
- Server-only secrets (private keys, JWTs) MUST NOT be prefixed `NEXT_PUBLIC_`

## Brand tokens (do not redefine)

| Token | Value | Notes |
|-------|-------|-------|
| `--color-brand` | `#0369a1` (sky-700) | matches cuvetsmo.com |
| `--color-brand-hover` | `#0c4a6e` (sky-800) | hover state |
| `--color-brand-light` | `#e0f2fe` | backgrounds, badges |
| Font | IBM Plex Sans Thai | loaded in `app/layout.tsx` |

Use the CSS variables via `style={{ background: 'var(--color-brand)' }}`
or the utility classes `btn-brand`, `btn-outline`, `card` in `globals.css`.

## Build / dev checklist before PR

```bash
npm run lint       # ESLint must pass
npm run build      # next build must exit 0
```

## Pillar-specific spec references

- **Learn** — master plan §5.1, §5.2 (Wallet 101, Quests)
- **Play** — master plan §5.3, §5.4, §5.5 (Mint, Board, Swap)
- **Build** — master plan §5.6, §5.7 (Vet SBT Card, Profile)
- **The Lab** — master plan §7 (full chapter) + Appendix A
- **Marketing** — master plan §1, §2, §15, Appendix B (Glossary)

Master plan path: `C:\Users\palmz\Desktop\Web3\cuvetsmo_web3_master_plan.md`
