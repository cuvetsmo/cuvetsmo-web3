/**
 * Static snippets of contract source code with Thai-language inline notes
 * for the "Inspect" mode of LabModeSwitcher.
 *
 * Each snippet is the actual Solidity source (or a faithful condensed version)
 * with extra Thai comments prefixed `// 🇹🇭` that are NOT in the deployed
 * contract — they only exist here for learning purposes.
 *
 * Wave 3 · Education Specialist.
 *
 * Updating these strings has no security impact; the deployed contract is
 * read from contracts/src/*.sol at deploy time.
 */

export const TOKEN_FACTORY_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {TokenImplementation} from "./TokenImplementation.sol";

// 🇹🇭 TokenFactory = โรงงานออก ERC-20 ใหม่
// 🇹🇭 ใช้ EIP-1167 minimal proxy → deploy ถูกกว่า ~40 เท่า
contract TokenFactory {
    using Clones for address;

    // 🇹🇭 implementation = template ของ ERC-20 ที่ clone ทุกครั้ง
    address public immutable implementation;

    // 🇹🇭 rate limit ป้องกัน spam: 1 wallet สร้างได้สูงสุด 5 token / 24h
    uint256 public constant RATE_LIMIT = 5;
    uint256 public constant RATE_WINDOW = 1 days;

    mapping(address => address[]) public tokensByCreator;
    mapping(address => address) public creatorOf;
    mapping(address => uint64[]) private _mintTimestamps;

    event TokenCreated(
        address indexed creator,
        address indexed token,
        string name,
        string symbol,
        uint256 supply
    );

    error RateLimitExceeded();
    error EmptyName();
    error EmptySymbol();

    constructor(address implementation_) {
        implementation = implementation_;
    }

    // 🇹🇭 function หลัก — user เรียก createToken ปุ๊บได้ contract ใหม่ทันที
    function createToken(
        string calldata name,
        string calldata symbol,
        uint256 supply
    ) external returns (address token) {
        if (bytes(name).length == 0) revert EmptyName();
        if (bytes(symbol).length == 0) revert EmptySymbol();
        _checkRateLimit(msg.sender);

        // 🇹🇭 .clone() = deploy proxy ที่ delegatecall ไปหา implementation
        token = implementation.clone();

        // 🇹🇭 initialize ครั้งเดียว set name/symbol/supply + mint ทั้งหมดให้ msg.sender
        TokenImplementation(token).initialize(name, symbol, supply, msg.sender);

        tokensByCreator[msg.sender].push(token);
        creatorOf[token] = msg.sender;
        _mintTimestamps[msg.sender].push(uint64(block.timestamp));

        emit TokenCreated(msg.sender, token, name, symbol, supply);
    }

    function tokensCountOf(address creator) external view returns (uint256) {
        return tokensByCreator[creator].length;
    }

    // 🇹🇭 นับว่าทำมากี่ token ในหน้าต่างเวลา 24h ล่าสุด
    function recentMintCount(address creator) public view returns (uint256 count) {
        uint64[] storage ts = _mintTimestamps[creator];
        uint256 threshold = block.timestamp > RATE_WINDOW
            ? block.timestamp - RATE_WINDOW
            : 0;
        // 🇹🇭 ไล่นับจากท้าย — ts append-only เลย break ออกได้ทันทีเมื่อเจอ entry เก่า
        for (uint256 i = ts.length; i > 0;) {
            unchecked { i--; }
            if (ts[i] >= threshold) {
                unchecked { count++; }
            } else {
                break;
            }
        }
    }

    function _checkRateLimit(address creator) internal view {
        if (recentMintCount(creator) >= RATE_LIMIT) revert RateLimitExceeded();
    }
}`;

export const NFT_FACTORY_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {NFTImplementation} from "./NFTImplementation.sol";

// 🇹🇭 NFTFactory = โรงงานออก collection ERC-721 ใหม่
contract NFTFactory {
    using Clones for address;

    address public immutable implementation;

    mapping(address => address[]) public collectionsByCreator;
    mapping(address => address) public creatorOf;

    event CollectionCreated(
        address indexed creator,
        address indexed collection,
        string name,
        string symbol,
        string baseURI
    );

    error EmptyName();
    error EmptySymbol();

    constructor(address implementation_) {
        implementation = implementation_;
    }

    // 🇹🇭 user เรียก createCollection แล้วได้ contract NFT ใหม่
    // 🇹🇭 baseURI = ipfs://Qmxxx/ (metadata อยู่ที่ baseURI + tokenId + .json)
    function createCollection(
        string calldata name,
        string calldata symbol,
        string calldata baseURI
    ) external returns (address collection) {
        if (bytes(name).length == 0) revert EmptyName();
        if (bytes(symbol).length == 0) revert EmptySymbol();

        collection = implementation.clone();
        NFTImplementation(collection).initialize(name, symbol, baseURI, msg.sender);

        collectionsByCreator[msg.sender].push(collection);
        creatorOf[collection] = msg.sender;

        emit CollectionCreated(msg.sender, collection, name, symbol, baseURI);
    }
}`;

export const SBT_FACTORY_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

// 🇹🇭 SBTFactory = โรงงานออก Soulbound Token collection
// 🇹🇭 Soulbound = NFT ที่ disable transfer → ผูกกับ wallet ถาวร
contract SBTFactory {
    using Clones for address;

    address public immutable implementation;

    event SBTCreated(
        address indexed creator,
        address indexed collection,
        string name
    );

    constructor(address implementation_) {
        implementation = implementation_;
    }

    // 🇹🇭 transfer function ถูก override ให้ revert
    // 🇹🇭 → user mint ได้, burn ได้, แต่โอนหาคนอื่นไม่ได้
    function createSBT(
        string calldata name,
        string calldata symbol,
        string calldata baseURI
    ) external returns (address collection) {
        collection = implementation.clone();
        // 🇹🇭 initialize logic ใน SBTImplementation
        // SBTImplementation(collection).initialize(name, symbol, baseURI, msg.sender);
        emit SBTCreated(msg.sender, collection, name);
    }
}`;
