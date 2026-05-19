// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {GovernorFactory} from "../src/GovernorFactory.sol";

contract GovernorFactoryTest is Test {
    GovernorFactory factory;
    address alice = address(0xA11CE);

    event GovernorRequested(address indexed creator, address indexed token, string name);

    function setUp() public {
        factory = new GovernorFactory();
    }

    function test_CreateGovernor_ReturnsZero() public {
        vm.prank(alice);
        address gov = factory.createGovernor(address(0x123), "MyGov");
        assertEq(gov, address(0));
    }

    function test_CreateGovernor_EmitsRequested() public {
        vm.prank(alice);
        vm.expectEmit(true, true, false, true);
        emit GovernorRequested(alice, address(0x123), "G");
        factory.createGovernor(address(0x123), "G");
    }

    function test_CreateGovernor_IncrementsRequestCount() public {
        vm.startPrank(alice);
        factory.createGovernor(address(0x1), "A");
        factory.createGovernor(address(0x2), "B");
        vm.stopPrank();
        assertEq(factory.requestCount(alice), 2);
    }

    function test_Version_String() public view {
        assertEq(factory.version(), "GovernorFactory:stub:v0");
    }

    function test_DifferentSendersDifferentCounts() public {
        vm.prank(alice);
        factory.createGovernor(address(0x1), "A");
        assertEq(factory.requestCount(alice), 1);
        assertEq(factory.requestCount(address(0xB0B)), 0);
    }
}
