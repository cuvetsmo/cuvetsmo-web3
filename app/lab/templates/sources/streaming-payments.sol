// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title StreamingPayments
/// @notice Skeleton for streaming ETH payments at a constant rate per second.
///         Recipient can withdraw any vested amount. PLACEHOLDER — does not
///         handle cancellation or top-ups. Use Sablier for production.
contract StreamingPayments {
    struct Stream {
        address sender;
        address recipient;
        uint256 deposit;
        uint64 startTime;
        uint64 stopTime;
        uint256 withdrawn;
    }

    Stream[] public streams;

    event StreamCreated(uint256 indexed streamId, address indexed sender, address indexed recipient);
    event Withdrawn(uint256 indexed streamId, uint256 amount);

    error NotRecipient();
    error InvalidDuration();

    function createStream(address recipient, uint64 startTime, uint64 stopTime) external payable returns (uint256 id) {
        if (stopTime <= startTime || msg.value == 0) revert InvalidDuration();
        streams.push(
            Stream({
                sender: msg.sender,
                recipient: recipient,
                deposit: msg.value,
                startTime: startTime,
                stopTime: stopTime,
                withdrawn: 0
            })
        );
        id = streams.length - 1;
        emit StreamCreated(id, msg.sender, recipient);
    }

    function vested(uint256 id) public view returns (uint256) {
        Stream memory s = streams[id];
        if (block.timestamp <= s.startTime) return 0;
        if (block.timestamp >= s.stopTime) return s.deposit;
        return (s.deposit * (block.timestamp - s.startTime)) / (s.stopTime - s.startTime);
    }

    function withdraw(uint256 id) external {
        Stream storage s = streams[id];
        if (msg.sender != s.recipient) revert NotRecipient();
        uint256 amount = vested(id) - s.withdrawn;
        if (amount == 0) return;
        s.withdrawn += amount;
        (bool ok,) = s.recipient.call{value: amount}("");
        require(ok, "Transfer failed");
        emit Withdrawn(id, amount);
    }
}
