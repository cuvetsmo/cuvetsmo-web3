// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {BadgeRegistry} from "../src/BadgeRegistry.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract BadgeRegistryTest is Test {
    BadgeRegistry reg;
    address owner = address(0xA11CE);
    address minter = address(0xB0B);
    address user = address(0xCAFE);
    address other = address(0xDEAD);

    function setUp() public {
        reg = new BadgeRegistry(owner);
    }

    function test_DefineBadge_OwnerCan() public {
        vm.prank(owner);
        uint256 id = reg.defineBadge("ipfs://badge1", minter);
        assertEq(id, 1);
        (string memory uri, address mintAddr, bool exists) = reg.badges(1);
        assertEq(uri, "ipfs://badge1");
        assertEq(mintAddr, minter);
        assertTrue(exists);
    }

    function test_DefineBadge_NonOwnerCannot() public {
        vm.prank(other);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, other));
        reg.defineBadge("ipfs://x", minter);
    }

    function test_DefineBadge_RejectsZeroMinter() public {
        vm.prank(owner);
        vm.expectRevert(BadgeRegistry.InvalidMinter.selector);
        reg.defineBadge("ipfs://x", address(0));
    }

    function test_Mint_AuthorizedMinterCan() public {
        vm.prank(owner);
        reg.defineBadge("ipfs://b", minter);
        vm.prank(minter);
        reg.mint(user, 1);
        assertEq(reg.balanceOf(user, 1), 1);
    }

    function test_Mint_OnlyAuthorizedMinter() public {
        vm.prank(owner);
        reg.defineBadge("ipfs://b", minter);
        vm.prank(other);
        vm.expectRevert(BadgeRegistry.NotAuthorizedMinter.selector);
        reg.mint(user, 1);
    }

    function test_Mint_RejectsUnknownBadge() public {
        vm.prank(minter);
        vm.expectRevert(abi.encodeWithSelector(BadgeRegistry.BadgeDoesNotExist.selector, 1));
        reg.mint(user, 1);
    }

    function test_TransferReverts() public {
        vm.prank(owner);
        reg.defineBadge("ipfs://b", minter);
        vm.prank(minter);
        reg.mint(user, 1);
        vm.prank(user);
        vm.expectRevert(BadgeRegistry.BadgeNonTransferable.selector);
        reg.safeTransferFrom(user, other, 1, 1, "");
    }

    function test_BatchTransferReverts() public {
        vm.prank(owner);
        reg.defineBadge("ipfs://b", minter);
        vm.prank(minter);
        reg.mint(user, 1);
        uint256[] memory ids = new uint256[](1);
        ids[0] = 1;
        uint256[] memory amts = new uint256[](1);
        amts[0] = 1;
        vm.prank(user);
        vm.expectRevert(BadgeRegistry.BadgeNonTransferable.selector);
        reg.safeBatchTransferFrom(user, other, ids, amts, "");
    }

    function test_SetBadgeMinter_OwnerCan() public {
        vm.prank(owner);
        reg.defineBadge("ipfs://b", minter);
        vm.prank(owner);
        reg.setBadgeMinter(1, other);
        (, address newMinter,) = reg.badges(1);
        assertEq(newMinter, other);
    }

    function test_HasBadge_True() public {
        vm.prank(owner);
        reg.defineBadge("ipfs://b", minter);
        vm.prank(minter);
        reg.mint(user, 1);
        assertTrue(reg.hasBadge(user, 1));
    }

    function test_HasBadge_False() public {
        vm.prank(owner);
        reg.defineBadge("ipfs://b", minter);
        assertFalse(reg.hasBadge(user, 1));
    }

    function test_BadgesOf_Empty() public {
        uint256[] memory ids = reg.badgesOf(user);
        assertEq(ids.length, 0);
    }

    function test_BadgesOf_Multiple() public {
        vm.prank(owner);
        reg.defineBadge("ipfs://a", minter);
        vm.prank(owner);
        reg.defineBadge("ipfs://b", minter);
        vm.startPrank(minter);
        reg.mint(user, 1);
        reg.mint(user, 2);
        vm.stopPrank();
        uint256[] memory ids = reg.badgesOf(user);
        assertEq(ids.length, 2);
        assertEq(ids[0], 1);
        assertEq(ids[1], 2);
    }

    function test_Mint_Idempotent() public {
        vm.prank(owner);
        reg.defineBadge("ipfs://b", minter);
        vm.prank(minter);
        reg.mint(user, 1);
        vm.prank(minter);
        reg.mint(user, 1); // re-mint same badge
        assertEq(reg.balanceOf(user, 1), 1);
        uint256[] memory ids = reg.badgesOf(user);
        assertEq(ids.length, 1);
    }

    function test_URI_PerBadge() public {
        vm.prank(owner);
        reg.defineBadge("ipfs://badge-one", minter);
        vm.prank(owner);
        reg.defineBadge("ipfs://badge-two", minter);
        assertEq(reg.uri(1), "ipfs://badge-one");
        assertEq(reg.uri(2), "ipfs://badge-two");
    }
}
