// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {NFTFactory} from "../src/NFTFactory.sol";
import {NFTImplementation} from "../src/NFTImplementation.sol";

contract NFTFactoryTest is Test {
    NFTFactory factory;
    NFTImplementation impl;
    address alice = address(0xA11CE);
    address bob = address(0xB0B);

    function setUp() public {
        impl = new NFTImplementation();
        factory = new NFTFactory(address(impl));
    }

    function test_CreateCollection_DeploysAndInitializes() public {
        vm.prank(alice);
        address col = factory.createCollection("MyCol", "MC", "ipfs://cid/", 0);
        assertTrue(col != address(0));
        NFTImplementation nft = NFTImplementation(col);
        assertEq(nft.name(), "MyCol");
        assertEq(nft.symbol(), "MC");
        assertEq(nft.owner(), alice);
        assertFalse(nft.soulbound());
        assertEq(nft.maxSupply(), 0);
    }

    function test_CreatedCollection_MintByOwner() public {
        vm.prank(alice);
        address col = factory.createCollection("C", "C", "ipfs://x/", 0);
        vm.prank(alice);
        NFTImplementation(col).mint(bob);
        assertEq(NFTImplementation(col).ownerOf(1), bob);
        assertEq(NFTImplementation(col).tokenURI(1), "ipfs://x/1");
    }

    function test_CreatedCollection_NotSoulbound_TransferOk() public {
        vm.prank(alice);
        address col = factory.createCollection("C", "C", "ipfs://x/", 0);
        vm.prank(alice);
        NFTImplementation(col).mint(alice);
        vm.prank(alice);
        NFTImplementation(col).transferFrom(alice, bob, 1);
        assertEq(NFTImplementation(col).ownerOf(1), bob);
    }

    function test_RateLimit_BlocksSixth() public {
        vm.startPrank(alice);
        for (uint256 i; i < 5; i++) {
            factory.createCollection("C", "C", "ipfs://", 0);
        }
        vm.expectRevert(NFTFactory.RateLimitExceeded.selector);
        factory.createCollection("C", "C", "ipfs://", 0);
        vm.stopPrank();
    }

    function test_MaxSupply_Enforced() public {
        vm.prank(alice);
        address col = factory.createCollection("C", "C", "ipfs://", 2);
        vm.startPrank(alice);
        NFTImplementation(col).mint(alice);
        NFTImplementation(col).mint(alice);
        vm.expectRevert(NFTImplementation.MaxSupplyReached.selector);
        NFTImplementation(col).mint(alice);
        vm.stopPrank();
    }

    function test_CreateCollection_TracksCreator() public {
        vm.prank(alice);
        address col = factory.createCollection("C", "C", "ipfs://", 0);
        assertEq(factory.creatorOf(col), alice);
        assertEq(factory.collectionsCountOf(alice), 1);
    }

    function test_RejectsEmptyName() public {
        vm.prank(alice);
        vm.expectRevert(NFTFactory.EmptyName.selector);
        factory.createCollection("", "S", "ipfs://", 0);
    }
}
