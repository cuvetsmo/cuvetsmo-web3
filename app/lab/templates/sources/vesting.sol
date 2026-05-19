// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address) external view returns (uint256);
}

/// @title LinearVesting
/// @notice Lock ERC-20 tokens for a beneficiary that vests linearly between
///         `start` and `start + duration` with an optional cliff.
contract LinearVesting {
    IERC20 public immutable token;
    address public immutable beneficiary;
    uint64 public immutable start;
    uint64 public immutable cliff;
    uint64 public immutable duration;
    uint256 public released;

    event Released(uint256 amount);

    error NotBeneficiary();

    constructor(address token_, address beneficiary_, uint64 start_, uint64 cliff_, uint64 duration_) {
        token = IERC20(token_);
        beneficiary = beneficiary_;
        start = start_;
        cliff = cliff_;
        duration = duration_;
    }

    function vestedAmount(uint256 totalLocked) public view returns (uint256) {
        if (block.timestamp < start + cliff) return 0;
        if (block.timestamp >= start + duration) return totalLocked;
        return (totalLocked * (block.timestamp - start)) / duration;
    }

    function release() external {
        if (msg.sender != beneficiary) revert NotBeneficiary();
        uint256 totalLocked = token.balanceOf(address(this)) + released;
        uint256 amount = vestedAmount(totalLocked) - released;
        if (amount > 0) {
            released += amount;
            require(token.transfer(beneficiary, amount), "Transfer failed");
            emit Released(amount);
        }
    }
}
