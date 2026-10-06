# Web3 Athene educational bridge — candidate receipt, 2026-10-06

Base: canonical GitHub `cuvetsmo/cuvetsmo-web3` main `49a3e9825f05b23b442da198264f9c9883df3bee`. The saved Desktop/CUVETSMO checkout was checked and absent; a new isolated reference/worktree was created. No original checkout or contracts were modified. No commit/push/deployment/signature/faucet/wallet transaction.

## Scope / exact public contract

Canonical selector correction after receiver review: `/api/athene-context` accepts `ref` and the exact backward-compatible `id` alias. Conflicting values or duplicate selectors fail400. Existing actual route-function contract check passed after this narrow patch; whole frontend build was not repeated. Updated route/check hashes: `work/endpoint-ref-patch.json`; all11 candidate/QA source hashes were reverified equal in `work/source-hashes.json`. Previously compiled local port3414 remains the earlier id-only route.

- `GET /api/athene-context?kind=quest|lesson&id=<real numeric ID>` projects the existing quest registry and the exact five authored Zero to Hero lessons. The latter moved verbatim to `lib/zero-to-hero.ts` so client lesson rendering and API metadata share one source; no second educational corpus or inference engine was created.
- Schema 1 includes surface/kind/canonical ref, title/summary/points, canonical source URL, empty images, provenance/data revision and actual response retrieval time. The endpoint excludes wallet addresses, private/recovery keys, signatures, tx hashes and completion/XP state. Security checkpoints distinguish reading/tutoring from real verification.
- Unknown/malformed selectors fail. Fixed CORS allows `https://ai.cuvetsmo.com`; one optional exact localhost HTTP origin works only outside production. No credentials, no wildcard. Successful public metadata caches for five minutes.
- `AtheneGuide` previews the record and opens `https://ai.cuvetsmo.com/?handoff=web3&kind=quest|lesson&ref=<real ID>`. Only public IDs travel in the URL; no secrets/notes/addresses. Source links reopen the exact current quest modal or lesson step via `?quest=N` / `?step=N`. Existing verification/signing flows are preserved and are not invoked by a handoff.

## Environment failure and safe QA recovery

The original candidate's `npm ci` ran out of disk space and left an incomplete generated `node_modules` at `C:/Users/palmz/.codex/worktrees/athene-ecosystem-20261006/cuvetsmo-web3/node_modules`. Automatic approval review rejected native PowerShell deletion with `rejected: blocked by policy`, including the single retry after explicit human authorization. Exact path/parent/directory/no-junction checks were performed first; no files were removed and no alternate deletion method was attempted.

Root authorized a **create-only** QA worktree at `C:/Users/palmz/.codex/worktrees/athene-ecosystem-build-20261006/cuvetsmo-web3`, same frozen HEAD. Only explicit changed source/test files and the public `.env.local.example` were copied, with no `.env.local`/secrets or dependency tree. SHA256 candidate/build equality is recorded there as `work/source-hashes.json`. The rejected original dependency target remains untouched. Fresh own locked installation succeeded in the new QA tree; roughly 10 GiB remained free at final verification.

## Actual checks / honest gate state

- Bundled Next 16.2.6 route/server-client guidance read from the complete installed Imaging runtime of the same exact Next version; Web3's first install was incomplete.
- `node scripts/athene-context-check.mjs`: all actual quests/five preserved lessons, literal context/source links, ID-only handoff, no-wallet-state projection, unknown/malformed IDs, fixed-origin CORS and production localhost refusal passed. This ran again successfully with the QA tree's own installed TypeScript.
- Full `tsc --noEmit --incremental false`: passed in the clean QA tree.
- Targeted ESLint on all eight changed runtime files: 0 errors/0 warnings; JSON receipt in QA `work/lint-changed.json`.
- Full `npm run lint`: **failed, 20 errors/7 warnings** in existing marketing effects, wallet/theme hooks, contract scripts and subgraph code. All changed runtime files passed their separate lint. No rule, timeout or assertion was weakened; broad wallet/marketing refactors were not mixed into this read-only bridge. This remains a release gate limitation.
- `npm run build`: Next 16.2.6 Turbopack compile, full TypeScript and all page generation passed. Existing edge-runtime/static-generation warning retained.
- Production-build QA server `http://127.0.0.1:3414`: actual mobile Chromium reopened lesson step 3 and quest 7; preview and exact handoff links/security checkpoints rendered; actual metadata endpoint/source refs/CORS passed; zero faucet/quest-verification actions occurred. `scripts/verify-athene-browser.mjs <installed Playwright index.mjs>` exited 0. Screenshot in QA: `work/browser/lesson-handoff.png`.

## Limits / next step

No production endpoint/provider/Privy login/wallet verification/transaction or physical-device proof. Cross-domain receiver is in the root cuvetsmo-ai candidate, not deployed. Review the candidate/build source equality, run integrated metadata-fetch/review against the local endpoint, then resolve the full-repo lint limitation and coordinate release separately. The unused partial original dependency directory needs an external cleanup route; it is not an unfinished source change.
