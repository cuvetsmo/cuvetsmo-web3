// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title TipJar
/// @notice Accept ETH tips with optional messages. Owner can withdraw.
contract TipJar {
    address public owner;
    uint256 public totalTipsReceived;
    uint256 public tipCount;

    event Tipped(address indexed from, uint256 amount, string message);
    event Withdrawn(address indexed to, uint256 amount);

    error NotOwner();
    error EmptyTip();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function tip(string calldata message) external payable {
        if (msg.value == 0) revert EmptyTip();
        unchecked {
            totalTipsReceived += msg.value;
            tipCount += 1;
        }
        emit Tipped(msg.sender, msg.value, message);
    }

    function withdraw() external onlyOwner {
        uint256 bal = address(this).balance;
        (bool ok,) = owner.call{value: bal}("");
        require(ok, "Transfer failed");
        emit Withdrawn(owner, bal);
    }

    receive() external payable {
        unchecked {
            totalTipsReceived += msg.value;
            tipCount += 1;
        }
        emit Tipped(msg.sender, msg.value, "");
    }
}
