// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title OrgRegistry
/// @notice Multi-tenant registry for organizations (e.g. CUVET, future faculties).
/// @dev Owner-only registration. orgId 1 pre-registered as CUVET in constructor.
contract OrgRegistry is Ownable {
    struct OrgConfig {
        string name;
        address admin;
        bool active;
        uint64 createdAt;
    }

    /// @notice Monotonically increasing org counter. orgId 0 is reserved (means "no org").
    uint256 public nextOrgId;

    mapping(uint256 => OrgConfig) public orgs;

    event OrgRegistered(uint256 indexed orgId, string name, address indexed admin);
    event OrgAdminChanged(uint256 indexed orgId, address indexed oldAdmin, address indexed newAdmin);
    event OrgActiveChanged(uint256 indexed orgId, bool active);

    error OrgDoesNotExist(uint256 orgId);
    error InvalidAdmin();
    error EmptyName();

    constructor(address initialOwner) Ownable(initialOwner) {
        // Reserve orgId 0 (zero == "no org") then pre-register CUVET at orgId 1.
        nextOrgId = 1;
        _registerOrg("CUVET", initialOwner);
    }

    /// @notice Register a new organization. Owner-only.
    /// @param name Human-readable organization name.
    /// @param admin Address that will administer this org's products.
    /// @return orgId The newly assigned organization id.
    function registerOrg(string calldata name, address admin) external onlyOwner returns (uint256 orgId) {
        return _registerOrg(name, admin);
    }

    function _registerOrg(string memory name, address admin) internal returns (uint256 orgId) {
        if (admin == address(0)) revert InvalidAdmin();
        if (bytes(name).length == 0) revert EmptyName();

        orgId = nextOrgId;
        unchecked {
            nextOrgId = orgId + 1;
        }

        orgs[orgId] = OrgConfig({name: name, admin: admin, active: true, createdAt: uint64(block.timestamp)});

        emit OrgRegistered(orgId, name, admin);
    }

    /// @notice Change the admin of an existing org. Owner-only.
    function setOrgAdmin(uint256 orgId, address newAdmin) external onlyOwner {
        if (newAdmin == address(0)) revert InvalidAdmin();
        OrgConfig storage cfg = orgs[orgId];
        if (cfg.createdAt == 0) revert OrgDoesNotExist(orgId);
        address oldAdmin = cfg.admin;
        cfg.admin = newAdmin;
        emit OrgAdminChanged(orgId, oldAdmin, newAdmin);
    }

    /// @notice Activate/deactivate an organization. Owner-only.
    function setOrgActive(uint256 orgId, bool active) external onlyOwner {
        OrgConfig storage cfg = orgs[orgId];
        if (cfg.createdAt == 0) revert OrgDoesNotExist(orgId);
        cfg.active = active;
        emit OrgActiveChanged(orgId, active);
    }

    /// @notice Returns true if orgId exists and is active.
    function isActive(uint256 orgId) external view returns (bool) {
        OrgConfig storage cfg = orgs[orgId];
        return cfg.createdAt != 0 && cfg.active;
    }

    /// @notice Returns the admin of a given org, or zero if it does not exist.
    function adminOf(uint256 orgId) external view returns (address) {
        return orgs[orgId].admin;
    }
}
