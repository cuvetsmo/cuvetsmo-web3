// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

/// @title VetSBTCard
/// @notice Soulbound (non-transferable) ERC-721 identity card for CUVET nisits.
/// @dev One card per wallet. Token URI is fully on-chain SVG.
contract VetSBTCard is ERC721, Ownable, Pausable {
    struct CardData {
        uint256 orgId;
        uint16 yearAdmitted;
        bytes32 studentIdHash;
        uint8 facultyCode;
        uint8 departmentCode;
        uint64 mintedAt;
    }

    uint256 private _nextTokenId;

    mapping(address => uint256) public tokenIdOf; // wallet => tokenId (0 == none)
    mapping(uint256 => CardData) public cardData;

    event CardClaimed(
        address indexed wallet,
        uint256 indexed tokenId,
        uint256 indexed orgId,
        uint16 yearAdmitted,
        uint8 facultyCode,
        uint8 departmentCode
    );

    error AlreadyClaimed();
    error SoulboundNonTransferable();
    error InvalidYear();

    constructor(address initialOwner) ERC721("CUVET SMO Vet Card", "VETSBT") Ownable(initialOwner) {
        _nextTokenId = 1; // tokenId 0 reserved as "none"
    }

    /// @notice Claim a soulbound card. One per wallet.
    /// @param orgId Organization (e.g. 1 for CUVET)
    /// @param yearAdmitted Buddhist Era year admitted (e.g. 2566)
    /// @param studentIdHash keccak256 of off-chain student id (privacy-preserving)
    /// @param facultyCode Faculty enum code (e.g. 1 = Vet)
    /// @param departmentCode Department enum code (e.g. 1 = SMO board, 2 = student)
    function claim(
        uint256 orgId,
        uint16 yearAdmitted,
        bytes32 studentIdHash,
        uint8 facultyCode,
        uint8 departmentCode
    ) external whenNotPaused returns (uint256 tokenId) {
        if (tokenIdOf[msg.sender] != 0) revert AlreadyClaimed();
        // sanity: yearAdmitted between 2500 and 2700 (Buddhist Era)
        if (yearAdmitted < 2500 || yearAdmitted > 2700) revert InvalidYear();

        tokenId = _nextTokenId;
        unchecked {
            _nextTokenId = tokenId + 1;
        }

        tokenIdOf[msg.sender] = tokenId;
        cardData[tokenId] = CardData({
            orgId: orgId,
            yearAdmitted: yearAdmitted,
            studentIdHash: studentIdHash,
            facultyCode: facultyCode,
            departmentCode: departmentCode,
            mintedAt: uint64(block.timestamp)
        });

        _safeMint(msg.sender, tokenId);

        emit CardClaimed(msg.sender, tokenId, orgId, yearAdmitted, facultyCode, departmentCode);
    }

    /// @notice Pause claiming in case of admin emergency.
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Resume claiming.
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @dev Override to enforce soulbound: only allow mint (from == 0) and admin burn (to == 0).
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        // mint allowed
        if (from == address(0)) {
            return super._update(to, tokenId, auth);
        }
        // burn allowed (only by owner of contract)
        if (to == address(0) && auth == owner()) {
            // also clear tokenIdOf mapping so wallet can re-claim if owner burns
            delete tokenIdOf[from];
            return super._update(to, tokenId, auth);
        }
        revert SoulboundNonTransferable();
    }

    /// @notice ABI-friendly wrapper struct exposed by `cardOf(addr)`.
    /// @dev Includes `tokenId` so consumers don't need a separate read.
    struct CardView {
        uint256 tokenId;
        uint256 orgId;
        uint16 yearAdmitted;
        bytes32 studentIdHash;
        uint8 facultyCode;
        uint8 departmentCode;
        uint64 mintedAt;
    }

    /// @notice Returns the card struct for `owner`, or a zero-tokenId struct if no card.
    /// @dev Designed to match the front-end's expected `cardOf(addr)` shape.
    function cardOf(address owner) external view returns (CardView memory) {
        uint256 tokenId = tokenIdOf[owner];
        if (tokenId == 0) {
            return CardView(0, 0, 0, bytes32(0), 0, 0, 0);
        }
        CardData memory d = cardData[tokenId];
        return CardView(tokenId, d.orgId, d.yearAdmitted, d.studentIdHash, d.facultyCode, d.departmentCode, d.mintedAt);
    }

    /// @notice On-chain SVG token URI.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        CardData memory d = cardData[tokenId];

        string memory svg = _buildSvg(d, tokenId);
        string memory json = string(
            abi.encodePacked(
                '{"name":"CUVET SMO Card #',
                Strings.toString(tokenId),
                '","description":"Soulbound identity card for CUVET nisits. web3.cuvetsmo.com","image":"data:image/svg+xml;base64,',
                Base64.encode(bytes(svg)),
                '","attributes":[',
                '{"trait_type":"Org","value":"',
                Strings.toString(d.orgId),
                '"},{"trait_type":"Year Admitted","value":"',
                Strings.toString(d.yearAdmitted),
                '"},{"trait_type":"Faculty","value":"',
                Strings.toString(d.facultyCode),
                '"},{"trait_type":"Department","value":"',
                Strings.toString(d.departmentCode),
                '"}]}'
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }

    function _buildSvg(CardData memory d, uint256 tokenId) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250">',
                '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">',
                '<stop offset="0" stop-color="#0369a1"/><stop offset="1" stop-color="#0c4a6e"/>',
                "</linearGradient></defs>",
                '<rect width="400" height="250" rx="16" fill="url(#g)"/>',
                '<text x="24" y="44" fill="#e0f2fe" font-family="sans-serif" font-size="20" font-weight="700">CUVET SMO ID</text>',
                '<text x="24" y="68" fill="#bae6fd" font-family="sans-serif" font-size="12">web3.cuvetsmo.com</text>',
                '<text x="24" y="140" fill="#ffffff" font-family="sans-serif" font-size="14">Year Admitted: ',
                Strings.toString(d.yearAdmitted),
                "</text>",
                '<text x="24" y="164" fill="#ffffff" font-family="sans-serif" font-size="14">Faculty: ',
                Strings.toString(d.facultyCode),
                "</text>",
                '<text x="24" y="188" fill="#ffffff" font-family="sans-serif" font-size="14">Department: ',
                Strings.toString(d.departmentCode),
                "</text>",
                '<text x="24" y="220" fill="#bae6fd" font-family="sans-serif" font-size="11">Card #',
                Strings.toString(tokenId),
                " - SOULBOUND",
                "</text>",
                "</svg>"
            )
        );
    }
}
