# cuvetsmo-web3

Web3 playground and creation platform for Thai vet students. 4 pillars: **Learn · Play · Build · The Lab**. Educational testnet on Base Sepolia.

Production target: **https://web3.cuvetsmo.com**.

Master plan: `C:\Users\palmz\Desktop\Web3\cuvetsmo_web3_master_plan.md`.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + TypeScript (strict)
- Tailwind CSS 4 (`@theme inline` tokens)
- Privy (auth + embedded wallets) via `@privy-io/react-auth`
- wagmi 2 + viem (via `@privy-io/wagmi` config)
- TanStack Query
- Base Sepolia testnet

## Getting started

```bash
npm install
cp .env.local.example .env.local
# fill in NEXT_PUBLIC_PRIVY_APP_ID (https://dashboard.privy.io)
npm run dev
```

Open http://localhost:3000.

## Project structure

See **`STRUCTURE.md`** for Wave 2 agent ownership map.

```
app/
├── (marketing)/     — landing, about, glossary    (Agent E)
├── learn/           — Wallet 101, Quests           (Agent B)
├── play/            — Mint, Board, Swap            (Agent C)
├── build/           — Vet SBT Card, Profile        (Agent B)
├── lab/             — Token/NFT/SBT/DAO factories  (Agent D)
├── api/faucet/      — testnet ETH dispenser        (Agent B)
├── providers.tsx    — Privy + wagmi + Query
└── layout.tsx       — root + IBM Plex Sans Thai

components/
├── header.tsx       — top nav + wallet button
├── footer.tsx       — 3-col bilingual footer
├── wallet-button.tsx
└── ui/              — shared primitives

lib/
├── wagmi.ts         — Base Sepolia config
├── privy.ts         — Privy config
├── contracts.ts     — addresses + ABIs            (Agent A populates)
└── utils.ts         — shared helpers

contracts/           — Foundry workspace            (Agent A populates)
```

## Brand

| Token | Value |
|-------|-------|
| Primary | `#0369a1` (sky-700) |
| Hover | `#0c4a6e` (sky-800) |
| Font | IBM Plex Sans Thai |
| Logo | `public/smo-logo.png` |
| Tone | Thai-mixed, no emoji in nav |

## Wave plan

| Wave | Scope | Status |
|------|-------|--------|
| 1 | Scaffold, auth, routing, layouts | shipped |
| 2 | Smart contracts + content + UI (5 parallel agents) | up next |
| 3 | Vercel deploy + Cloudflare DNS + production cutover | future |

## Conventions

- **Never** mention "Claude" or "AI" in user-facing content.
- **Never** put secrets in `NEXT_PUBLIC_*` env vars.
- **Always** read contract addresses from `lib/contracts.ts` (not env directly).
- Run `npm run lint && npm run build` before opening a PR.

## License

MIT (code) · CC-BY-SA 4.0 (content) — see master plan §10.
