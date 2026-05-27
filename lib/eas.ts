/**
 * EAS (Ethereum Attestation Service) integration for CUVETSMO Web3
 *
 * Wave 2F · Free Base mainnet path. Instead of deploying our own SBT/Badge/
 * Guestbook contracts on Base mainnet (~$10-50 in gas + ongoing per-mint cost),
 * we attest credentials via EAS — already audited and deployed on Base mainnet.
 *
 * EAS contract addresses on Base mainnet (verified · same as Base Sepolia):
 *   - EAS: 0x4200000000000000000000000000000000000021
 *   - SchemaRegistry: 0x4200000000000000000000000000000000000020
 *
 * Three schemas we will register (one-time, ~$0.50 each via CDP-sponsored gas):
 *   - VET_CARD   — identity credential (year admitted, student ID hash, faculty)
 *   - BADGE      — achievement credential (badge id + metadata URI)
 *   - GUESTBOOK  — immutable on-chain message
 *
 * Each attestation costs ~$0.10 in Base mainnet gas (sponsored via CDP Paymaster
 * in our flow, so $0 to end-users).
 *
 * Docs: https://docs.attest.org/
 * SDK:  @ethereum-attestation-service/eas-sdk (uses ethers v6)
 */

import {
  EAS,
  SchemaEncoder,
  SchemaRegistry,
  type Attestation,
  type SchemaItem,
} from "@ethereum-attestation-service/eas-sdk";
import {
  BrowserProvider,
  JsonRpcProvider,
  type Eip1193Provider,
  type Signer,
} from "ethers";

// ──────────────────────────────────────────────────────────────────────
// Addresses
// ──────────────────────────────────────────────────────────────────────

/** EAS contract address on Base mainnet (and Base Sepolia — same). */
export const EAS_CONTRACT_ADDRESS =
  "0x4200000000000000000000000000000000000021" as const;

/** SchemaRegistry contract address on Base mainnet. */
export const SCHEMA_REGISTRY_ADDRESS =
  "0x4200000000000000000000000000000000000020" as const;

/** Base mainnet block explorer for EAS attestations. */
export const EAS_EXPLORER_BASE = "https://base.easscan.org" as const;

/** EAS explorer for Base Sepolia. */
export const EAS_EXPLORER_BASE_SEPOLIA = "https://base-sepolia.easscan.org" as const;

/** Chain ids. */
export const CHAIN_IDS = {
  BASE: 8453,
  BASE_SEPOLIA: 84532,
} as const;

export type EasNetwork = "base" | "base-sepolia";

export function easExplorerForNetwork(network: EasNetwork): string {
  return network === "base" ? EAS_EXPLORER_BASE : EAS_EXPLORER_BASE_SEPOLIA;
}

export function defaultRpcForNetwork(network: EasNetwork): string {
  if (network === "base") {
    return process.env.NEXT_PUBLIC_BASE_RPC || "https://mainnet.base.org";
  }
  return (
    process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "https://sepolia.base.org"
  );
}

// ──────────────────────────────────────────────────────────────────────
// Schemas
// ──────────────────────────────────────────────────────────────────────

/**
 * Schema definitions for CUVETSMO Web3.
 *
 * UIDs are deterministic — computed from (schema + resolver + revocable) — so
 * once a schema is registered on Base mainnet by anyone, the UID is fixed.
 *
 * For the free mainnet path we leave UIDs empty until first registration
 * (see `app/api/eas/schemas/route.ts`). Once Palm runs the one-time
 * registration via CDP-sponsored gas, the UIDs get pasted into env vars:
 *   NEXT_PUBLIC_EAS_SCHEMA_VET_CARD
 *   NEXT_PUBLIC_EAS_SCHEMA_BADGE
 *   NEXT_PUBLIC_EAS_SCHEMA_GUESTBOOK
 */
