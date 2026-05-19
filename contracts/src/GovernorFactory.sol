// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @title GovernorFactory
/// @notice STUB skeleton for governor deployment. Production governors require
///         per-token voting/quorum tuning + extensive audit — leaving as scaffold.
/// @dev Day-1 the UI can use this factory's address as a placeholder. The
///      `createGovernor` function reverts so consumers know it's unwired.
contract GovernorFactory {
    error NotImplemented();

    event GovernorRequested(address indexed creator, address indexed token, string name);

    /// @notice Tracks who's requested a governor (for waiting list / future deploy).
    mapping(address => uint256) public requestCount;

    /// @notice Stub. Emits a request event but does NOT deploy. Returns address(0).
    /// @dev Will be replaced by a real OZ Governor clone factory in Wave 3.
    function createGovernor(address token, string calldata name) external returns (address) {
        unchecked {
            requestCount[msg.sender]++;
        }
        emit GovernorRequested(msg.sender, token, name);
        // Stub — production version will return the deployed governor.
        return address(0);
    }

    /// @notice Forwarding name to advertise stub status to indexers.
    function version() external pure returns (string memory) {
        return "GovernorFactory:stub:v0";
    }
}
