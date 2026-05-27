# Base Mainnet Deploy — Audit Prep + Execution Playbook

**Scope**: 5 LOW-RISK contracts only — `OrgRegistry`, `VetSBTCard`, `BadgeRegistry`, `FirstStepsSBT`, `Guestbook`. Factories (`TokenFactory`, `NFTFactory`, `SBTFactory`, `GovernorFactory`) are deferred indefinitely — they ship arbitrary code on behalf of users and need a separate audit cycle plus admin tooling we haven't built yet.

**Status**: testnet stack proven (11 contracts on Base Sepolia chainId 84532 via Pimlico sponsored UserOps, deployer EOA balance 0 ETH). Mainnet `contracts/deployments/base.json` is a placeholder. Execution gated on (a) third-party audit and (b) a funded deployer wallet — both Palm-side decisions.

This doc is the "when Palm says go, here's what we do" runbook.

---

## 1 · Why audit before mainnet

Testnet bugs cost free tokens. Mainnet bugs cost reputation + real money + potential legal exposure once Thai DAO regulations come online. Specifically:

| Contract | Risk profile | Why it needs audit attention |
|---|---|---|
| `OrgRegistry` | Identity root for the ecosystem | Org admin == god mode for downstream contracts. Bad transfer = full hijack. |
| `VetSBTCard` | Identity SBT (per-student) | Student id hash collision · faculty/department code abuse · double-claim · admin-revoke flow |
| `BadgeRegistry` | Quest/achievement ERC-1155 SBT | Minter-role escalation · idempotent-mint bypass · transfer enforcement |
| `FirstStepsSBT` | Onboarding SBT (free) | Sybil mint resistance · cap enforcement |
| `Guestbook` | Public message board | Content moderation · spam DoS · `bytes32 hash` collision corner cases |

Factories deferred because: anyone calling `TokenFactory.create()` ships ERC-20 bytecode the auditor never reviewed. Until we add a curation layer + clear "no investment advice" wrapper, the surface area is too broad for a Vet 86 student project.

---

## 2 · Pick an audit firm (RFQ table)

| Firm | Strength | Price band (5 contracts ~1500 LOC) | Lead time |
|---|---|---|---|
| **OpenZeppelin** | Trusted brand · diligent · slow | $20–40k | 4–8 weeks |
| **Spearbit** | Senior researcher pool · flexible scope | $15–35k | 3–6 weeks |
| **Code4rena** (contest) | Crowd-sourced · finds wide bugs · cheaper | $8–20k contest pool | 1–2 weeks |
| **Sherlock** | Insurance-backed audit · single fix-list deliverable | $10–25k | 2–4 weeks |
| **Halborn / Pashov / Trail of Bits** | Reputable mid-tier | $10–30k | 3–5 weeks |

**Recommendation**: start with **Code4rena Lite** ($8–12k contest) — cheap, fast, surfaces the obvious bugs. Use the fix list to clean up, then submit to **Sherlock or Spearbit** for a final stamp.

### RFQ email template

```text
Subject: Audit request · CUVETSMO Web3 · 5 contracts · Base mainnet target

Hi <firm> team,

We're a Thai student-led web3 project at Chulalongkorn University Faculty
of Veterinary Science. Repo: github.com/cuvetsmo/cuvetsmo-web3 (public,
MIT). We're preparing 5 contracts for Base mainnet deployment:

  - OrgRegistry        (~150 LOC)
  - VetSBTCard         (~250 LOC, ERC-721 SBT)
  - BadgeRegistry      (~250 LOC, ERC-1155 SBT)
  - FirstStepsSBT      (~120 LOC, ERC-721 SBT)
  - Guestbook          (~180 LOC, simple message board)

Solidity 0.8.28, OpenZeppelin v5 base contracts. 79 Foundry tests
currently green. Deployed to Base Sepolia testnet via ERC-4337 +
Pimlico paymaster — no admin gas needed.

We're a student project with limited budget — happy to engage at the
sub-$15k tier. Mainnet deploy is gated on your sign-off. Realistic
launch target: 2-3 months from kickoff.

Could you share:
1. Audit lead time + cost range for this scope
2. Whether you accept student/non-profit pricing
3. Specific deliverables (private report → fix window → public report)
4. Sample report for a project of similar size, if shareable

Thanks!
ปาล์ม / Anuthin Danoi
VP Planning, CUVETSMO 68 · Vet 86
palm@cuvetsmo.com
```

