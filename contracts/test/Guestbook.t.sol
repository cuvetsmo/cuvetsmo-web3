// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {Guestbook} from "../src/Guestbook.sol";

contract GuestbookTest is Test {
    Guestbook gb;
    address alice = address(0xA11CE);

    event Posted(address indexed author, uint64 timestamp, string message);

    function setUp() public {
        gb = new Guestbook();
    }

    function test_Post_EmitsEvent() public {
        vm.warp(1_700_000_000);
        vm.prank(alice);
        vm.expectEmit(true, false, false, true);
        emit Posted(alice, 1_700_000_000, "gm");
        gb.post("gm");
    }

    function test_Post_RejectsEmpty() public {
        vm.prank(alice);
        vm.expectRevert(Guestbook.MessageEmpty.selector);
        gb.post("");
    }

    function test_Post_RejectsTooLong() public {
        bytes memory tooLong = new bytes(281);
        for (uint256 i; i < 281;) {
            tooLong[i] = "a";
            unchecked {
                i++;
            }
        }
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Guestbook.MessageTooLong.selector, 281));
        gb.post(string(tooLong));
    }

    function test_Post_AcceptsMaxLength() public {
        bytes memory ok = new bytes(280);
        for (uint256 i; i < 280;) {
            ok[i] = "a";
            unchecked {
                i++;
            }
        }
        vm.prank(alice);
        gb.post(string(ok));
    }

    function test_Post_MultipleEventsSeparate() public {
        vm.startPrank(alice);
        gb.post("a");
        gb.post("b");
        gb.post("c");
        vm.stopPrank();
    }

    function test_MaxLength_Constant() public view {
        assertEq(gb.MAX_MESSAGE_LENGTH(), 280);
    }
}