export const SCHEMAS = {
  /** Vet SBT Card — identity credential. */
  VET_CARD: {
    name: "VET_CARD" as const,
    label: "Vet SBT Card",
    schema:
      "uint16 yearAdmitted, bytes32 studentIdHash, uint8 facultyCode, uint8 departmentCode",
    revocable: true,
    uid: validateSchemaUid(
      process.env.NEXT_PUBLIC_EAS_SCHEMA_VET_CARD,
      "VET_CARD",
    ),
  },
  /** Achievement Badge — per-quest credential. */
  BADGE: {
    name: "BADGE" as const,
    label: "Achievement Badge",
    schema: "string badgeId, string metadataURI, uint64 awardedAt",
    revocable: true,
    uid: validateSchemaUid(
      process.env.NEXT_PUBLIC_EAS_SCHEMA_BADGE,
      "BADGE",
    ),
  },
  /** Guestbook — immutable message. */
  GUESTBOOK: {
    name: "GUESTBOOK" as const,
    label: "Guestbook Message",
    schema: "string message",
    revocable: false,
    uid: validateSchemaUid(
      process.env.NEXT_PUBLIC_EAS_SCHEMA_GUESTBOOK,
      "GUESTBOOK",
    ),
  },
} as const;

export type SchemaName = keyof typeof SCHEMAS;

/**
 * Validate a schema UID at module boot. Returns the UID unchanged when
 * format is valid, or an empty string (with a console.warn) when invalid.
 *
 * Catches the "Palm pasted a wrong UID into .env.local" failure mode at
 * boot instead of letting it surface as cryptic EAS calldata errors later.
 *
 * Expected shape: `0x` + 64 lowercase hex characters (32-byte digest).
 */
export function validateSchemaUid(
  uid: string | undefined,
  name: string,
): `0x${string}` {
  if (!uid) return "" as `0x${string}`;
  if (!/^0x[a-fA-F0-9]{64}$/.test(uid)) {
    if (typeof window !== "undefined" || process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(
        `[EAS] schema "${name}" UID "${uid.slice(0, 12)}…" is not a valid 32-byte hex string; ignoring.`,
      );
    }
    return "" as `0x${string}`;
  }
  return uid as `0x${string}`;
}

/** True when all three schemas have UIDs configured. */
export function schemasReady(): boolean {
  return (
    !!SCHEMAS.VET_CARD.uid &&
    !!SCHEMAS.BADGE.uid &&
    !!SCHEMAS.GUESTBOOK.uid
  );
}

/** Returns the schema config for a given schema name. */
export function getSchema(name: SchemaName) {
  return SCHEMAS[name];
}

// ──────────────────────────────────────────────────────────────────────
// Client construction
// ──────────────────────────────────────────────────────────────────────

/**
 * Construct a read-only EAS client connected to the given network's public
 * RPC. Free — read calls never cost gas.
 */
export function getReadOnlyEas(network: EasNetwork = "base"): EAS {
  const provider = new JsonRpcProvider(defaultRpcForNetwork(network));
  const eas = new EAS(EAS_CONTRACT_ADDRESS);
  eas.connect(provider);
  return eas;
}

/**
 * Construct a read-only SchemaRegistry client for the given network.
 */
export function getReadOnlyRegistry(
  network: EasNetwork = "base",
): SchemaRegistry {
  const provider = new JsonRpcProvider(defaultRpcForNetwork(network));
  const reg = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS);
  reg.connect(provider);
  return reg;
}

/**
 * Construct a write-enabled EAS client using a browser EIP-1193 provider
 * (e.g. window.ethereum, Privy embedded wallet, Coinbase Smart Wallet).
 *
 * Pass the EIP-1193 provider directly — we wrap it with ethers BrowserProvider.
 */
export async function getWriteEas(eip1193: Eip1193Provider): Promise<{
  eas: EAS;
  signer: Signer;
}> {
  const provider = new BrowserProvider(eip1193);
  const signer = await provider.getSigner();
  const eas = new EAS(EAS_CONTRACT_ADDRESS);
  eas.connect(signer);
  return { eas, signer };
}

// ──────────────────────────────────────────────────────────────────────
// Encoders
// ──────────────────────────────────────────────────────────────────────

