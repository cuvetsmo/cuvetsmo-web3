// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @title Guestbook
/// @notice On-chain message wall. Messages are emitted as events only (no storage).
/// @dev Reads happen off-chain via event indexers. 280 char Twitter-style limit.
contract Guestbook {
    uint256 public constant MAX_MESSAGE_LENGTH = 280;

    event Posted(address indexed author, uint64 timestamp, string message);

    error MessageTooLong(uint256 length);
    error MessageEmpty();

    /// @notice Post a message. Emits Posted event, stores nothing.
    function post(string calldata message) external {
        uint256 len = bytes(message).length;
        if (len == 0) revert MessageEmpty();
        if (len > MAX_MESSAGE_LENGTH) revert MessageTooLong(len);
        emit Posted(msg.sender, uint64(block.timestamp), message);
    }
}
