// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {VetSBTCard} from "../src/VetSBTCard.sol";
import {IERC721Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

contract VetSBTCardTest is Test {
    VetSBTCard card;
    address owner = address(0xA11CE);
    address alice = address(0xB0B);
    address bob = address(0xCAFE);

    function setUp() public {
        card = new VetSBTCard(owner);
    }

    function test_Claim_FirstCard() public {
        vm.prank(alice);
        uint256 id = card.claim(1, 2566, bytes32("hash"), 1, 2);
        assertEq(id, 1);
        assertEq(card.ownerOf(1), alice);
        assertEq(card.tokenIdOf(alice), 1);
    }

    function test_Claim_OnePerWallet() public {
        vm.prank(alice);
        card.claim(1, 2566, bytes32("h"), 1, 2);
        vm.prank(alice);
        vm.expectRevert(VetSBTCard.AlreadyClaimed.selector);
        card.claim(1, 2566, bytes32("h"), 1, 2);
    }

    function test_Claim_DifferentWalletsGetSequentialIds() public {
        vm.prank(alice);
        uint256 a = card.claim(1, 2566, bytes32("a"), 1, 2);
        vm.prank(bob);
        uint256 b = card.claim(1, 2566, bytes32("b"), 1, 2);
        assertEq(a, 1);
        assertEq(b, 2);
    }

    function test_Claim_RejectsInvalidYear() public {
        vm.prank(alice);
        vm.expectRevert(VetSBTCard.InvalidYear.selector);
        card.claim(1, 1900, bytes32("h"), 1, 2);
    }

    function test_TransferReverts() public {
        vm.prank(alice);
        card.claim(1, 2566, bytes32("h"), 1, 2);
        vm.prank(alice);
        vm.expectRevert(VetSBTCard.SoulboundNonTransferable.selector);
        card.transferFrom(alice, bob, 1);
    }

    function test_SafeTransferReverts() public {
        vm.prank(alice);
        card.claim(1, 2566, bytes32("h"), 1, 2);
        vm.prank(alice);
        vm.expectRevert(VetSBTCard.SoulboundNonTransferable.selector);
        card.safeTransferFrom(alice, bob, 1);
    }

    function test_TokenURI_NonEmpty() public {
        vm.prank(alice);
        card.claim(1, 2566, bytes32("h"), 1, 2);
        string memory uri = card.tokenURI(1);
        assertGt(bytes(uri).length, 100);
    }

    function test_Pause_BlocksClaim() public {
        vm.prank(owner);
        card.pause();
        vm.prank(alice);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        card.claim(1, 2566, bytes32("h"), 1, 2);
    }

    function test_Unpause_AllowsClaim() public {
        vm.prank(owner);
        card.pause();
        vm.prank(owner);
        card.unpause();
        vm.prank(alice);
        card.claim(1, 2566, bytes32("h"), 1, 2);
        assertEq(card.tokenIdOf(alice), 1);
    }

    function test_CardOf_AfterClaim() public {
        vm.warp(1_700_000_000);
        vm.prank(alice);
        card.claim(1, 2566, bytes32("hash"), 4, 2);
        VetSBTCard.CardView memory v = card.cardOf(alice);
        assertEq(v.tokenId, 1);
        assertEq(v.orgId, 1);
        assertEq(v.yearAdmitted, 2566);
        assertEq(v.studentIdHash, bytes32("hash"));
        assertEq(v.facultyCode, 4);
        assertEq(v.departmentCode, 2);
        assertEq(v.mintedAt, 1_700_000_000);
    }

    function test_CardOf_NoClaim_ReturnsZero() public view {
        VetSBTCard.CardView memory v = card.cardOf(alice);
        assertEq(v.tokenId, 0);
    }
}