export interface VetCardData {
  yearAdmitted: number; // e.g. 2021 for Vet 81
  studentIdHash: `0x${string}`; // keccak256 of student id, 32 bytes
  facultyCode: number; // u8 — Vet = 1, etc.
  departmentCode: number; // u8
}

export interface BadgeData {
  badgeId: string; // slug, e.g. "first-tx"
  metadataURI: string; // ipfs://... or https://...
  awardedAt: number; // unix seconds
}

export interface GuestbookData {
  message: string;
}

export function encodeVetCard(data: VetCardData): string {
  const enc = new SchemaEncoder(SCHEMAS.VET_CARD.schema);
  const items: SchemaItem[] = [
    { name: "yearAdmitted", type: "uint16", value: data.yearAdmitted },
    { name: "studentIdHash", type: "bytes32", value: data.studentIdHash },
    { name: "facultyCode", type: "uint8", value: data.facultyCode },
    { name: "departmentCode", type: "uint8", value: data.departmentCode },
  ];
  return enc.encodeData(items);
}

export function encodeBadge(data: BadgeData): string {
  const enc = new SchemaEncoder(SCHEMAS.BADGE.schema);
  const items: SchemaItem[] = [
    { name: "badgeId", type: "string", value: data.badgeId },
    { name: "metadataURI", type: "string", value: data.metadataURI },
    { name: "awardedAt", type: "uint64", value: data.awardedAt },
  ];
  return enc.encodeData(items);
}

export function encodeGuestbook(data: GuestbookData): string {
  const enc = new SchemaEncoder(SCHEMAS.GUESTBOOK.schema);
  const items: SchemaItem[] = [
    { name: "message", type: "string", value: data.message },
  ];
  return enc.encodeData(items);
}

// ──────────────────────────────────────────────────────────────────────
// Decoders
// ──────────────────────────────────────────────────────────────────────

export interface DecodedItem {
  name: string;
  type: string;
  value: unknown;
}

/**
 * Decode raw attestation data into a `{ name, type, value }[]` array.
 * Use the schema string from `SCHEMAS[<name>].schema` as the second arg.
 */
export function decodeData(schema: string, data: string): DecodedItem[] {
  if (!data || data === "0x") return [];
  const enc = new SchemaEncoder(schema);
  const raw = enc.decodeData(data);
  return raw.map((item) => ({
    name: item.name,
    type: item.type,
    value: item.value.value as unknown,
  }));
}

// ──────────────────────────────────────────────────────────────────────
// Write helpers
// ──────────────────────────────────────────────────────────────────────

export interface AttestArgs {
  /** Where to credit the attestation — the recipient address. */
  recipient: `0x${string}`;
  /** EIP-1193 provider (Privy wallet, Coinbase Smart Wallet, MetaMask, etc.) */
  signer: Eip1193Provider;
  /** Optional expiration in unix seconds. 0 (default) = never expires. */
  expirationTime?: bigint;
}

/**
 * Attest a Vet SBT Card to `recipient`.
 *
 * Returns the on-chain attestation UID (32-byte hex). The transaction is
 * paid by `signer` — wrap with CDP Paymaster (lib/cdp.ts) to make it free
 * for the user.
 */
export async function attestVetCard(
  args: AttestArgs & { data: VetCardData },
): Promise<{ uid: string; txHash: string }> {
  const schemaUid = SCHEMAS.VET_CARD.uid;
  if (!schemaUid) {
    throw new Error(
      "VET_CARD schema not yet registered on this network. Register first via /api/eas/schemas.",
    );
  }
  const { eas } = await getWriteEas(args.signer);
  const tx = await eas.attest({
    schema: schemaUid,
    data: {
      recipient: args.recipient,
      expirationTime: args.expirationTime ?? 0n,
      revocable: SCHEMAS.VET_CARD.revocable,
      refUID:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      data: encodeVetCard(args.data),
      value: 0n,
    },
  });
  // EAS SDK v2.9 Transaction<T>: `receipt` is populated AFTER `wait()`
  // resolves (see node_modules/.../eas-sdk/dist/lib.esm/transaction.d.ts).
  // Earlier sessions assumed a `.tx.hash` shortcut — that doesn't exist on
  // this SDK version. Read receipt.hash post-wait instead.
  const uid = await tx.wait();
  const txHash = tx.receipt?.hash ?? "";
  return { uid, txHash };
}

