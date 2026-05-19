// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title BadgeRegistry
/// @notice Non-transferable ERC-1155 badges for achievements/quests.
/// @dev Admin defines badges and authorizes minters. All transfers revert.
contract BadgeRegistry is ERC1155, Ownable {
    struct Badge {
        string metadataURI; // ipfs://...
        address minter; // authorized minter
        bool exists;
    }

    uint256 private _nextBadgeId;

    mapping(uint256 => Badge) public badges;

    /// @notice For each user, list of badgeIds they hold (append-only, no dupes).
    mapping(address => uint256[]) private _badgesOf;

    event BadgeDefined(uint256 indexed badgeId, string metadataURI, address indexed minter);
    event BadgeMinterChanged(uint256 indexed badgeId, address indexed oldMinter, address indexed newMinter);
    event BadgeMinted(address indexed to, uint256 indexed badgeId);

    error BadgeNonTransferable();
    error BadgeDoesNotExist(uint256 badgeId);
    error NotAuthorizedMinter();
    error InvalidMinter();

    constructor(address initialOwner) ERC1155("") Ownable(initialOwner) {
        _nextBadgeId = 1;
    }

    /// @notice Define a new badge type. Owner-only.
    /// @param metadataURI Off-chain metadata pointer (typically ipfs://).
    /// @param minter Address allowed to mint this badge.
    /// @return badgeId The newly assigned badge id.
    function defineBadge(string calldata metadataURI, address minter) external onlyOwner returns (uint256 badgeId) {
        if (minter == address(0)) revert InvalidMinter();
        badgeId = _nextBadgeId;
        unchecked {
            _nextBadgeId = badgeId + 1;
        }
        badges[badgeId] = Badge({metadataURI: metadataURI, minter: minter, exists: true});
        emit BadgeDefined(badgeId, metadataURI, minter);
    }

    /// @notice Update authorized minter for a badge. Owner-only.
    function setBadgeMinter(uint256 badgeId, address newMinter) external onlyOwner {
        if (newMinter == address(0)) revert InvalidMinter();
        Badge storage b = badges[badgeId];
        if (!b.exists) revert BadgeDoesNotExist(badgeId);
        address old = b.minter;
        b.minter = newMinter;
        emit BadgeMinterChanged(badgeId, old, newMinter);
    }

    /// @notice Mint badge `badgeId` to `to`. Callable only by the registered minter.
    /// @dev Idempotent — minting again does nothing if user already has the badge.
    function mint(address to, uint256 badgeId) external {
        Badge storage b = badges[badgeId];
        if (!b.exists) revert BadgeDoesNotExist(badgeId);
        if (msg.sender != b.minter) revert NotAuthorizedMinter();
        if (balanceOf(to, badgeId) > 0) return; // idempotent
        _mint(to, badgeId, 1, "");
        _badgesOf[to].push(badgeId);
        emit BadgeMinted(to, badgeId);
    }

    /// @notice Returns true if `user` holds at least one of `badgeId`.
    function hasBadge(address user, uint256 badgeId) external view returns (bool) {
        return balanceOf(user, badgeId) > 0;
    }

    /// @notice Returns the list of badgeIds held by `user`.
    function badgesOf(address user) external view returns (uint256[] memory) {
        return _badgesOf[user];
    }

    /// @notice Per-token URI (overrides ERC1155 single-URI pattern).
    function uri(uint256 badgeId) public view override returns (string memory) {
        return badges[badgeId].metadataURI;
    }

    /// @dev Enforce non-transferable: only allow mint (from == 0) and admin burn (to == 0 from owner).
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values) internal override {
        // mint
        if (from == address(0)) {
            super._update(from, to, ids, values);
            return;
        }
        // burn by contract owner
        if (to == address(0) && msg.sender == owner()) {
            super._update(from, to, ids, values);
            return;
        }
        revert BadgeNonTransferable();
    }
}
