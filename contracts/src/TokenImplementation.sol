// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ERC20BurnableUpgradeable} from
    "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/// @title TokenImplementation
/// @notice ERC-20 master implementation cloned via EIP-1167 minimal proxies by TokenFactory.
/// @dev Initializer pattern (not constructor) so clones work.
contract TokenImplementation is Initializable, ERC20Upgradeable, OwnableUpgradeable, ERC20BurnableUpgradeable {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initialize the cloned token. Called once by TokenFactory.
    /// @param name ERC-20 name.
    /// @param symbol ERC-20 symbol.
    /// @param supply Initial supply minted to owner (in wei, 18 decimals).
    /// @param owner Address that receives supply and becomes Ownable owner.
    function initialize(string memory name, string memory symbol, uint256 supply, address owner) external initializer {
        __ERC20_init(name, symbol);
        __Ownable_init(owner);
        __ERC20Burnable_init();
        if (supply > 0) {
            _mint(owner, supply);
        }
    }
}
