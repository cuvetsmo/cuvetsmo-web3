// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {TokenFactory} from "../src/TokenFactory.sol";
import {TokenImplementation} from "../src/TokenImplementation.sol";

contract TokenFactoryTest is Test {
    TokenFactory factory;
    TokenImplementation impl;
    address alice = address(0xA11CE);
    address bob = address(0xB0B);

    function setUp() public {
        impl = new TokenImplementation();
        factory = new TokenFactory(address(impl));
    }

    function test_CreateToken_DeploysClone() public {
        vm.prank(alice);
        address token = factory.createToken("MyToken", "MYT", 1_000_000 ether);
        assertTrue(token != address(0));
        assertEq(TokenImplementation(token).name(), "MyToken");
        assertEq(TokenImplementation(token).symbol(), "MYT");
        assertEq(TokenImplementation(token).totalSupply(), 1_000_000 ether);
        assertEq(TokenImplementation(token).balanceOf(alice), 1_000_000 ether);
        assertEq(TokenImplementation(token).owner(), alice);
    }

    function test_CreateToken_TracksCreator() public {
        vm.prank(alice);
        address token = factory.createToken("A", "A", 1);
        assertEq(factory.creatorOf(token), alice);
        assertEq(factory.tokensCountOf(alice), 1);
        assertEq(factory.tokensByCreator(alice, 0), token);
    }

    function test_CreateToken_RateLimit_AllowsFive() public {
        vm.startPrank(alice);
        for (uint256 i; i < 5; i++) {
            factory.createToken("T", "T", 1);
        }
        vm.stopPrank();
        assertEq(factory.tokensCountOf(alice), 5);
    }

    function test_CreateToken_RateLimit_BlocksSixth() public {
        vm.startPrank(alice);
        for (uint256 i; i < 5; i++) {
            factory.createToken("T", "T", 1);
        }
        vm.expectRevert(TokenFactory.RateLimitExceeded.selector);
        factory.createToken("T", "T", 1);
        vm.stopPrank();
    }

    function test_CreateToken_RateLimitResetsAfterDay() public {
        vm.warp(1_000_000);
        vm.startPrank(alice);
        for (uint256 i; i < 5; i++) {
            factory.createToken("T", "T", 1);
        }
        vm.stopPrank();
        // jump past window
        vm.warp(1_000_000 + 1 days + 1);
        vm.prank(alice);
        factory.createToken("T6", "T6", 1);
        assertEq(factory.tokensCountOf(alice), 6);
    }

    function test_CreateToken_PerAddressLimits() public {
        // alice maxed out
        vm.startPrank(alice);
        for (uint256 i; i < 5; i++) {
            factory.createToken("T", "T", 1);
        }
        vm.stopPrank();
        // bob unaffected
        vm.prank(bob);
        factory.createToken("BobT", "B", 1);
        assertEq(factory.tokensCountOf(bob), 1);
    }

    function test_CreateToken_RejectsEmptyName() public {
        vm.prank(alice);
        vm.expectRevert(TokenFactory.EmptyName.selector);
        factory.createToken("", "S", 1);
    }

    function test_CreateToken_RejectsEmptySymbol() public {
        vm.prank(alice);
        vm.expectRevert(TokenFactory.EmptySymbol.selector);
        factory.createToken("N", "", 1);
    }

    function test_ClonedToken_CanBurn() public {
        vm.prank(alice);
        address token = factory.createToken("T", "T", 100 ether);
        vm.prank(alice);
        TokenImplementation(token).burn(40 ether);
        assertEq(TokenImplementation(token).totalSupply(), 60 ether);
    }

    function test_ImplementationCannotInit() public {
        // direct impl init disabled
        vm.expectRevert(); // InvalidInitialization
        impl.initialize("X", "X", 1, alice);
    }
}
