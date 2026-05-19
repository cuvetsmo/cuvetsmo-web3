/**
 * Pimlico-sponsored deploy script — deploys all 11 cuvetsmo-web3 contracts
 * to Base Sepolia via Coinbase Smart Account + ERC-4337 UserOps + Pimlico
 * Verifying Paymaster.
 *
 * Cost to deployer EOA: $0 (Pimlico paymaster sponsors all gas).
 * Cost to Pimlico: ~1.1k gas units × 11 ops on testnet — free tier covers it.
 *
 * Usage (from repo root):
 *   npx tsx contracts/script/deploy-via-pimlico.mts
 *
 * The script auto-loads env from .env.local (Pimlico URL) AND
 * contracts/.env (deployer private key) — no manual copy needed.
 *
 * Re-runs are safe: addresses are deterministic via CREATE2, so the same
 * deployer + same salt-namespace → same contract addresses. If a contract
 * is already deployed at the predicted address, the script skips the
 * UserOp entirely.
 *
 * See docs/PIMLICO_SPONSORED_DEPLOY.md for the architectural walkthrough.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

// Load env from BOTH locations (repo .env.local has Pimlico URL; contracts/.env has deployer PK)
const REPO_ROOT = path.resolve(import.meta.dirname, '..', '..');
dotenv.config({ path: path.join(REPO_ROOT, '.env.local') });
dotenv.config({ path: path.join(REPO_ROOT, 'contracts', '.env') });
import {
  createPublicClient,
  http,
  encodePacked,
  encodeAbiParameters,
  keccak256,
  getAddress,
  type Hex,
  type Address,
  type AbiParameter,
} from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import {
  toCoinbaseSmartAccount,
  createBundlerClient,
  createPaymasterClient,
  entryPoint06Address,
} from 'viem/account-abstraction';
import { createPimlicoClient } from 'permissionless/clients/pimlico';

// ───────────────────────────────────────────────────────────────────────────
// Configuration
// ───────────────────────────────────────────────────────────────────────────

const PIMLICO_URL = process.env.NEXT_PUBLIC_PIMLICO_BUNDLER_URL;
const DEPLOYER_PK = process.env.DEPLOYER_PRIVATE_KEY as Hex | undefined;

if (!PIMLICO_URL) throw new Error('NEXT_PUBLIC_PIMLICO_BUNDLER_URL missing in env');
if (!DEPLOYER_PK) throw new Error('DEPLOYER_PRIVATE_KEY missing in env (load from contracts/.env)');

// Nick's deterministic CREATE2 factory — universal across EVM chains
const CREATE2_FACTORY: Address = '0x4e59b44847b379578588920cA78FbF26c0B4956C';

// Salt namespace — same script + same owner = same addresses. Bump version
// to force a fresh deploy run with new addresses (useful for staging vs prod).
const SALT_NAMESPACE = 'cuvetsmo-web3:v1';

const CONTRACTS_DIR = path.resolve(import.meta.dirname, '..');
const DEPLOYMENTS_FILE = path.join(CONTRACTS_DIR, 'deployments', 'base-sepolia-pimlico.json');

// ───────────────────────────────────────────────────────────────────────────
// Deployment plan (ordered — factories follow their implementations)
// ───────────────────────────────────────────────────────────────────────────

type CtorInput = { type: string; refersTo?: string };
type Step = {
  /** Camel-case key written to the JSON output. */
  key: string;
  /** Solidity contract name (file & contract). */
  name: string;
  /** Constructor inputs. If `refersTo` is set, the value is the address
   *  deployed in an earlier step. Otherwise it's filled from `deployerOwner`. */
  ctor: CtorInput[];
};

const PLAN: Step[] = [
  { key: 'orgRegistry',     name: 'OrgRegistry',         ctor: [{ type: 'address' }] }, // initialOwner
  { key: 'vetSbtCard',      name: 'VetSBTCard',          ctor: [{ type: 'address' }] },
  { key: 'badgeRegistry',   name: 'BadgeRegistry',       ctor: [{ type: 'address' }] },
  { key: 'firstStepsSbt',   name: 'FirstStepsSBT',       ctor: [] },
  { key: 'guestbook',       name: 'Guestbook',           ctor: [] },
  { key: 'tokenImpl',       name: 'TokenImplementation', ctor: [] },
  { key: 'tokenFactory',    name: 'TokenFactory',        ctor: [{ type: 'address', refersTo: 'tokenImpl' }] },
  { key: 'nftImpl',         name: 'NFTImplementation',   ctor: [] },
  { key: 'nftFactory',      name: 'NFTFactory',          ctor: [{ type: 'address', refersTo: 'nftImpl' }] },
  { key: 'sbtFactory',      name: 'SBTFactory',          ctor: [{ type: 'address', refersTo: 'nftImpl' }] },
  { key: 'governorFactory', name: 'GovernorFactory',     ctor: [] },
];

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────

