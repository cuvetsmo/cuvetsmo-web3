// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {NFTImplementation} from "./NFTImplementation.sol";

/// @title NFTFactory
/// @notice Deploys transferable ERC-721 collection clones (EIP-1167).
contract NFTFactory {
    using Clones for address;

    address public immutable implementation;
    uint256 public constant RATE_LIMIT = 5;
    uint256 public constant RATE_WINDOW = 1 days;

    mapping(address => address[]) public collectionsByCreator;
    mapping(address => address) public creatorOf;
    mapping(address => uint64[]) private _mintTimestamps;

    event CollectionCreated(
        address indexed creator,
        address indexed collection,
        string name,
        string symbol,
        string baseURI,
        uint256 maxSupply,
        bool soulbound
    );

    error RateLimitExceeded();
    error EmptyName();
    error EmptySymbol();

    constructor(address implementation_) {
        implementation = implementation_;
    }

    /// @notice Create a transferable ERC-721 collection.
    function createCollection(
        string calldata name,
        string calldata symbol,
        string calldata baseURI,
        uint256 maxSupply
    ) external returns (address collection) {
        collection = _create(name, symbol, baseURI, maxSupply, false);
    }

    function _create(
        string memory name,
        string memory symbol,
        string memory baseURI,
        uint256 maxSupply,
        bool soulbound
    ) internal returns (address collection) {
        if (bytes(name).length == 0) revert EmptyName();
        if (bytes(symbol).length == 0) revert EmptySymbol();
        if (recentMintCount(msg.sender) >= RATE_LIMIT) revert RateLimitExceeded();

        collection = implementation.clone();
        NFTImplementation(collection).initialize(name, symbol, baseURI, maxSupply, msg.sender, soulbound);

        collectionsByCreator[msg.sender].push(collection);
        creatorOf[collection] = msg.sender;
        _mintTimestamps[msg.sender].push(uint64(block.timestamp));

        emit CollectionCreated(msg.sender, collection, name, symbol, baseURI, maxSupply, soulbound);
    }

    function collectionsCountOf(address creator) external view returns (uint256) {
        return collectionsByCreator[creator].length;
    }

    function recentMintCount(address creator) public view returns (uint256 count) {
        uint64[] storage ts = _mintTimestamps[creator];
        uint256 threshold = block.timestamp > RATE_WINDOW ? block.timestamp - RATE_WINDOW : 0;
        for (uint256 i = ts.length; i > 0;) {
            unchecked {
                i--;
            }
            if (ts[i] >= threshold) {
                unchecked {
                    count++;
                }
            } else {
                break;
            }
        }
    }
}
