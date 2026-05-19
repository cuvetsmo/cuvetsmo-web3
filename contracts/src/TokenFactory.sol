// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {TokenImplementation} from "./TokenImplementation.sol";

/// @title TokenFactory
/// @notice Deploys ERC-20 clones (EIP-1167) of TokenImplementation.
/// @dev Rate-limited: max 5 tokens per address per rolling 24h window.
contract TokenFactory {
    using Clones for address;

    /// @notice Master implementation cloned by `createToken`.
    address public immutable implementation;

    /// @notice Maximum tokens an address can create per rolling 24h.
    uint256 public constant RATE_LIMIT = 5;
    uint256 public constant RATE_WINDOW = 1 days;

    /// @notice creator => list of tokens they created (newest at end)
    mapping(address => address[]) public tokensByCreator;

    /// @notice token address => creator
    mapping(address => address) public creatorOf;

    /// @notice For rate-limiting: array of mint timestamps per creator.
    /// @dev We use a sliding-window count rather than a full timestamp log to save gas.
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

    /// @notice Deploy a clone of TokenImplementation and initialize it.
    /// @param name ERC-20 name.
    /// @param symbol ERC-20 symbol.
    /// @param supply Initial supply minted to msg.sender (in wei, 18 decimals).
    /// @return token Address of the newly cloned token.
    function createToken(string calldata name, string calldata symbol, uint256 supply)
        external
        returns (address token)
    {
        if (bytes(name).length == 0) revert EmptyName();
        if (bytes(symbol).length == 0) revert EmptySymbol();
        _checkRateLimit(msg.sender);

        token = implementation.clone();
        TokenImplementation(token).initialize(name, symbol, supply, msg.sender);

        tokensByCreator[msg.sender].push(token);
        creatorOf[token] = msg.sender;
        _mintTimestamps[msg.sender].push(uint64(block.timestamp));

        emit TokenCreated(msg.sender, token, name, symbol, supply);
    }

    /// @notice Total count of tokens created by `creator`.
    function tokensCountOf(address creator) external view returns (uint256) {
        return tokensByCreator[creator].length;
    }

    /// @notice Count of tokens `creator` has minted within the current rate window.
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
                break; // older timestamps; ts is append-only so they're monotonically increasing
            }
        }
    }

    function _checkRateLimit(address creator) internal view {
        if (recentMintCount(creator) >= RATE_LIMIT) revert RateLimitExceeded();
    }
}
