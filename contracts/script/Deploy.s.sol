// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {OrgRegistry} from "../src/OrgRegistry.sol";
import {VetSBTCard} from "../src/VetSBTCard.sol";
import {BadgeRegistry} from "../src/BadgeRegistry.sol";
import {FirstStepsSBT} from "../src/FirstStepsSBT.sol";
import {Guestbook} from "../src/Guestbook.sol";
import {TokenImplementation} from "../src/TokenImplementation.sol";
import {TokenFactory} from "../src/TokenFactory.sol";
import {NFTImplementation} from "../src/NFTImplementation.sol";
import {NFTFactory} from "../src/NFTFactory.sol";
import {SBTFactory} from "../src/SBTFactory.sol";
import {GovernorFactory} from "../src/GovernorFactory.sol";

/// @notice Deploys the full cuvetsmo-web3 contract suite.
/// Usage:
///   forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --private-key $DEPLOYER_PRIVATE_KEY
contract Deploy is Script {
    struct Deployment {
        address orgRegistry;
        address vetSbtCard;
        address badgeRegistry;
        address firstStepsSbt;
        address guestbook;
        address tokenImpl;
        address tokenFactory;
        address nftImpl;
        address nftFactory;
        address sbtFactory;
        address governorFactory;
    }

    function run() external {
        uint256 deployerPk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPk);
        console2.log("Deployer:", deployer);
        console2.log("ChainID:", block.chainid);

        vm.startBroadcast(deployerPk);

        OrgRegistry orgRegistry = new OrgRegistry(deployer);
        console2.log("OrgRegistry:", address(orgRegistry));

        VetSBTCard vetSbtCard = new VetSBTCard(deployer);
        console2.log("VetSBTCard:", address(vetSbtCard));

        BadgeRegistry badgeRegistry = new BadgeRegistry(deployer);
        console2.log("BadgeRegistry:", address(badgeRegistry));

        FirstStepsSBT firstStepsSbt = new FirstStepsSBT();
        console2.log("FirstStepsSBT:", address(firstStepsSbt));

        Guestbook guestbook = new Guestbook();
        console2.log("Guestbook:", address(guestbook));

        TokenImplementation tokenImpl = new TokenImplementation();
        console2.log("TokenImplementation:", address(tokenImpl));

        TokenFactory tokenFactory = new TokenFactory(address(tokenImpl));
        console2.log("TokenFactory:", address(tokenFactory));

        NFTImplementation nftImpl = new NFTImplementation();
        console2.log("NFTImplementation:", address(nftImpl));

        NFTFactory nftFactory = new NFTFactory(address(nftImpl));
        console2.log("NFTFactory:", address(nftFactory));

        SBTFactory sbtFactory = new SBTFactory(address(nftImpl));
        console2.log("SBTFactory:", address(sbtFactory));

        GovernorFactory governorFactory = new GovernorFactory();
        console2.log("GovernorFactory (stub):", address(governorFactory));

        vm.stopBroadcast();

        _writeDeployment(
            Deployment({
                orgRegistry: address(orgRegistry),
                vetSbtCard: address(vetSbtCard),
                badgeRegistry: address(badgeRegistry),
                firstStepsSbt: address(firstStepsSbt),
                guestbook: address(guestbook),
                tokenImpl: address(tokenImpl),
                tokenFactory: address(tokenFactory),
                nftImpl: address(nftImpl),
                nftFactory: address(nftFactory),
                sbtFactory: address(sbtFactory),
                governorFactory: address(governorFactory)
            })
        );
    }

    function _writeDeployment(Deployment memory d) internal {
        string memory chainName = _chainName(block.chainid);
        string memory path = string.concat("deployments/", chainName, ".json");

        string memory json = "deployment";
        vm.serializeAddress(json, "orgRegistry", d.orgRegistry);
        vm.serializeAddress(json, "vetSbtCard", d.vetSbtCard);
        vm.serializeAddress(json, "badgeRegistry", d.badgeRegistry);
        vm.serializeAddress(json, "firstStepsSbt", d.firstStepsSbt);
        vm.serializeAddress(json, "guestbook", d.guestbook);
        vm.serializeAddress(json, "tokenImpl", d.tokenImpl);
        vm.serializeAddress(json, "tokenFactory", d.tokenFactory);
        vm.serializeAddress(json, "nftImpl", d.nftImpl);
        vm.serializeAddress(json, "nftFactory", d.nftFactory);
        vm.serializeAddress(json, "sbtFactory", d.sbtFactory);
        string memory finalJson = vm.serializeAddress(json, "governorFactory", d.governorFactory);

        vm.writeFile(path, finalJson);
        console2.log("Wrote deployment to:", path);
    }

    function _chainName(uint256 chainId) internal pure returns (string memory) {
        if (chainId == 84532) return "base-sepolia";
        if (chainId == 8453) return "base";
        if (chainId == 31337) return "anvil";
        return "unknown";
    }
}
