# PIMLICO_SPONSORED_DEPLOY.md

> How to deploy our Solidity contracts to Base Sepolia **without putting any
> ETH in the deployer wallet**, using a Coinbase Smart Account + ERC-4337
> UserOps + Pimlico's Verifying Paymaster.
>
> Wave 3.5 deliverable · เขียน 2026-05-19 · used in production to ship our
> 11 contracts at $0 deployer cost.

---

## TL;DR · สรุปสั้น

| Path | Deployer ETH required | Tooling | When to use |
| --- | --- | --- | --- |
| `forge script --broadcast` | ~0.01 ETH testnet (~$30 mainnet) | Foundry, EOA private key | Local dev, anvil, or anywhere with funded EOA |
| **Pimlico sponsored UserOp** | **$0** | viem + permissionless + Pimlico API key | Testnet when faucets are bot-blocked, or any time you don't want to fund a wallet |
| CDP sponsored UserOp | $0 | Coinbase Developer Platform | Mainnet (~$25/mo free credit; more chain coverage on Base) |

We chose the Pimlico path for Base Sepolia testnet deploys because:
1. Coinbase's Base Sepolia faucet is anti-bot blocked and Palm couldn't reliably drip 0.01 ETH.
2. Pimlico's free tier covers 100 UserOps/day on testnet — we only need 11 deploys.
3. The deployer EOA wallet stays at ~0 ETH which makes the deploy reproducible by Vet 87/88 next year without faucet pain.

---

## 1. The pattern — Smart Account + UserOp + Paymaster

ERC-4337 introduces a parallel mempool for **UserOperations** ("UserOps"),
which are validated and executed by a special on-chain contract called the
**EntryPoint**. A UserOp specifies:

- `sender` — a smart contract account ("Smart Account")
- `nonce` — replay protection
- `callData` — what the Smart Account should do when executed
- `initCode` — optional Smart Account deploy code (used on first UserOp only)
- `paymaster` + `paymasterData` — optional gas sponsor

The Smart Account's `execute(target, value, data)` function is the door
through which we deploy contracts: we just point it at the **CREATE2 factory**
with our init code as the data payload.

```
┌──────────────┐   1. signs UserOp    ┌─────────────┐
│  Owner EOA   │ ───────────────────► │  Bundler    │  (Pimlico)
│  (private    │                      │  Endpoint   │
│   key)       │                      └──────┬──────┘
└──────────────┘                             │
                                             │ 2. eth_sendUserOperation
                                             │    + paymasterAndData
                                             ▼
                                      ┌──────────────┐
                                      │  Paymaster   │  (Pimlico Verifying
                                      │  validates   │   Paymaster pays gas)
                                      │  + signs     │
                                      └──────┬───────┘
                                             │
                                             │ 3. wraps in normal tx
                                             ▼
                                      ┌─────────────────┐
                                      │  EntryPoint     │  (0x5FF1...2789, v0.6)
                                      │  v0.6           │
                                      └────────┬────────┘
                                               │ 4. calls sender.execute(...)
                                               ▼
                                      ┌─────────────────┐
                                      │  Smart Account  │  (deploys itself
                                      │  (CoinbaseSW    │   if first op,
                                      │   factory       │   then runs callData)
                                      │   creates it)   │
                                      └────────┬────────┘
                                               │ 5. SMARTACCOUNT.call(
                                               │      CREATE2_FACTORY,
                                               │      salt + initCode
                                               │    )
                                               ▼
                                      ┌─────────────────┐
                                      │  CREATE2        │  (0x4e59...4956c,
                                      │  Factory        │   Nick's universal
                                      │                 │   deterministic
                                      │  CREATE2 opcode │   deployer)
                                      └────────┬────────┘
                                               │ 6. deploys YourContract
                                               ▼
                                      ┌─────────────────┐
                                      │  YourContract   │  ← deterministic
                                      │  at predictable │     address
                                      │  CREATE2 addr   │
                                      └─────────────────┘
```

