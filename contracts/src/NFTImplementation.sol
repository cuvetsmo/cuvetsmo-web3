// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @title NFTImplementation
/// @notice Single-image ERC-721 collection cloned by NFTFactory and SBTFactory.
/// @dev `baseURI` + tokenId convention. Soulbound mode toggled at init time.
contract NFTImplementation is Initializable, ERC721Upgradeable, OwnableUpgradeable {
    using Strings for uint256;

    string private _baseTokenURI;
    uint256 private _nextTokenId;
    uint256 public maxSupply;
    bool public soulbound;

    error MaxSupplyReached();
    error SoulboundNonTransferable();

    event Minted(address indexed to, uint256 indexed tokenId);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initialize the cloned collection. Called once by factory.
    /// @param name_ ERC-721 name.
    /// @param symbol_ ERC-721 symbol.
    /// @param baseURI_ Base URI for tokenId metadata (e.g. ipfs://CID/).
    /// @param maxSupply_ Hard cap on mints (0 = unlimited).
    /// @param owner_ Receives minted tokens and is contract Ownable owner.
    /// @param soulbound_ If true, transfers revert.
    function initialize(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        uint256 maxSupply_,
        address owner_,
        bool soulbound_
    ) external initializer {
        __ERC721_init(name_, symbol_);
        __Ownable_init(owner_);
        _baseTokenURI = baseURI_;
        maxSupply = maxSupply_;
        soulbound = soulbound_;
        _nextTokenId = 1;
    }

    /// @notice Mint a token to `to`. Owner-only.
    function mint(address to) external onlyOwner returns (uint256 tokenId) {
        if (maxSupply != 0 && _nextTokenId > maxSupply) revert MaxSupplyReached();
        tokenId = _nextTokenId;
        unchecked {
            _nextTokenId = tokenId + 1;
        }
        _safeMint(to, tokenId);
        emit Minted(to, tokenId);
    }

    /// @notice Total count of tokens minted (including burned).
    function totalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    /// @notice Token URI = baseURI + tokenId.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return bytes(_baseTokenURI).length == 0 ? "" : string(abi.encodePacked(_baseTokenURI, tokenId.toString()));
    }

    /// @dev Soulbound enforcement.
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        if (soulbound) {
            address from = _ownerOf(tokenId);
            if (from != address(0) && to != address(0)) {
                revert SoulboundNonTransferable();
            }
        }
        return super._update(to, tokenId, auth);
    }
}
