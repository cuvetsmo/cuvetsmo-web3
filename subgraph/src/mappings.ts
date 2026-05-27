/**
 * AssemblyScript mappings for the CUVETSMO Web3 subgraph.
 *
 * This is NOT regular TypeScript — it's a strict subset that compiles to
 * WebAssembly. Notable quirks:
 *   - No `any` · no template literals · no spread · no destructuring
 *   - Use `BigInt.fromI32(n)` not `BigInt(n)`
 *   - Strings concatenate with `+` (no backtick interpolation)
 *   - `Address.toHexString()` returns lowercase 0x-prefixed hex
 *
 * Reference: https://thegraph.com/docs/en/developing/assemblyscript-api/
 */
import { BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import {
  MessagePosted as MessagePostedEvent,
} from "../generated/Guestbook/Guestbook";
import {
  BadgeDefined as BadgeDefinedEvent,
  BadgeMinted as BadgeMintedEvent,
  BadgeMinterChanged as BadgeMinterChangedEvent,
} from "../generated/BadgeRegistry/BadgeRegistry";
import {
  CardClaimed as CardClaimedEvent,
} from "../generated/VetSBTCard/VetSBTCard";
import {
  GuestbookPost,
  Badge,
  BadgeAward,
  VetCard,
} from "../generated/schema";

// ─── Guestbook ────────────────────────────────────────────────────────

export function handleMessagePosted(event: MessagePostedEvent): void {
  // Entity id = tx-hash + log-index → globally unique, deterministic.
  const id =
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  const post = new GuestbookPost(id);
  post.author = event.params.author;
  post.message = event.params.message;
  post.timestamp = BigInt.fromU64(event.params.timestamp);
  post.blockNumber = event.block.number;
  post.txHash = event.transaction.hash;
  post.save();
}

// ─── BadgeRegistry ────────────────────────────────────────────────────

export function handleBadgeDefined(event: BadgeDefinedEvent): void {
  const badgeId = event.params.badgeId.toString();
  let badge = Badge.load(badgeId);
  if (badge == null) {
    badge = new Badge(badgeId);
    badge.definedAt = event.block.timestamp;
  }
  badge.metadataURI = event.params.metadataURI;
  badge.minter = event.params.minter;
  badge.save();
}

export function handleBadgeMinted(event: BadgeMintedEvent): void {
  const badgeId = event.params.badgeId.toString();
  const userHex = event.params.to.toHexString();
  const awardId = userHex + "-" + badgeId;

  // BadgeRegistry.mint() is idempotent on-chain — re-mints emit no event,
  // so each event arriving here is the FIRST mint. Still guard load() in
  // case of reorg replay.
  let award = BadgeAward.load(awardId);
  if (award != null) return;

  // The badge entity should already exist via BadgeDefined; if not, create
  // a placeholder so the @derivedFrom relation doesn't dangle.
  let badge = Badge.load(badgeId);
  if (badge == null) {
    badge = new Badge(badgeId);
    badge.metadataURI = "";
    badge.minter = Bytes.fromHexString("0x0000000000000000000000000000000000000000");
    badge.definedAt = event.block.timestamp;
    badge.save();
    log.warning("BadgeMinted for undefined badge {} — created placeholder", [
      badgeId,
    ]);
  }

  award = new BadgeAward(awardId);
  award.user = event.params.to;
  award.badge = badgeId;
  award.mintedAt = event.block.timestamp;
  award.blockNumber = event.block.number;
  award.txHash = event.transaction.hash;
  award.save();
}

export function handleBadgeMinterChanged(event: BadgeMinterChangedEvent): void {
  const badgeId = event.params.badgeId.toString();
  let badge = Badge.load(badgeId);
  if (badge == null) {
    log.warning("BadgeMinterChanged for undefined badge {}", [badgeId]);
    return;
  }
  badge.minter = event.params.newMinter;
  badge.save();
}

// ─── VetSBTCard ───────────────────────────────────────────────────────

export function handleCardClaimed(event: CardClaimedEvent): void {
  // One card per address per organization — id keyed by holder address.
  const id = event.params.holder.toHexString();
  let card = VetCard.load(id);
  if (card == null) {
    card = new VetCard(id);
  }
  card.tokenId = event.params.tokenId;
  card.orgId = event.params.orgId;
  card.yearAdmitted = event.params.yearAdmitted;
  card.facultyCode = event.params.facultyCode;
  card.departmentCode = event.params.departmentCode;
  card.mintedAt = event.block.timestamp;
  card.blockNumber = event.block.number;
  card.txHash = event.transaction.hash;
  card.save();
}
