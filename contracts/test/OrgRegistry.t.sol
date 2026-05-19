// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {OrgRegistry} from "../src/OrgRegistry.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract OrgRegistryTest is Test {
    OrgRegistry reg;
    address owner = address(0xA11CE);
    address other = address(0xB0B);
    address newAdmin = address(0xC0DE);

    function setUp() public {
        vm.prank(owner);
        reg = new OrgRegistry(owner);
    }

    function test_PreRegistersCUVET() public view {
        (string memory name, address admin, bool active, uint64 createdAt) = reg.orgs(1);
        assertEq(name, "CUVET");
        assertEq(admin, owner);
        assertTrue(active);
        assertGt(createdAt, 0);
        assertEq(reg.nextOrgId(), 2);
    }

    function test_RegisterOrg_OwnerCan() public {
        vm.prank(owner);
        uint256 id = reg.registerOrg("Faculty of X", newAdmin);
        assertEq(id, 2);
        (string memory name, address admin, bool active,) = reg.orgs(2);
        assertEq(name, "Faculty of X");
        assertEq(admin, newAdmin);
        assertTrue(active);
    }

    function test_RegisterOrg_NonOwnerCannot() public {
        vm.prank(other);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, other));
        reg.registerOrg("Faculty of X", newAdmin);
    }

    function test_RegisterOrg_RejectsZeroAdmin() public {
        vm.prank(owner);
        vm.expectRevert(OrgRegistry.InvalidAdmin.selector);
        reg.registerOrg("X", address(0));
    }

    function test_RegisterOrg_RejectsEmptyName() public {
        vm.prank(owner);
        vm.expectRevert(OrgRegistry.EmptyName.selector);
        reg.registerOrg("", newAdmin);
    }

    function test_SetOrgAdmin_OwnerCan() public {
        vm.prank(owner);
        reg.setOrgAdmin(1, newAdmin);
        assertEq(reg.adminOf(1), newAdmin);
    }

    function test_SetOrgAdmin_RevertsOnUnknownOrg() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(OrgRegistry.OrgDoesNotExist.selector, 99));
        reg.setOrgAdmin(99, newAdmin);
    }

    function test_SetOrgActive_TogglesActive() public {
        assertTrue(reg.isActive(1));
        vm.prank(owner);
        reg.setOrgActive(1, false);
        assertFalse(reg.isActive(1));
        vm.prank(owner);
        reg.setOrgActive(1, true);
        assertTrue(reg.isActive(1));
    }

    function test_IsActive_FalseForUnknown() public view {
        assertFalse(reg.isActive(999));
    }
}