**Critical:** the bundler simulates the UserOp before accepting it; ERC-4337
forbids `CREATE2` opcodes during the **validation** phase (`validateUserOp`
on the Smart Account), but the **execution** phase is unrestricted. Because
we issue our `CREATE2` call from inside the Smart Account's `execute(...)`
(which runs in the execution phase), we're fine.

---

## 2. Why Pimlico's free tier covers it

| Resource | Pimlico free tier (testnet) | Our usage |
| --- | --- | --- |
| UserOps per day | 100 | 11 (one per contract) + ~5 retries headroom |
| UserOps per month | 3000 | small one-off |
| Chains | All chains Pimlico supports (Base Sepolia ✓) | Base Sepolia 84532 |
| Gas units per op | unlimited (testnet ETH is free for Pimlico) | up to ~2.1M gas per op (VetSBTCard) |
| Cost to us | **$0** | $0 |

Pimlico Paymaster address used: `0x6666666666667849c56f2850848cE1C4da65c68b`
(visible in the receipt — that's their on-chain Verifying Paymaster v0.6).

---

## 3. Trade-offs vs `forge script`

| Aspect | `forge script` | Pimlico-sponsored |
| --- | --- | --- |
| Deployer balance | needs ~0.01 ETH | $0 — Pimlico sponsors |
| Sender address | deployer EOA | Smart Account (counterfactual, deterministic) |
| Owner-of-deployed-contract | deployer EOA (passed as `initialOwner`) | deployer EOA (we pass same arg) |
| Gas per deploy | ~base × 1.0 | ~base × 1.3-1.5 (UserOp wrapper overhead) |
| Determinism | nonce-based → changes if anything else deploys from EOA first | **CREATE2-based** → bytecode + salt = stable address forever |
| Failure recovery | re-run with `--resume` | re-run script — already-deployed contracts are skipped via `getCode` probe |
| External deps | only forge + RPC | viem + permissionless + Pimlico API key |
| Tx in BaseScan | one tx per deploy, "From: deployer EOA" | one tx per UserOp, "From: Pimlico bundler EOA" + "To: EntryPoint" — actual deployer is the Smart Account in internal txs |

The CREATE2 determinism is the killer feature: **the same source code + same
salt namespace + same owner EOA → the same address on any EVM chain forever.**
We can predict addresses ahead of time and even deploy across multiple chains
to the same address (which is useful for cross-chain lookups).

---

## 4. When to use which

```
┌─────────────────────────────────────────────────────────────┐
│ "I'm deploying contracts to <chain> — what should I use?"   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
            ┌───────────────────────┐
            │ Local dev / anvil?    │  → forge script (free)
            └───────────────────────┘
                         │ no
                         ▼
            ┌───────────────────────┐
            │ Have ~$30 worth of    │  → forge script
            │ <chain native token>  │    (simplest path)
            │ in deployer EOA?      │
            └───────────────────────┘
                         │ no
                         ▼
            ┌───────────────────────┐
            │ Mainnet?              │  → CDP Paymaster
            │                       │    (~$25/mo free, then $99/mo)
            │                       │    or buy native token
            └───────────────────────┘
                         │ no (testnet)
                         ▼
            ┌───────────────────────┐
            │ Pimlico-sponsored     │  ← This document
            │ UserOp deploy         │
            └───────────────────────┘
```

---

## 5. The actual script — what it does

`contracts/script/deploy-via-pimlico.mts`:

1. Loads env from `.env.local` (Pimlico URL) and `contracts/.env` (deployer PK).
2. Creates a `publicClient` against `https://sepolia.base.org`.
3. Computes the Coinbase Smart Account counterfactual address from the owner EOA:
   ```ts
   const account = await toCoinbaseSmartAccount({
     client: publicClient,
     owners: [ownerEoa],
     version: '1.1',
   });
   ```
   This is deterministic — same EOA → same Smart Account address forever.
4. For each of 11 contracts (in dependency order):
   - Read the Foundry artifact `contracts/out/<Name>.sol/<Name>.json`.
   - Build `initCode = bytecode + abiEncode(constructorArgs)`.
   - Compute `salt = keccak256("cuvetsmo-web3:v1" + contractName)`.
   - Compute the predicted CREATE2 address.
   - If code already exists at the predicted address, **skip** (idempotent).
   - Otherwise build a UserOp:
     ```ts
     await bundlerClient.sendUserOperation({
       account: smartAccount,
       calls: [{ to: CREATE2_FACTORY, value: 0n, data: salt + initCode }],
       maxFeePerGas, maxPriorityFeePerGas, // from pimlicoClient.getUserOperationGasPrice()
     });
     ```
   - The bundler client has `paymaster: pimlicoPaymasterClient` attached →
     paymaster signs sponsorship automatically. We pay $0.
   - `waitForUserOperationReceipt` blocks until included.
   - Verify code now exists at the predicted address.
   - Write the address into `contracts/deployments/base-sepolia-pimlico.json`.
5. Print summary and BaseScan links.

Retry logic: 3 attempts with linear backoff (2s, 4s, 6s). On final failure
the script moves on so partial progress isn't lost — re-running will
resume because already-deployed contracts are skipped.

---

## 6. How to re-run

```bash
# From repo root
cd C:\Users\palmz\Desktop\cuvetsmo-web3

# Ensure env is set
#   .env.local        → must contain NEXT_PUBLIC_PIMLICO_BUNDLER_URL
#   contracts/.env    → must contain DEPLOYER_PRIVATE_KEY

# Run
npx tsx contracts/script/deploy-via-pimlico.mts
```

To deploy a fresh suite at a different set of addresses (e.g. for staging vs
production), bump the salt namespace inside the script:

```ts
const SALT_NAMESPACE = 'cuvetsmo-web3:v2';  // was v1
```

Same EOA, same bytecode, different namespace → 11 fresh CREATE2 addresses.

To **smoke-test** that the deployed addresses are wired correctly from the
frontend env vars:

```bash
npx tsx contracts/script/smoke-frontend-read.mts
```

This confirms (a) every `NEXT_PUBLIC_*_ADDRESS` resolves to an address with
runtime code, and (b) sample ABI reads decode properly.

---

## 7. Limitations & gotchas

1. **EntryPoint version.** Coinbase Smart Wallet ships with EntryPoint v0.6.
   If you switch to a different smart account (Safe, Kernel, MetaMask, etc.),
   it may use v0.7 or v0.8 and the bundler endpoint must match. Pimlico's
   `https://api.pimlico.io/v2/<chainId>/rpc` endpoint supports all three —
   just configure the right `entryPoint` arg when calling `createPimlicoClient`.
2. **Bytecode size limit (24 KB).** EIP-170 caps contract runtime code at
   `0x6000` (24 576) bytes. Our largest is `VetSBTCard` at 8 018 bytes — well
   under. If a future contract hits the cap, split into a proxy + library or
   use ERC-2535 diamonds. Pimlico has no extra limit on top of EIP-170.
3. **Salt collisions across reruns.** Same `SALT_NAMESPACE` + same contract
   name + same compiled bytecode = the same address. If you change a
   contract's source (even a comment) the bytecode changes → the predicted
   address moves → old address still holds the old code, new address holds
   the new code. To overwrite cleanly, change the salt namespace.
4. **Owner.** Every Ownable contract is owned by the **deployer EOA**, NOT
   the Smart Account. This is because we pass `ownerEoa.address` as the
   `initialOwner` constructor arg (matching the existing `Deploy.s.sol`
   behavior). The Smart Account is a passthrough — Palm can transfer
   ownership via plain `eth_sendTransaction` from his EOA.
5. **Smart Account first-op overhead.** The first UserOp for a given owner
   includes the Smart Account's own deployment code (~370 k gas). After that,
   subsequent UserOps just dispatch through it. We bake this into the first
   contract deploy's UserOp; Pimlico sponsors it all.
6. **Pimlico free-tier quotas reset daily**, not monthly, at 00:00 UTC. If
   you burn 100 ops in one rapid-fire run, you have to wait until next UTC
   day to send another. For 11 deploys this is moot, but for high-frequency
   testnet UserOps (e.g. continuous testing) consider upgrading.
7. **The script's `success: true` doesn't always mean code is at the
   predicted address immediately.** The chain may lag by 1-2 seconds after
   the receipt comes back. The script handles this with a 2s sleep + retry.

---

## 8. Alternate paymaster providers (if Pimlico is unavailable)

If Pimlico's free tier doesn't fit your case, here are equivalent providers
(all ERC-4337-compatible — drop-in replacement at the bundler URL):

| Provider | Free-tier (testnet) | Endpoint shape |
| --- | --- | --- |
| **Pimlico** (what we used) | 100 ops/day | `https://api.pimlico.io/v2/<chainId>/rpc?apikey=...` |
| **Coinbase CDP** | $25/mo testnet+mainnet credit | `https://api.developer.coinbase.com/rpc/v1/base/<projectId>` |
| **Stackup** | 100 ops/day | `https://public.stackup.sh/api/v1/node/base-sepolia` |
| **Alchemy AA** | Burns from $0/mo "free" tier RU credit | `https://base-sepolia.g.alchemy.com/v2/<key>` |
| **Biconomy** | Generous free tier | `https://bundler.biconomy.io/api/v3/<chainId>/<key>` |

Switching just changes `PIMLICO_URL` → the bundler endpoint, and replacing
`createPimlicoClient` → the provider's helper (or using viem's raw
`createBundlerClient` + `createPaymasterClient`).

