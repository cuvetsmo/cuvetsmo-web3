# contracts/

Foundry workspace for CUVETSMO Web3 smart contracts.

**Owner**: Agent A (Smart Contracts).

## Layout

```
contracts/
├── foundry.toml         # solc 0.8.28 · via_ir · optimizer 200 · Base RPCs
├── remappings.txt       # OZ + OZ-upgradeable
├── src/
│   ├── OrgRegistry.sol           # multi-tenant org registry (orgId 1 = CUVET)
│   ├── VetSBTCard.sol            # soulbound student ID card · on-chain SVG
│   ├── BadgeRegistry.sol         # ERC-1155 non-transferable badges
│   ├── FirstStepsSBT.sol         # Wallet 101 completion badge
│   ├── Guestbook.sol             # event-only message wall (no storage)
│   ├── TokenImplementation.sol   # ERC-20 master cloned by TokenFactory
│   ├── TokenFactory.sol          # EIP-1167 ERC-20 clone factory · rate-limited
│   ├── NFTImplementation.sol     # ERC-721 master cloned by NFTFactory/SBTFactory
│   ├── NFTFactory.sol            # ERC-721 collection factory
│   ├── SBTFactory.sol            # soulbound ERC-721 collection factory
│   └── GovernorFactory.sol       # STUB · Phase-2 OZ Governor factory
├── script/
│   ├── Deploy.s.sol      # deploys all 11 contracts in order
│   └── extract-abis.js   # regenerates lib/contracts.ts from forge artifacts
├── test/                 # 9 *.t.sol files · 79 tests · 100% pass
├── deployments/          # network-specific addresses (base-sepolia.json, base.json)
└── lib/                  # forge deps · gitignored
```

## Quick start

```shell
# Build
forge build

# Test (79 tests across 9 suites)
forge test --summary

# Local smoke test (anvil)
anvil &
DEPLOYER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast

# Base Sepolia deploy (after funding deployer wallet)
forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --private-key $DEPLOYER_PRIVATE_KEY

# Regenerate lib/contracts.ts ABIs
node script/extract-abis.js
```

## Deployer wallet

Wave 2A generated a fresh deployer keypair stored in `contracts/.env` (gitignored):

```
Address:     0x769B00bbBfA3d3100dd1e15D8563c82F569F4593
```

**To deploy on Base Sepolia**, fund this address via the Coinbase faucet:
https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet (~0.05 ETH is enough).

Estimated gas for full deploy: ~0.024 ETH.

## Mainnet caveat

Only deploy these LOW-RISK contracts to Base mainnet:
- OrgRegistry, VetSBTCard, BadgeRegistry, FirstStepsSBT, Guestbook

DO NOT deploy factories to mainnet without an audit — factory bugs can cause user
fund loss. The factories are testnet-only until Wave 3 ships audits.

## References

- master plan §6 Technical Architecture
- master plan §7 The Lab — Deep Dive
- master plan Appendix A — Sample Smart Contracts
