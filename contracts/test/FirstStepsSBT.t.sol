// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {FirstStepsSBT} from "../src/FirstStepsSBT.sol";

contract FirstStepsSBTTest is Test {
    FirstStepsSBT badge;
    address alice = address(0xA11CE);
    address bob = address(0xB0B);

    function setUp() public {
        badge = new FirstStepsSBT();
    }

    function test_Claim_AssignsTokenIdOne() public {
        vm.prank(alice);
        uint256 id = badge.claim();
        assertEq(id, 1);
        assertEq(badge.ownerOf(1), alice);
        assertEq(badge.tokenOf(alice), 1);
    }

    function test_Claim_OnePerWallet() public {
        vm.prank(alice);
        badge.claim();
        vm.prank(alice);
        vm.expectRevert(FirstStepsSBT.AlreadyClaimed.selector);
        badge.claim();
    }

    function test_TwoWallets_Sequential() public {
        vm.prank(alice);
        uint256 a = badge.claim();
        vm.prank(bob);
        uint256 b = badge.claim();
        assertEq(a, 1);
        assertEq(b, 2);
    }

    function test_TransferReverts() public {
        vm.prank(alice);
        badge.claim();
        vm.prank(alice);
        vm.expectRevert(FirstStepsSBT.SoulboundNonTransferable.selector);
        badge.transferFrom(alice, bob, 1);
    }

    function test_SafeTransferReverts() public {
        vm.prank(alice);
        badge.claim();
        vm.prank(alice);
        vm.expectRevert(FirstStepsSBT.SoulboundNonTransferable.selector);
        badge.safeTransferFrom(alice, bob, 1);
    }

    function test_TokenURI_NonEmpty() public {
        vm.prank(alice);
        badge.claim();
        string memory uri = badge.tokenURI(1);
        assertGt(bytes(uri).length, 100);
    }

    function test_HasClaimed_FalseBefore() public view {
        assertFalse(badge.hasClaimed(alice));
    }

    function test_HasClaimed_TrueAfter() public {
        vm.prank(alice);
        badge.claim();
        assertTrue(badge.hasClaimed(alice));
        assertFalse(badge.hasClaimed(bob));
    }

    function test_MintedAt_Recorded() public {
        vm.warp(1_700_000_000);
        vm.prank(alice);
        badge.claim();
        assertEq(badge.mintedAt(1), 1_700_000_000);
    }
}
