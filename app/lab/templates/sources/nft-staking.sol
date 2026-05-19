// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC721 {
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function ownerOf(uint256 tokenId) external view returns (address);
}

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
}

/// @title NFTStakingForRewards
/// @notice Stake an ERC-721, earn ERC-20 rewards at a fixed rate per second.
contract NFTStakingForRewards {
    IERC721 public immutable nft;
    IERC20 public immutable rewardToken;
    uint256 public immutable rewardPerSecond;

    struct Stake {
        address owner;
        uint64 since;
        uint256 accrued;
    }

    mapping(uint256 => Stake) public stakes;

    event Staked(address indexed owner, uint256 indexed tokenId);
    event Unstaked(address indexed owner, uint256 indexed tokenId);
    event Claimed(address indexed owner, uint256 indexed tokenId, uint256 amount);

    error NotStaker();
    error NotOwnerOfNFT();

    constructor(address nft_, address rewardToken_, uint256 rewardPerSecond_) {
        nft = IERC721(nft_);
        rewardToken = IERC20(rewardToken_);
        rewardPerSecond = rewardPerSecond_;
    }

    function pending(uint256 tokenId) public view returns (uint256) {
        Stake memory s = stakes[tokenId];
        if (s.owner == address(0)) return 0;
        return s.accrued + (block.timestamp - s.since) * rewardPerSecond;
    }

    function stake(uint256 tokenId) external {
        if (nft.ownerOf(tokenId) != msg.sender) revert NotOwnerOfNFT();
        nft.safeTransferFrom(msg.sender, address(this), tokenId);
        stakes[tokenId] = Stake({owner: msg.sender, since: uint64(block.timestamp), accrued: 0});
        emit Staked(msg.sender, tokenId);
    }

    function unstake(uint256 tokenId) external {
        Stake storage s = stakes[tokenId];
        if (s.owner != msg.sender) revert NotStaker();
        uint256 amount = pending(tokenId);
        delete stakes[tokenId];
        nft.safeTransferFrom(address(this), msg.sender, tokenId);
        if (amount > 0) {
            require(rewardToken.transfer(msg.sender, amount), "Reward transfer failed");
        }
        emit Unstaked(msg.sender, tokenId);
    }

    function claim(uint256 tokenId) external {
        Stake storage s = stakes[tokenId];
        if (s.owner != msg.sender) revert NotStaker();
        uint256 amount = pending(tokenId);
        s.accrued = 0;
        s.since = uint64(block.timestamp);
        if (amount > 0) {
            require(rewardToken.transfer(msg.sender, amount), "Reward transfer failed");
            emit Claimed(msg.sender, tokenId, amount);
        }
    }
}
