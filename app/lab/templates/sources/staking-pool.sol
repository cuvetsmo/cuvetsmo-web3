// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

/// @title StakingPool
/// @notice Stake an ERC-20 token, earn linear rewards over time at a fixed rate.
contract StakingPool {
    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardToken;
    uint256 public immutable rewardRatePerSecond;

    mapping(address => uint256) public staked;
    mapping(address => uint256) public lastUpdate;
    mapping(address => uint256) public accrued;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event Claimed(address indexed user, uint256 amount);

    error ZeroAmount();
    error InsufficientStake();

    constructor(address stakingToken_, address rewardToken_, uint256 rewardRatePerSecond_) {
        stakingToken = IERC20(stakingToken_);
        rewardToken = IERC20(rewardToken_);
        rewardRatePerSecond = rewardRatePerSecond_;
    }

    function pendingRewards(address user) public view returns (uint256) {
        uint256 elapsed = block.timestamp - lastUpdate[user];
        return accrued[user] + (staked[user] * elapsed * rewardRatePerSecond) / 1e18;
    }

    function _settle(address user) internal {
        accrued[user] = pendingRewards(user);
        lastUpdate[user] = block.timestamp;
    }

    function stake(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        _settle(msg.sender);
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        staked[msg.sender] += amount;
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        if (staked[msg.sender] < amount) revert InsufficientStake();
        _settle(msg.sender);
        staked[msg.sender] -= amount;
        require(stakingToken.transfer(msg.sender, amount), "Transfer failed");
        emit Withdrawn(msg.sender, amount);
    }

    function claim() external {
        _settle(msg.sender);
        uint256 amount = accrued[msg.sender];
        accrued[msg.sender] = 0;
        if (amount > 0) {
            require(rewardToken.transfer(msg.sender, amount), "Reward transfer failed");
            emit Claimed(msg.sender, amount);
        }
    }
}
