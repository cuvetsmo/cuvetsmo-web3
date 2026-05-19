/**
 * Smoke test — confirm the frontend's lib/contracts.ts addresses resolve and
 * basic reads succeed via the public Base Sepolia RPC.
 *
 * Usage: npx tsx contracts/script/smoke-frontend-read.mts
 */
import path from 'node:path';
import dotenv from 'dotenv';
import { createPublicClient, http, type Address } from 'viem';
import { baseSepolia } from 'viem/chains';

const REPO_ROOT = path.resolve(import.meta.dirname, '..', '..');
dotenv.config({ path: path.join(REPO_ROOT, '.env.local') });

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || 'https://sepolia.base.org'),
});

const ENVS = {
  ORG_REGISTRY: process.env.NEXT_PUBLIC_ORG_REGISTRY_ADDRESS,
  VET_SBT_CARD: process.env.NEXT_PUBLIC_VET_SBT_CARD_ADDRESS,
  BADGE_REGISTRY: process.env.NEXT_PUBLIC_BADGE_REGISTRY_ADDRESS,
  TOKEN_IMPL: process.env.NEXT_PUBLIC_TOKEN_IMPL_ADDRESS,
  TOKEN_FACTORY: process.env.NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS,
  NFT_IMPL: process.env.NEXT_PUBLIC_NFT_IMPL_ADDRESS,
  NFT_FACTORY: process.env.NEXT_PUBLIC_NFT_FACTORY_ADDRESS,
  SBT_FACTORY: process.env.NEXT_PUBLIC_SBT_FACTORY_ADDRESS,
  GOVERNOR_FACTORY: process.env.NEXT_PUBLIC_GOVERNOR_FACTORY_ADDRESS,
  GUESTBOOK: process.env.NEXT_PUBLIC_GUESTBOOK_ADDRESS,
  FIRST_STEPS_SBT: process.env.NEXT_PUBLIC_FIRST_STEPS_SBT_ADDRESS,
};

console.log('Smoke testing contract reads from frontend env vars...\n');

let ok = 0;
let bad = 0;
for (const [name, addr] of Object.entries(ENVS)) {
  if (!addr) {
    console.log(`  ✗ ${name.padEnd(20)} (no env var set)`);
    bad++;
    continue;
  }
  const code = await client.getCode({ address: addr as Address });
  const sz = code ? (code.length - 2) / 2 : 0;
  if (sz > 0) {
    console.log(`  ✓ ${name.padEnd(20)} ${addr}  (${sz} bytes runtime)`);
    ok++;
  } else {
    console.log(`  ✗ ${name.padEnd(20)} ${addr}  (NO CODE)`);
    bad++;
  }
}

// Bonus: do an actual ABI call against the OrgRegistry to confirm decode works
console.log('\nABI-level read test:');
try {
  const owner = await client.readContract({
    address: ENVS.ORG_REGISTRY as Address,
    abi: [{ name: 'owner', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] }],
    functionName: 'owner',
  });
  console.log(`  OrgRegistry.owner() = ${owner}`);
} catch (e) {
  console.log('  OrgRegistry.owner() FAILED:', (e as Error).message);
  bad++;
}

try {
  const impl = await client.readContract({
    address: ENVS.TOKEN_FACTORY as Address,
    abi: [{ name: 'implementation', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] }],
    functionName: 'implementation',
  });
  console.log(`  TokenFactory.implementation() = ${impl}`);
  if (impl.toLowerCase() !== (ENVS.TOKEN_IMPL || '').toLowerCase()) {
    console.log('  ✗ MISMATCH with TOKEN_IMPL env var');
    bad++;
  }
} catch (e) {
  console.log('  TokenFactory.implementation() FAILED:', (e as Error).message);
  bad++;
}

console.log(`\nSmoke test: ${ok} good, ${bad} bad`);
if (bad > 0) process.exit(1);
