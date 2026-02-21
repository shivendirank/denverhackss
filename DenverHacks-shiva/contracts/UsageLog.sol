// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract UsageLog is Ownable {
    address public relayer;

    event UsageLogged(
        bytes32 indexed agentId,
        bytes32 indexed toolId,
        uint256 timestamp,
        bytes32 paramsHash,
        uint256 cost
    );

    modifier onlyRelayer() {
        require(msg.sender == relayer, "Only relayer");
        _;
    }

    constructor(address _relayer) {
        require(_relayer != address(0), "Invalid relayer");
        relayer = _relayer;
    }

    function setRelayer(address _newRelayer) external onlyOwner {
        require(_newRelayer != address(0), "Invalid relayer");
        relayer = _newRelayer;
    }

    function logUsage(
        bytes32 agentId,
        bytes32 toolId,
        bytes32 paramsHash,
        uint256 cost
    ) external onlyRelayer {
        // Block timestamp is always current, never accept as parameter
        emit UsageLogged(agentId, toolId, block.timestamp, paramsHash, cost);
    }
}
