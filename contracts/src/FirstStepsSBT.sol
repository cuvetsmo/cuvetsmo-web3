// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

/// @title FirstStepsSBT
/// @notice Soulbound badge for completing Wallet 101 ("First Steps"). One per wallet, free.
contract FirstStepsSBT is ERC721 {
    uint256 private _nextTokenId;

    mapping(address => uint256) public tokenOf; // wallet => tokenId (0 == none)
    mapping(uint256 => uint64) public mintedAt; // tokenId => mint timestamp

    event FirstStepsClaimed(address indexed wallet, uint256 indexed tokenId, uint64 mintedAt);

    error AlreadyClaimed();
    error SoulboundNonTransferable();

    constructor() ERC721("First Steps", "FIRST") {
        _nextTokenId = 1;
    }

    /// @notice Returns true if `user` has claimed the First Steps badge.
    function hasClaimed(address user) external view returns (bool) {
        return tokenOf[user] != 0;
    }

    /// @notice Mint badge to caller. One per wallet.
    function claim() external returns (uint256 tokenId) {
        if (tokenOf[msg.sender] != 0) revert AlreadyClaimed();
        tokenId = _nextTokenId;
        unchecked {
            _nextTokenId = tokenId + 1;
        }
        tokenOf[msg.sender] = tokenId;
        mintedAt[tokenId] = uint64(block.timestamp);
        _safeMint(msg.sender, tokenId);
        emit FirstStepsClaimed(msg.sender, tokenId, uint64(block.timestamp));
    }

    /// @dev Soulbound: revert all transfers, only allow mint.
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from == address(0)) {
            return super._update(to, tokenId, auth);
        }
        revert SoulboundNonTransferable();
    }

    /// @notice On-chain SVG token URI.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        uint64 ts = mintedAt[tokenId];

        string memory svg = string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">',
                '<defs><radialGradient id="g" cx="0.5" cy="0.5" r="0.6">',
                '<stop offset="0" stop-color="#bae6fd"/><stop offset="1" stop-color="#0369a1"/>',
                "</radialGradient></defs>",
                '<rect width="400" height="400" rx="24" fill="url(#g)"/>',
                '<text x="200" y="160" fill="#ffffff" text-anchor="middle" font-family="sans-serif" font-size="32" font-weight="700">First Steps</text>',
                '<text x="200" y="210" fill="#e0f2fe" text-anchor="middle" font-family="sans-serif" font-size="14">web3.cuvetsmo.com</text>',
                '<text x="200" y="260" fill="#ffffff" text-anchor="middle" font-family="sans-serif" font-size="13">Minted: ',
                Strings.toString(ts),
                "</text>",
                '<text x="200" y="320" fill="#bae6fd" text-anchor="middle" font-family="sans-serif" font-size="11">SOULBOUND - Wallet 101 Complete</text>',
                "</svg>"
            )
        );

        string memory json = string(
            abi.encodePacked(
                '{"name":"First Steps #',
                Strings.toString(tokenId),
                '","description":"Awarded for completing Wallet 101 at web3.cuvetsmo.com","image":"data:image/svg+xml;base64,',
                Base64.encode(bytes(svg)),
                '","attributes":[{"trait_type":"MintedAt","value":"',
                Strings.toString(ts),
                '"}]}'
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }
}
