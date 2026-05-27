# DAO Quickstart · Phase 2 Buildout

**Phase 1 status** (`app/lab/dao-quickstart/_form.tsx`): users can create a Snapshot space (off-chain · free) OR submit a request to `GovernorFactory.createGovernor()` (on-chain · **request-queue stub**). The current factory contract emits `GovernorRequested(address creator, address token, string name)` — it does NOT deploy a real Governor; it just records the intent for Wave 3 admin batch-deploy. Phase 1 ends at "Request submitted".

**Phase 2 scope** is therefore *bigger* than just parsing an event:

1. **Contract upgrade** — change `GovernorFactory.sol` so `createGovernor` actually deploys a fresh `Governor` instance (likely via CREATE2 or ERC-1967 proxy clone) and emits `GovernorCreated(address governor, address creator, address token, string name)`. Re-audit + redeploy required.
2. **Frontend rewire** — parse the new `GovernorCreated` event from the receipt, then build the propose/vote/delegate UI on the actual deployed Governor address.

If contract upgrade is out of scope right now, Phase 2 can ship purely as **frontend on the Snapshot path** + an admin tool that lets Palm batch-deploy queued Governors and email creators their deployed address.

Estimated effort: **1 session (~3–5 h)** if contract stays as-is and we route through Snapshot · **2–3 sessions** if we upgrade the contract too.

---

## Why Phase 2 matters

A DAO without proposing/voting is just a sticker. Vet 86 governance demo (e.g. "Should we host JohnJud charity drive at Open House?") needs end-to-end:

1. **Create token** with vote delegation (ERC-20Votes — already shipped at `/lab/token-forge`)
2. **Create governor** pointing at that token (Phase 1 ✓)
3. **Delegate votes** to your own address (one-time per voter)
4. **Propose** a text or callable proposal
5. **Vote** (For · Against · Abstain) during the voting window
6. **Queue + Execute** (or just observe the result for text proposals)

Steps 3-6 are Phase 2.

---

## Files to add

```
app/lab/dao-quickstart/
├─ _form.tsx                      (existing · add post-create governor address parsing)
├─ _governor-dashboard.tsx        (NEW · 200 lines · the bulk of Phase 2)
├─ _proposals/
│  ├─ propose-form.tsx            (NEW · text proposal + optional call data)
│  └─ proposal-row.tsx            (NEW · state badge + vote buttons)
└─ _lib/
   └─ governor-abi.ts             (NEW · OZ Governor ABI subset, pre-bundled)
```

---

## Step 1 · Extract governor address from createGovernor receipt

**⚠️ Requires contract upgrade first** — `GovernorFactory` v1 emits `GovernorRequested`, not `GovernorCreated`. The address parsing pattern below assumes the v2 upgrade is shipped (deploys + emits the new event with the deployed Governor address). If sticking with v1, skip this step and route the demo flow through Snapshot (Step 1 alt below).

### Step 1 alt · Surface request-queue position (v1 path, no contract upgrade)

For Phase 1 contract as-is, show users a queue receipt instead of a deployed address:

```ts
const queueCount = await publicClient.readContract({
  address: CONTRACTS.GOVERNOR_FACTORY,
  abi: GOVERNOR_FACTORY_ABI,
  functionName: "requestCount", // if exposed; otherwise count from event logs
});
// Show: "Request submitted. You are #N in the deploy queue."
```

### Step 1 main · Parse GovernorCreated (after v2 upgrade)

In the upgraded `GovernorPanel`, after `useWaitForTransactionReceipt` resolves, parse the `GovernorCreated(address indexed governor, address indexed token, address indexed creator)` event log.

```ts
import { decodeEventLog } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";

const { data: receipt } = useWaitForTransactionReceipt({ hash: txHash });
const governorAddress = useMemo(() => {
  if (!receipt) return null;
  for (const log of receipt.logs) {
    try {
      const decoded = decodeEventLog({
        abi: GOVERNOR_FACTORY_ABI,
        data: log.data,
        topics: log.topics,
      });
      if (decoded.eventName === "GovernorCreated") {
        return decoded.args.governor as `0x${string}`;
      }
    } catch {/* not this event */}
  }
  return null;
}, [receipt]);
```

