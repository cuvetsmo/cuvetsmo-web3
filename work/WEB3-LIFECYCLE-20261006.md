# Web3 observed lifecycle fixes — 2026-10-06

Separate candidate `codex/athene-web3-lint-20261006` from released `6cffe2cd1a1ee970b273125bd8f6bcf4b8dfc288`. No commit/push/deployment, wallet connection/signing/transaction, subgraph query or new dependency installation.

## Observed mechanisms and changes

- `lib/use-user-addresses.ts` previously exposed the previous smart account alongside a newly selected EOA while resolution was pending. Profile/card/dashboard callers consume this shared hook. Resolution is now tagged with its actual embedded wallet and EOA; the render immediately hides results belonging to another wallet, and late cancelled resolutions stay hidden. The existing resolver, read calls and failed-resolution semantics are retained.
- `app/(marketing)/_components/number-ticker.tsx` kept scheduled RAF callbacks after unmount and its persistent `done` state prevented later value updates. Animation now has a per-effect start/cancellation guard and cancels its actual frame on cleanup. Reduced-motion state uses a native external media snapshot, with the same false server snapshot and initial zero SSR placeholder. Markup/design and formatting remain intact.
- Minimal lint-only corrections: JSX comment text is an explicit string with identical display; the badge-minter handler uses const for its unreassigned binding; ABI extraction uses dynamic Node built-in imports within the existing CommonJS caller path and removes one unused helper. Contract/query/signing arguments and generated ABI bytes are unchanged.

## Actual verification

- Original whole-repo diagnostic reproduced20 errors/7 warnings; `work/lint-before.json`. This candidate deliberately fixes the two observed mechanisms and minimal safe syntax/module issues. It does not turn every diagnostic into an asserted production bug or claim whole-repo lint is green.
- Changed five source paths ESLint0 errors/0 warnings; TypeScript passed. `work/lint-changed.json`.
- One focused native Chromium/actual React hook+ticker lifecycle fixture compiles both released and candidate source. Released source fails stale-wallet binding, later ticker value and RAF cleanup; candidate passes normal resolution, A->B->C/late resolution/failure/disconnect, ticker value change/cleanup and zero SSR placeholder. SDK/address-resolution boundaries are mocked locally; no real wallet/RPC/signing proof. `work/render-lifecycle.json`, `work/verify-render-lifecycle.mjs`.
- Existing ABI CLI path produced identical4776-byte output across all11 controlled Foundry ABI fixtures, SHA256 `d24a0c2d0515ad1f72bc4c4a2c9badfb9a94ffc8b57060cebc8bdfac3505efc7`; `work/abi-compat.json`. No actual contract artifacts or lib/contracts.ts were regenerated.
- First candidate build failed because Turbopack rejects a dependency junction outside its filesystem root; retained `work/build-first-panic.log`. Only five explicit source changes were copied into the existing installed QA directory after preserving its prior bytes. All215 source files match the candidate after canonical LF normalization; six raw differences are solely line endings, recorded rather than called raw-byte equality. No compiler config/rule changes, install or deletion. `work/qa-source-parity.json`, `work/qa-before/`.
- Final existing QA `npm run build` passed Next16.2.6 compile, TypeScript and33-route prerender. New build only after final delta/failure recovery; no full browser matrix. Disk1.83GB after build; original rejected incomplete node_modules is untouched.

## Handoff

Parent owns independent review and any publication. Freeze only these five source files plus selected portable receipts. Other synchronous-effect and image/unused-directive diagnostics remain outside this minimal candidate; existing SSR/hydration guards were intentionally preserved. No speculative marketing polish or new features.