function loadInitBytecode(name: string): Hex {
  const p = path.join(CONTRACTS_DIR, 'out', `${name}.sol`, `${name}.json`);
  const j = JSON.parse(readFileSync(p, 'utf8'));
  return j.bytecode.object as Hex;
}

function buildInitCode(name: string, ctorArgs: { type: string; value: unknown }[]): Hex {
  const bytecode = loadInitBytecode(name);
  if (ctorArgs.length === 0) return bytecode;
  const encoded = encodeAbiParameters(
    ctorArgs.map((a) => ({ type: a.type } as AbiParameter)),
    ctorArgs.map((a) => a.value),
  );
  return (bytecode + encoded.slice(2)) as Hex;
}

function makeSalt(step: Step): Hex {
  return keccak256(
    encodePacked(['string', 'string'], [SALT_NAMESPACE, step.name]),
  );
}

function predictCreate2Address(salt: Hex, initCode: Hex): Address {
  const initCodeHash = keccak256(initCode);
  const packed = encodePacked(
    ['bytes1', 'address', 'bytes32', 'bytes32'],
    ['0xff', CREATE2_FACTORY, salt, initCodeHash],
  );
  const hash = keccak256(packed);
  return getAddress(`0x${hash.slice(-40)}`);
}

function loadExistingDeployments(): Record<string, string> {
  if (!existsSync(DEPLOYMENTS_FILE)) return {};
  try {
    return JSON.parse(readFileSync(DEPLOYMENTS_FILE, 'utf8')) as Record<string, string>;
  } catch {
    return {};
  }
}

function saveDeployments(record: Record<string, string>) {
  mkdirSync(path.dirname(DEPLOYMENTS_FILE), { recursive: true });
  writeFileSync(DEPLOYMENTS_FILE, JSON.stringify(record, null, 2) + '\n', 'utf8');
}

async function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

// ───────────────────────────────────────────────────────────────────────────
// Main
// ───────────────────────────────────────────────────────────────────────────

console.log('═══════════════════════════════════════════════════════════');
console.log('  cuvetsmo-web3 · Pimlico-sponsored deploy → Base Sepolia');
console.log('═══════════════════════════════════════════════════════════');

const ownerEoa = privateKeyToAccount(DEPLOYER_PK);
console.log('Deployer EOA      :', ownerEoa.address);
console.log('Salt namespace    :', SALT_NAMESPACE);
console.log('CREATE2 factory   :', CREATE2_FACTORY);
console.log('Bundler endpoint  :', PIMLICO_URL.replace(/apikey=[^&]+/, 'apikey=***'));

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || 'https://sepolia.base.org'),
});

const smartAccount = await toCoinbaseSmartAccount({
  client: publicClient,
  owners: [ownerEoa],
  version: '1.1',
});

const smartAccountAddr = await smartAccount.getAddress();
console.log('Smart Account     :', smartAccountAddr);

const smartCode = await publicClient.getCode({ address: smartAccountAddr });
console.log('Smart Acct status :', smartCode && smartCode !== '0x' ? 'already deployed' : 'will deploy on first UserOp');

const bundlerClient = createBundlerClient({
  account: smartAccount,
  client: publicClient,
  transport: http(PIMLICO_URL),
  paymaster: createPaymasterClient({ transport: http(PIMLICO_URL) }),
});

const pimlicoClient = createPimlicoClient({
  transport: http(PIMLICO_URL),
  entryPoint: {
    address: entryPoint06Address,
    version: '0.6',
  },
});

// Load any existing deployment record (lets us resume partial runs)
const existing = loadExistingDeployments();
const deployed: Record<string, string> = { ...existing };

// Save metadata (overwrites old metadata too — that's fine)
deployed._note = 'Deployed via Pimlico-sponsored UserOps. See docs/PIMLICO_SPONSORED_DEPLOY.md';
deployed._chainId = '84532';
deployed._deployerEoa = ownerEoa.address;
deployed._smartAccount = smartAccountAddr;
deployed._saltNamespace = SALT_NAMESPACE;
deployed._create2Factory = CREATE2_FACTORY;
saveDeployments(deployed);

const startedAt = Date.now();
const userOps: { name: string; userOpHash: Hex; txHash: Hex; address: Address; gasUsed: bigint }[] = [];

let succeeded = 0;
let skipped = 0;
let failed = 0;