After parse, render:

```jsx
{governorAddress && (
  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 mt-3">
    <p className="text-sm font-semibold">✓ Governor deployed</p>
    <a href={`https://sepolia.basescan.org/address/${governorAddress}`} target="_blank">
      {governorAddress}
    </a>
    <Link href={`/lab/dao-quickstart/${governorAddress}`} className="block mt-2 btn-brand">
      Open governance dashboard →
    </Link>
  </div>
)}
```

Route `[address]/page.tsx` becomes the dashboard for that governor.

---

## Step 2 · Governor dashboard (`_governor-dashboard.tsx`)

Read-only state to display at the top:

```ts
const { data: state } = useReadContracts({
  contracts: [
    { address: gov, abi: GOVERNOR_ABI, functionName: "name" },
    { address: gov, abi: GOVERNOR_ABI, functionName: "token" },
    { address: gov, abi: GOVERNOR_ABI, functionName: "votingDelay" },
    { address: gov, abi: GOVERNOR_ABI, functionName: "votingPeriod" },
    { address: gov, abi: GOVERNOR_ABI, functionName: "proposalThreshold" },
    { address: gov, abi: GOVERNOR_ABI, functionName: "quorum", args: [latestBlock - 1n] },
  ],
});
```

Cards: name · voting token (link) · voting delay/period (blocks → days) · threshold · current quorum requirement.

---

## Step 3 · Delegate votes UI

Before a holder can vote OR propose, they must delegate. Even self-delegation requires a tx. Add a "Delegate to myself" button:

```tsx
const { writeContractAsync } = useWriteContract();
const onDelegate = () =>
  writeContractAsync({
    address: tokenAddress,
    abi: ERC20_VOTES_ABI,
    functionName: "delegate",
    args: [myAddress],
  });
```

Show current voting power (`getVotes(myAddress)`) to confirm delegation worked.

Also support: "Delegate to someone else" (paste an address). This is the dominant flow for institutional voting.

---

## Step 4 · Propose form (`_proposals/propose-form.tsx`)

OZ Governor.propose() signature:

```solidity
function propose(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    string memory description
) external returns (uint256);
```

For a **text-only proposal** (no on-chain action), pass:
- `targets: [governorAddress]`  (call self, no-op)
- `values: [0]`
- `calldatas: ["0x"]` (empty)
- `description: "user's full markdown text"`

For an **executable proposal**, the form needs target address + ABI + function picker + args — a small JSON editor is fine for Phase 2; visual builder is Phase 3.

```ts
const description = formData.description.trim();
const descHash = keccak256(toHex(description));
const proposalId = await writeContractAsync({
  address: gov,
  abi: GOVERNOR_ABI,
  functionName: "propose",
  args: [targets, values, calldatas, description],
});
// ProposalCreated event: emit ProposalCreated(uint256 indexed proposalId, ...);
// Parse from receipt to display "Your proposal: #<id>"
```

UX note: the description hash IS the proposal id seed. Same description = same id = revert. Force a timestamp suffix to avoid collisions in demo.

---

## Step 5 · Vote UI per proposal (`_proposals/proposal-row.tsx`)

Each proposal row shows:

| Field | Source |
|---|---|
| State badge | `state(proposalId)` → enum: Pending · Active · Canceled · Defeated · Succeeded · Queued · Expired · Executed |
| For/Against/Abstain counts | `proposalVotes(proposalId)` returns `{ againstVotes, forVotes, abstainVotes }` |
| Quorum progress | `quorum(proposalSnapshot)` vs `forVotes + abstainVotes` |
| Voting window | `proposalSnapshot(id)` + `proposalDeadline(id)` — convert blocks → date via avg block time on Base (~2s) |
| Your vote | `hasVoted(id, myAddress)` |
| Vote buttons | call `castVote(id, support)` where support = 0 (Against) · 1 (For) · 2 (Abstain) |

```ts
const onVote = (support: 0 | 1 | 2) =>
  writeContractAsync({
    address: gov,
    abi: GOVERNOR_ABI,
    functionName: "castVote",
    args: [proposalId, support],
  });