Send to 3–4 firms in parallel; pick the best price/lead-time combo.

---

## 3 · Pre-audit code-freeze checklist

Do this BEFORE handing the repo to the auditor — every change after freeze costs re-audit fees.

- [ ] Tag the audit commit: `git tag v1.0-audit-base-mainnet && git push --tags`
- [ ] Update `contracts/README.md` with deploy parameters: `initialOwner` address for each contract on mainnet (will be Palm's new funded wallet)
- [ ] Confirm tests still green: `cd contracts && forge test` (all 79 passing)
- [ ] Run `forge coverage` and document any contract <90% line coverage in `contracts/AUDIT_NOTES.md`
- [ ] Slither static analysis: `slither contracts/src/ --filter-paths "lib|test"` — resolve high/medium findings before submission
- [ ] Generate a self-review doc (`contracts/AUDIT_NOTES.md`) listing: design choices, intended invariants, known limitations, the testnet deployment proof (Base Sepolia addresses)
- [ ] Verify deployer EOA never paid gas on testnet (a clean Pimlico-only history is a positive signal to auditors that the contracts work without privileged actors)
- [ ] Remove `console.log` / dev comments / commented-out code from `contracts/src/`
- [ ] Confirm OpenZeppelin imports point at a pinned version (`@openzeppelin/contracts@5.x`, not `^5.x`)
- [ ] Lock `foundry.toml` solc version (currently 0.8.28 — explicit, good)
- [ ] Re-read every `// TODO` and either resolve or convert to `// audit-note:` so the auditor sees intent

---

## 4 · Audit deliverables to demand

From any audit firm, insist on:

1. **Severity-tiered finding list** (critical · high · medium · low · informational)
2. **PoC per critical/high** finding (reproducible test or step-by-step)
3. **Suggested fix** per finding (not just "this is bad — fix it")
4. **Fix review** after we patch (one round included; multiple rounds = extra fee)
5. **Public report** released by the firm under their domain (not just a PDF you email us)
6. **Code commit pin** (auditor's report cites a specific SHA; we don't mainnet-deploy a different SHA)

---

## 5 · Funded deployer wallet plan

Mainnet deploy needs ~$5–20 USD of ETH on Base (sponsored deploy via Pimlico has a 1-tx limit on paid-tier mainnet for safety; cheaper to just fund a wallet).

| Item | Plan |
|---|---|
| Wallet generation | `cast wallet new` · or generate via ledger if hardware wallet available |
| Funding | Bridge ~$10 ETH from Palm's mainnet wallet via Base bridge (`bridge.base.org`) |
| Storage | Hardware wallet (Ledger Nano) · OR encrypted backup of mnemonic + 1Password vault |
| Post-deploy | Transfer ownership of all 5 contracts to a multisig (recommend Safe → safe.global on Base) within 24h of deploy |
| Multisig signers | Palm + 1 trusted Vet 86 board member + 1 advisor (3-of-3) · revisit at Phase 2 |

**Never use the testnet `DEPLOYER_PRIVATE_KEY` for mainnet**. The testnet key has been in `.env` files and committed-but-private repos · assume it's compromised at the trust level. Generate a fresh key + mainnet-only.

---

## 6 · Mainnet deploy script

Adapt `contracts/script/deploy-via-pimlico.mts` for mainnet by:

1. Change `network: baseSepolia` → `base` (chainId 8453)
2. Change `entryPoint: { ..., version: '0.6' }` → keep v0.6 (same EntryPoint on mainnet)
3. Add `--audit-tag v1.0-audit-base-mainnet` guard at the top of `main()` so the script refuses to run unless `git describe` matches the audited commit
4. PLAN array: keep only the 5 LOW-RISK contracts (drop all factories)
5. Output to a new file: `contracts/deployments/base.json` (currently placeholder · replace with real addresses)
6. After each contract, `cast verify-contract` on basescan.org (Etherscan API key needed)

Sketch:

```typescript
// contracts/script/deploy-to-base-mainnet.mts
//
// Adapted from deploy-via-pimlico.mts. Differences:
//   - Targets Base mainnet (chainId 8453)
//   - Refuses to run unless HEAD is at the audit tag
//   - Funds gas from a real EOA (not Pimlico) — paymaster sponsorship is
//     reserved for ongoing user txs, NOT for the one-time admin deploy
//   - Only the 5 LOW-RISK contracts in the PLAN array
//   - Post-deploy: cast verify-contract for each address
//   - Transfers ownership to the Safe multisig before exit

const AUDIT_TAG = 'v1.0-audit-base-mainnet';
const SAFE_ADDRESS = process.env.MAINNET_SAFE_ADDRESS; // 3-of-3 multisig

assertOnAuditTag(AUDIT_TAG);
assertWalletFunded(deployer, 0.005e18); // ≥ 0.005 ETH ($10-15)
assertEtherscanKeyPresent();

for (const step of PLAN_LOW_RISK_ONLY) {
  const addr = await deploy(step);
  await verify(addr, step);
  if (step.owner) await transferOwnership(addr, SAFE_ADDRESS);
}
```

---

## 7 · Post-deploy hardening

Within 24 hours of mainnet deploy:

- [ ] All contract ownership transferred to the Safe multisig
- [ ] EAS schemas re-registered on Base mainnet (`base.easscan.org` · same recipe as testnet · `contracts/script/register-eas-schemas-via-pimlico.mts` but with `baseSepolia` → `base`)
- [ ] Mainnet contract addresses pasted into Vercel production env (`NEXT_PUBLIC_*_ADDRESS_MAINNET=...`)
- [ ] Frontend dual-mode: env var `NEXT_PUBLIC_DEFAULT_NETWORK=base` switches the UI from testnet to mainnet (with a toggle for power users to test the testnet path)
- [ ] Public announcement (cuvetsmo.com blog + LINE OA + IG)
- [ ] Bug bounty announced: Immunefi or self-hosted on a private page (e.g. $500–2000 for critical findings, scaling with severity)

---

## 8 · External funding paths to investigate (don't gate launch on these)

- **Coinbase Build grants** — Base ecosystem grants (apply via base.org/builders)
- **Ethereum Foundation Devcon scholarship** — separate from grants but cohort-friendly
- **CUVETSMO research budget** — internal fund? sponsorships? · low priority since amounts are small
- **Vet pharma / animal welfare sponsorships** — narrative: "first Thai vet faculty on-chain credentials"

A modest $5–10k sponsor lock-in covers audit + mainnet deploy + 6 months of Pimlico paid tier (~$25/mo).

---

## Owner action checklist · in order

1. [ ] **Code freeze** — pre-audit checklist in §3 (~1 day)
2. [ ] **RFQ to 3 firms** — send the email template in §2 (~30 min · expect responses within a week)
3. [ ] **Pick firm + sign** — usually 1-2 weeks from RFQ to engagement letter
4. [ ] **Audit runs** — 2-6 weeks depending on firm
5. [ ] **Fix findings** — your fix-window; usually 1-2 weeks
6. [ ] **Public report released** — 1-2 weeks after fix sign-off
7. [ ] **Set up Safe multisig** on Base — `safe.global` · 3-of-3 · ~30 min
8. [ ] **Generate fresh deployer wallet + fund $10–15** — see §5
9. [ ] **Run mainnet deploy script** — §6 · once · idempotent via CREATE2
10. [ ] **Post-deploy hardening** — §7 · all within 24h of step 9

Realistic total timeline: **8–14 weeks from "go" decision to mainnet live**. Budget **$10–35k** depending on audit firm choice. Don't rush.

---

## When to revisit this doc

- After **Code4rena** signals on similar projects (their fee table updates quarterly)
- After **Base ecosystem grants** open another wave (check base.org/builders monthly)
- After **Privy Smart Wallets** mainnet config simplifies (would replace some of §6's deploy complexity)
- If a **Thai DAO law** lands — may force a re-think of the org structure before mainnet