/**
 * Attest an Achievement Badge to `recipient`.
 */
export async function attestBadge(
  args: AttestArgs & { data: BadgeData },
): Promise<{ uid: string; txHash: string }> {
  const schemaUid = SCHEMAS.BADGE.uid;
  if (!schemaUid) {
    throw new Error("BADGE schema not yet registered on this network.");
  }
  const { eas } = await getWriteEas(args.signer);
  const tx = await eas.attest({
    schema: schemaUid,
    data: {
      recipient: args.recipient,
      expirationTime: args.expirationTime ?? 0n,
      revocable: SCHEMAS.BADGE.revocable,
      refUID:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      data: encodeBadge(args.data),
      value: 0n,
    },
  });
  // EAS SDK v2.9 Transaction<T>: `receipt` is populated AFTER `wait()`
  // resolves (see node_modules/.../eas-sdk/dist/lib.esm/transaction.d.ts).
  // Earlier sessions assumed a `.tx.hash` shortcut — that doesn't exist on
  // this SDK version. Read receipt.hash post-wait instead.
  const uid = await tx.wait();
  const txHash = tx.receipt?.hash ?? "";
  return { uid, txHash };
}

/**
 * Attest a Guestbook message — immutable, no revocation.
 *
 * Note: the recipient field on a guestbook is the author themselves
 * (so attestations show up in their profile). Caller passes their own
 * connected address as `recipient`.
 */
export async function attestGuestbookMessage(
  args: AttestArgs & { data: GuestbookData },
): Promise<{ uid: string; txHash: string }> {
  const schemaUid = SCHEMAS.GUESTBOOK.uid;
  if (!schemaUid) {
    throw new Error("GUESTBOOK schema not yet registered on this network.");
  }
  const { eas } = await getWriteEas(args.signer);
  const tx = await eas.attest({
    schema: schemaUid,
    data: {
      recipient: args.recipient,
      expirationTime: args.expirationTime ?? 0n,
      revocable: false,
      refUID:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      data: encodeGuestbook(args.data),
      value: 0n,
    },
  });
  // EAS SDK v2.9 Transaction<T>: `receipt` is populated AFTER `wait()`
  // resolves (see node_modules/.../eas-sdk/dist/lib.esm/transaction.d.ts).
  // Earlier sessions assumed a `.tx.hash` shortcut — that doesn't exist on
  // this SDK version. Read receipt.hash post-wait instead.
  const uid = await tx.wait();
  const txHash = tx.receipt?.hash ?? "";
  return { uid, txHash };
}

// ──────────────────────────────────────────────────────────────────────
// Read helpers
// ──────────────────────────────────────────────────────────────────────

/**
 * Fetch a single attestation by UID.
 */
export async function getAttestation(
  uid: string,
  network: EasNetwork = "base",
): Promise<Attestation> {
  const eas = getReadOnlyEas(network);
  return eas.getAttestation(uid);
}

/**
 * Check whether an attestation is currently valid (exists AND not revoked).
 */
export async function isAttestationValid(
  uid: string,
  network: EasNetwork = "base",
): Promise<boolean> {
  const eas = getReadOnlyEas(network);
  return eas.isAttestationValid(uid);
}

/**
 * Fetch attestations by recipient address.
 *
 * Note: the EAS contract itself doesn't expose a "list by recipient" call —
 * it's an index-by-UID lookup table. To list, you use either:
 *   1. The EAS GraphQL indexer (recommended) — free, fast, ~100ms p50
 *      Base mainnet: https://base.easscan.org/graphql
 *      Base Sepolia: https://base-sepolia.easscan.org/graphql
 *   2. Direct event log scan via eth_getLogs — slow, RPC-heavy
 *
 * We use the GraphQL indexer.
 */
