// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Lottery
/// @notice Simple lottery: participants pay a flat fee, owner picks a winner
///         using on-chain pseudo-randomness (block.prevrandao). NOT secure for
///         high-value lotteries — use Chainlink VRF in production.
/// @dev Educational template. ~120k gas to enter, ~80k to draw.
contract Lottery {
    address public owner;
    uint256 public entryFee;
    address[] public participants;
    address public winner;
    bool public drawn;

    event Entered(address indexed participant);
    event Drawn(address indexed winner, uint256 prize);

    error AlreadyDrawn();
    error NotOwner();
    error WrongFee();
    error NoParticipants();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(uint256 entryFee_) {
        owner = msg.sender;
        entryFee = entryFee_;
    }

    function enter() external payable {
        if (drawn) revert AlreadyDrawn();
        if (msg.value != entryFee) revert WrongFee();
        participants.push(msg.sender);
        emit Entered(msg.sender);
    }

    function draw() external onlyOwner {
        if (drawn) revert AlreadyDrawn();
        if (participants.length == 0) revert NoParticipants();
        uint256 idx = uint256(
            keccak256(abi.encode(block.prevrandao, block.timestamp, participants.length))
        ) % participants.length;
        winner = participants[idx];
        drawn = true;
        uint256 prize = address(this).balance;
        (bool ok,) = winner.call{value: prize}("");
        require(ok, "Transfer failed");
        emit Drawn(winner, prize);
    }

    function participantsCount() external view returns (uint256) {
        return participants.length;
    }
}