---

## 9. Cost summary (this deploy run)

| Metric | Value |
| --- | --- |
| Contracts deployed | 11 |
| UserOps sent | 11 |
| Pimlico paymaster ops used | 11 of 100/day quota |
| Total gas units sponsored | ~10.8M |
| Wall-clock time | 57.6 s (~5s per UserOp) |
| **Cost to Palm's wallet** | **$0** |
| Cost to Pimlico | testnet ETH — effectively $0 |

Pimlico dashboard for verification: <https://dashboard.pimlico.io/>

---

## 10. Reproducing this for next year's cohort (Vet 87/88)

1. Generate a new deployer EOA: `cast wallet new` (or use any wallet).
2. Put the private key in `contracts/.env` as `DEPLOYER_PRIVATE_KEY`.
3. Sign up at <https://dashboard.pimlico.io>, create a project, copy the API key.
4. Put it in `.env.local` as `NEXT_PUBLIC_PIMLICO_BUNDLER_URL`:
   ```
   NEXT_PUBLIC_PIMLICO_BUNDLER_URL=https://api.pimlico.io/v2/84532/rpc?apikey=<your-key>
   ```
5. Compile contracts: `cd contracts && forge build`.
6. Deploy: `npx tsx contracts/script/deploy-via-pimlico.mts`.
7. The deployed addresses are written to `contracts/deployments/base-sepolia-pimlico.json` AND printed to stdout — paste them into `.env.local`.
8. Run `npx tsx contracts/script/smoke-frontend-read.mts` to confirm the frontend can read them.

**No ETH funding step.** That's the point of this whole pattern.

---

## 11. References

- [ERC-4337 spec — EntryPoint v0.6](https://eips.ethereum.org/EIPS/eip-4337)
- [Pimlico docs · bundler usage](https://docs.pimlico.io/references/bundler/usage)
- [Pimlico docs · paymaster](https://docs.pimlico.io/infra/paymaster)
- [permissionless.js · createPimlicoClient](https://docs.pimlico.io/permissionless)
- [viem · account-abstraction](https://viem.sh/account-abstraction)
- [Coinbase Smart Wallet](https://www.smartwallet.dev/)
- [Nick's CREATE2 factory (`0x4e59b44…`)](https://github.com/Arachnid/deterministic-deployment-proxy)
- [EIP-170 · contract size limit](https://eips.ethereum.org/EIPS/eip-170)
- Related: [`docs/MAINNET_FREE_PATH.md`](./MAINNET_FREE_PATH.md) — the
  parallel EAS+CDP path for mainnet at $0 deployer cost.