export async function getAttestationsByRecipient(
  recipient: `0x${string}`,
  options: {
    schemaUid?: string;
    network?: EasNetwork;
    limit?: number;
  } = {},
): Promise<Attestation[]> {
  const { schemaUid, network = "base", limit = 50 } = options;
  const endpoint =
    network === "base"
      ? "https://base.easscan.org/graphql"
      : "https://base-sepolia.easscan.org/graphql";

  // EAS GraphQL: Prisma-style filters.
  const where: Record<string, unknown> = {
    recipient: { equals: recipient },
    revoked: { equals: false },
  };
  if (schemaUid) where.schemaId = { equals: schemaUid };

  const query = `
    query AttestationsByRecipient($where: AttestationWhereInput, $take: Int) {
      attestations(where: $where, take: $take, orderBy: { time: desc }) {
        id
        schemaId
        attester
        recipient
        revocable
        revoked
        time
        expirationTime
        revocationTime
        refUID
        data
      }
    }
  `;

  // Abort easscan.org calls after 10s so an indexer outage doesn't hang
  // the calling component indefinitely (e.g. profile/board pages).
  const abort = new AbortController();
  const timeoutId = setTimeout(() => abort.abort(), 10_000);
  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { where, take: limit } }),
      signal: abort.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(`EAS GraphQL timeout after 10s on ${endpoint}`);
    }
    throw err;
  }
  clearTimeout(timeoutId);
  if (!res.ok) {
    throw new Error(`EAS GraphQL ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as {
    data?: {
      attestations?: Array<{
        id: string;
        schemaId: string;
        attester: string;
        recipient: string;
        revocable: boolean;
        revoked: boolean;
        time: string;
        expirationTime: string;
        revocationTime: string;
        refUID: string;
        data: string;
      }>;
    };
    errors?: Array<{ message: string }>;
  };
  if (json.errors?.length) {
    throw new Error(`EAS GraphQL error: ${json.errors[0].message}`);
  }
  const items = json.data?.attestations ?? [];
  return items.map((a) => ({
    uid: a.id,
    schema: a.schemaId,
    refUID: a.refUID,
    time: BigInt(a.time),
    expirationTime: BigInt(a.expirationTime),
    revocationTime: BigInt(a.revocationTime),
    recipient: a.recipient,
    revocable: a.revocable,
    attester: a.attester,
    data: a.data,
  }));
}

/**
 * Fetch attestations by schema UID. Used to list guestbook messages,
 * all badges, etc.
 */
export async function getAttestationsBySchema(
  schemaUid: string,
  options: {
    network?: EasNetwork;
    limit?: number;
    attester?: `0x${string}`;
  } = {},
): Promise<Attestation[]> {
  const { network = "base", limit = 50, attester } = options;
  const endpoint =
    network === "base"
      ? "https://base.easscan.org/graphql"
      : "https://base-sepolia.easscan.org/graphql";

  const where: Record<string, unknown> = {
    schemaId: { equals: schemaUid },
    revoked: { equals: false },
  };
  if (attester) where.attester = { equals: attester };

  const query = `
    query AttestationsBySchema($where: AttestationWhereInput, $take: Int) {
      attestations(where: $where, take: $take, orderBy: { time: desc }) {
        id
        schemaId
        attester
        recipient
        revocable
        revoked
        time
        expirationTime
        revocationTime
        refUID
        data
      }
    }
  `;

  // Abort easscan.org calls after 10s so an indexer outage doesn't hang
  // the calling component indefinitely (e.g. profile/board pages).
  const abort = new AbortController();
  const timeoutId = setTimeout(() => abort.abort(), 10_000);
  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { where, take: limit } }),
      signal: abort.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(`EAS GraphQL timeout after 10s on ${endpoint}`);
    }
    throw err;
  }
  clearTimeout(timeoutId);
  if (!res.ok) {
    throw new Error(`EAS GraphQL ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as {
    data?: {
      attestations?: Array<{
        id: string;
        schemaId: string;
        attester: string;
        recipient: string;
        revocable: boolean;
        revoked: boolean;
        time: string;
        expirationTime: string;
        revocationTime: string;
        refUID: string;
        data: string;
      }>;
    };
    errors?: Array<{ message: string }>;
  };
  if (json.errors?.length) {
    throw new Error(`EAS GraphQL error: ${json.errors[0].message}`);
  }
  const items = json.data?.attestations ?? [];
  return items.map((a) => ({
    uid: a.id,
    schema: a.schemaId,
    refUID: a.refUID,
    time: BigInt(a.time),
    expirationTime: BigInt(a.expirationTime),
    revocationTime: BigInt(a.revocationTime),
    recipient: a.recipient,
    revocable: a.revocable,
    attester: a.attester,
    data: a.data,
  }));
}

// ──────────────────────────────────────────────────────────────────────
// Schema registry helpers
// ──────────────────────────────────────────────────────────────────────

/**
 * Compute the deterministic schema UID for a given (schema, resolver, revocable)
 * tuple — same value the SchemaRegistry contract uses when registering.
 *
 * Use this to predict the UID before registration, or to look up an existing
 * schema you suspect someone has already registered with the same shape.
 */
export function computeSchemaUid(
  schema: string,
  resolverAddress: string = "0x0000000000000000000000000000000000000000",
  revocable: boolean = true,
): string {
  return SchemaRegistry.getSchemaUID(schema, resolverAddress, revocable);
}

/**
 * Look up a schema by UID on a given network. Returns null if not registered.
 */
export async function getSchemaRecord(
  uid: string,
  network: EasNetwork = "base",
): Promise<{
  uid: string;
  schema: string;
  resolver: string;
  revocable: boolean;
} | null> {
  try {
    const reg = getReadOnlyRegistry(network);
    const rec = await reg.getSchema({ uid });
    if (!rec || !rec.schema) return null;
    return {
      uid: rec.uid,
      schema: rec.schema,
      resolver: rec.resolver,
      revocable: rec.revocable,
    };
  } catch {
    return null;
  }
}

/**
 * Register a schema on-chain — requires a signer with gas.
 *
 * Day-1 use: server-side admin wallet OR CDP-sponsored userOp.
 * Cost: ~$0.50 on Base mainnet per schema (one-time).
 */
export async function registerSchema(
  name: SchemaName,
  signer: Eip1193Provider,
): Promise<{ uid: string; txHash: string }> {
  const schema = SCHEMAS[name];
  const provider = new BrowserProvider(signer);
  const ethSigner = await provider.getSigner();
  const reg = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS);
  reg.connect(ethSigner);
  const tx = await reg.register({
    schema: schema.schema,
    revocable: schema.revocable,
  });
  // EAS SDK v2.9 Transaction<T>: `receipt` is populated AFTER `wait()`
  // resolves (see node_modules/.../eas-sdk/dist/lib.esm/transaction.d.ts).
  // Earlier sessions assumed a `.tx.hash` shortcut — that doesn't exist on
  // this SDK version. Read receipt.hash post-wait instead.
  const uid = await tx.wait();
  const txHash = tx.receipt?.hash ?? "";
  return { uid, txHash };
}

// ──────────────────────────────────────────────────────────────────────
// Display utilities
// ──────────────────────────────────────────────────────────────────────

/**
 * Build an EAS explorer URL for a given attestation UID.
 */
export function easAttestationUrl(
  uid: string,
  network: EasNetwork = "base",
): string {
  return `${easExplorerForNetwork(network)}/attestation/view/${uid}`;
}

/**
 * Build an EAS explorer URL for a schema UID.
 */
export function easSchemaUrl(
  uid: string,
  network: EasNetwork = "base",
): string {
  return `${easExplorerForNetwork(network)}/schema/view/${uid}`;
}
