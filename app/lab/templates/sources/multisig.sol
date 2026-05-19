// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title MiniMultisig
/// @notice Minimal m-of-n multisig wallet. Educational template — use Safe
///         (safe.global) for production treasuries.
contract MiniMultisig {
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public required;

    struct Tx {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
    }

    Tx[] public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmed;

    event Proposed(uint256 indexed txId, address indexed proposer, address to, uint256 value);
    event Confirmed(uint256 indexed txId, address indexed owner);
    event Executed(uint256 indexed txId);

    error NotOwner();
    error AlreadyConfirmed();
    error NotEnoughConfirmations();
    error AlreadyExecuted();
    error TxFailed();

    modifier onlyOwner() {
        if (!isOwner[msg.sender]) revert NotOwner();
        _;
    }

    constructor(address[] memory owners_, uint256 required_) {
        require(owners_.length > 0 && required_ > 0 && required_ <= owners_.length, "Invalid setup");
        for (uint256 i = 0; i < owners_.length; i++) {
            address o = owners_[i];
            require(o != address(0) && !isOwner[o], "Duplicate or zero owner");
            isOwner[o] = true;
            owners.push(o);
        }
        required = required_;
    }

    receive() external payable {}

    function propose(address to, uint256 value, bytes calldata data) external onlyOwner returns (uint256 txId) {
        transactions.push(Tx({to: to, value: value, data: data, executed: false, confirmations: 0}));
        txId = transactions.length - 1;
        emit Proposed(txId, msg.sender, to, value);
        _confirm(txId);
    }

    function confirm(uint256 txId) external onlyOwner {
        _confirm(txId);
    }

    function _confirm(uint256 txId) internal {
        if (confirmed[txId][msg.sender]) revert AlreadyConfirmed();
        confirmed[txId][msg.sender] = true;
        transactions[txId].confirmations += 1;
        emit Confirmed(txId, msg.sender);
    }

    function execute(uint256 txId) external onlyOwner {
        Tx storage t = transactions[txId];
        if (t.executed) revert AlreadyExecuted();
        if (t.confirmations < required) revert NotEnoughConfirmations();
        t.executed = true;
        (bool ok,) = t.to.call{value: t.value}(t.data);
        if (!ok) revert TxFailed();
        emit Executed(txId);
    }

    function txCount() external view returns (uint256) {
        return transactions.length;
    }
}
