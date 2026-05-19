// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {SBTFactory} from "../src/SBTFactory.sol";
import {NFTImplementation} from "../src/NFTImplementation.sol";

contract SBTFactoryTest is Test {
    SBTFactory factory;
    NFTImplementation impl;
    address alice = address(0xA11CE);
    address bob = address(0xB0B);

    function setUp() public {
        impl = new NFTImplementation();
        factory = new SBTFactory(address(impl));
    }

    function test_CreateSBTCollection_SoulboundFlag() public {
        vm.prank(alice);
        address col = factory.createSBTCollection("SBT", "S", "ipfs://", 0);
        assertTrue(NFTImplementation(col).soulbound());
    }

    function test_SBTCollection_TransferReverts() public {
        vm.prank(alice);
        address col = factory.createSBTCollection("S", "S", "ipfs://", 0);
        vm.prank(alice);
        NFTImplementation(col).mint(alice);
        vm.prank(alice);
        vm.expectRevert(NFTImplementation.SoulboundNonTransferable.selector);
        NFTImplementation(col).transferFrom(alice, bob, 1);
    }

    function test_SBTCollection_MintWorks() public {
        vm.prank(alice);
        address col = factory.createSBTCollection("S", "S", "ipfs://", 0);
        vm.prank(alice);
        NFTImplementation(col).mint(bob);
        assertEq(NFTImplementation(col).ownerOf(1), bob);
    }

    function test_RateLimit_BlocksSixth() public {
        vm.startPrank(alice);
        for (uint256 i; i < 5; i++) {
            factory.createSBTCollection("S", "S", "ipfs://", 0);
        }
        vm.expectRevert(SBTFactory.RateLimitExceeded.selector);
        factory.createSBTCollection("S", "S", "ipfs://", 0);
        vm.stopPrank();
    }

    function test_TracksCreator() public {
        vm.prank(alice);
        address col = factory.createSBTCollection("S", "S", "ipfs://", 0);
        assertEq(factory.creatorOf(col), alice);
        assertEq(factory.collectionsCountOf(alice), 1);
    }

    function test_RejectsEmptyName() public {
        vm.prank(alice);
        vm.expectRevert(SBTFactory.EmptyName.selector);
        factory.createSBTCollection("", "S", "ipfs://", 0);
    }

    function test_RejectsEmptySymbol() public {
        vm.prank(alice);
        vm.expectRevert(SBTFactory.EmptySymbol.selector);
        factory.createSBTCollection("S", "", "ipfs://", 0);
    }
}