for (const step of PLAN) {
  console.log('');
  console.log('───────────────────────────────────────────────────────────');
  console.log(`▸ ${step.name} (${step.key})`);

  // Resolve constructor args
  const ctorArgs = step.ctor.map((input) => {
    if (input.refersTo) {
      const dep = deployed[input.refersTo];
      if (!dep) throw new Error(`Cannot deploy ${step.name}: dependency ${input.refersTo} not yet deployed`);
      return { type: input.type, value: dep as Address };
    }
    // Default: address-type ctor input = the deployer EOA (matches forge script semantics)
    if (input.type === 'address') return { type: input.type, value: ownerEoa.address };
    throw new Error(`Unhandled ctor input type ${input.type} for ${step.name}`);
  });

  const initCode = buildInitCode(step.name, ctorArgs);
  const salt = makeSalt(step);
  const predicted = predictCreate2Address(salt, initCode);
  console.log('  init code bytes :', (initCode.length - 2) / 2);
  console.log('  predicted addr  :', predicted);

  // Skip if already deployed at predicted address
  const code = await publicClient.getCode({ address: predicted });
  if (code && code !== '0x') {
    console.log('  ✓ Already deployed — skipping');
    deployed[step.key] = predicted;
    saveDeployments(deployed);
    skipped++;
    continue;
  }

  // Build the CREATE2 factory call data: salt (32 bytes) ++ init code
  const factoryCallData = (salt + initCode.slice(2)) as Hex;

  // Get current Pimlico gas prices
  const gasPrice = await pimlicoClient.getUserOperationGasPrice();

  // Retry loop with exponential backoff
  let attempt = 0;
  const maxAttempts = 3;
  let success = false;
  while (attempt < maxAttempts && !success) {
    attempt++;
    try {
      console.log(`  → sending UserOp (attempt ${attempt}/${maxAttempts})...`);
      const userOpHash = await bundlerClient.sendUserOperation({
        account: smartAccount,
        calls: [
          {
            to: CREATE2_FACTORY,
            value: 0n,
            data: factoryCallData,
          },
        ],
        maxFeePerGas: gasPrice.fast.maxFeePerGas,
        maxPriorityFeePerGas: gasPrice.fast.maxPriorityFeePerGas,
      });

      console.log('  userOpHash      :', userOpHash);
      const receipt = await bundlerClient.waitForUserOperationReceipt({ hash: userOpHash });
      console.log('  txHash          :', receipt.receipt.transactionHash);
      console.log('  gas used        :', receipt.actualGasUsed?.toString());
      console.log('  paymaster       :', receipt.paymaster);

      if (!receipt.success) throw new Error('UserOp reverted on chain');

      // Verify the contract is now at the predicted address
      const codeAfter = await publicClient.getCode({ address: predicted });
      if (!codeAfter || codeAfter === '0x') {
        // The chain may be slightly behind — retry getCode after short delay
        await sleep(2000);
        const retryCode = await publicClient.getCode({ address: predicted });
        if (!retryCode || retryCode === '0x') {
          throw new Error(`No code at predicted address ${predicted} after deploy — CREATE2 may have reverted silently`);
        }
      }

      console.log('  ✓ Deployed      :', predicted);
      deployed[step.key] = predicted;
      saveDeployments(deployed);

      userOps.push({
        name: step.name,
        userOpHash,
        txHash: receipt.receipt.transactionHash,
        address: predicted,
        gasUsed: receipt.actualGasUsed ?? 0n,
      });
      succeeded++;
      success = true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`  ✗ Attempt ${attempt} failed:`, msg.split('\n')[0].slice(0, 200));
      if (attempt < maxAttempts) {
        const backoff = 2000 * attempt;
        console.log(`  ↻ Retrying in ${backoff}ms...`);
        await sleep(backoff);
      } else {
        console.log('  ✗ All attempts failed — moving on (re-run script to retry)');
        failed++;
      }
    }
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Summary
// ───────────────────────────────────────────────────────────────────────────

const elapsedMs = Date.now() - startedAt;
console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('  Deployment summary');
console.log('═══════════════════════════════════════════════════════════');
console.log(`  Succeeded : ${succeeded}`);
console.log(`  Skipped   : ${skipped} (already deployed at predicted address)`);
console.log(`  Failed    : ${failed}`);
console.log(`  Total time: ${(elapsedMs / 1000).toFixed(1)}s`);
console.log(`  UserOps sent this run: ${userOps.length}`);
console.log('');

if (userOps.length > 0) {
  const totalGas = userOps.reduce((sum, op) => sum + op.gasUsed, 0n);
  console.log('  Gas summary:');
  console.log(`    Total gas units sponsored by Pimlico: ${totalGas.toString()}`);
  console.log(`    Cost to deployer EOA: 0 ETH (sponsored)`);
  console.log('');
  console.log('  Pimlico dashboard: https://dashboard.pimlico.io/');
  console.log('');
}

console.log('  Addresses written to:');
console.log('   ', DEPLOYMENTS_FILE);
console.log('');

console.log('  Verify on BaseScan:');
for (const [k, v] of Object.entries(deployed)) {
  if (k.startsWith('_')) continue;
  console.log(`    ${k.padEnd(16)} https://sepolia.basescan.org/address/${v}`);
}
console.log('');

if (failed > 0) {
  console.log('  ✗ Some deployments failed. Re-run this script — it will skip the already-deployed ones.');
  process.exit(1);
}

console.log('  ✓ All done. Next: update .env.local with the NEXT_PUBLIC_*_ADDRESS values above.');