```

Bonus: `castVoteWithReason(id, support, reason)` lets voters attach a comment.

---

## Step 6 · Execute (when proposal Succeeds + queue + delay window)

```ts
const onQueue = () =>
  writeContractAsync({
    address: gov,
    abi: GOVERNOR_ABI,
    functionName: "queue",
    args: [targets, values, calldatas, descHash],
  });

const onExecute = () =>
  writeContractAsync({
    address: gov,
    abi: GOVERNOR_ABI,
    functionName: "execute",
    args: [targets, values, calldatas, descHash],
  });
```

For text-only proposals: queue + execute still pass, they just don't do anything on-chain. The "passed" state itself is the result.

For executable proposals: tokens must be controlled by the governor (or it must be a delegated admin) for execute to work. Phase 2 demo can skip executable proposals or use a TimelockController via OZ's `GovernorTimelockControl` extension.

---

## Step 7 · Gas-sponsorship for proposing/voting

After `lib/use-sponsored-write.ts` lands (see `docs/SPONSORED_USER_TXS.md`), wire the `castVote` flow through it. Voters with $0 ETH should be able to vote — the killer-app pitch.

```ts
const { send } = useSponsoredWrite();
const onVoteGasless = (support: 0 | 1 | 2) =>
  send({
    address: gov,
    abi: GOVERNOR_ABI,
    functionName: "castVote",
    args: [proposalId, support],
  });
```

Pimlico free tier easily covers a single Vet 86 cohort's voting (~180 voters × 3 polls/yr = 540 sponsored ops).

---

## Step 8 · Index past proposals (when reading > 2000 blocks ago)

`proposalSnapshot(id)` returns the block at which voting power was captured. Reading historical proposals via `getLogs` will hit Base Sepolia's 2000-block cap.

When the proposal count grows beyond ~10, switch reads to the Goldsky indexer (see `docs/INDEXER_SETUP.md`). Add a `Proposal` entity to the subgraph schema with author · descriptionHash · state · votes.

---

## Open-source UX kit (optional · saves time)

[`tally.xyz`](https://tally.xyz) offers a free embed for any OZ Governor — point Tally at the deployed governor address and they render the whole dashboard. The "build it ourselves" path above is the educational lane; for a quick-launch group DAO, Tally embed is faster.

Decision: ship our own UI for the Lab pillar (educational · explains each step). Recommend Tally embed for actual production DAOs.

---

## Owner action checklist (when Palm is ready for Phase 2)

- [ ] **Decide v1 vs v2 path**: current `GovernorFactory.sol` emits `GovernorRequested(creator, token, name)` only — NOT a real deploy. Choose: (a) ship Snapshot-only demo and treat on-chain Governor as Wave 3, or (b) upgrade the contract to emit `GovernorCreated(governor, ...)` and redeploy
- [ ] If (b): write v2 `GovernorFactory.sol` that uses CREATE2 or OZ `Clones.cloneDeterministic` to deploy an OZ `Governor` instance per request · re-audit · redeploy with new addresses
- [ ] Drop `OZ Governor.json` ABI into `app/lab/dao-quickstart/_lib/governor-abi.ts` (use the Foundry build artifact)
- [ ] Build `[address]/page.tsx` route + dashboard component
- [ ] Wire propose form + proposal row
- [ ] Test end-to-end with a fresh Token Forge token (mint to 2 addresses · delegate · propose · both vote · check state)
- [ ] Wire `useSponsoredWrite` into voting (only for embedded-wallet users)
- [ ] Update the warning in `_form.tsx` GovernorPanel — drop "stub" framing once Phase 2 is real
- [ ] When proposal count > 10, ship the Goldsky `Proposal` entity (see `docs/INDEXER_SETUP.md`)

Estimated effort: **3–5 h for a working demo · 10–15 h for production-quality + sponsorship + indexer**.
