# contracts/

Foundry workspace for web3.cuvetsmo.com smart contracts.

**Owner**: Agent A (Smart Contracts).

## Layout (target)

```
contracts/
├── foundry.toml        # Foundry config (Base Sepolia profile + remappings)
├── src/
│   ├── OrgRegistry.sol      # registered orgs that can issue SBT cards
│   ├── VetSBTCard.sol       # ERC-5114 soulbound student card
│   ├── BadgeRegistry.sol    # badge SBT collection
│   ├── factories/
│   │   ├── TokenFactory.sol     # CREATE2 ERC-20 deployer
│   │   ├── NFTFactory.sol       # ERC-721 collection deployer
│   │   ├── SBTFactory.sol       # soulbound badge deployer
│   │   └── GovernorFactory.sol  # OpenZeppelin Governor + ERC20Votes
│   └── shared/
│       └── (interfaces, libraries)
├── script/
│   └── Deploy.s.sol     # deployment script (Base Sepolia)
├── test/
│   └── *.t.sol          # Foundry tests
└── lib/                 # forge deps (gitignored, install via forge install)
```

## Deployment outputs

After `forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast`,
write the deployed addresses into:

1. The root `.env.local` (for local dev)
2. Vercel project env vars (for production — Wave 3 handles)
3. `lib/contracts.ts` ABI registry (paste const ABIs)

## References

- master plan §6 Technical Architecture
- master plan §7 The Lab — Deep Dive
- master plan Appendix A — Sample Smart Contracts
