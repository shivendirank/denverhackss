// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract ToolRegistry is Ownable, Pausable {
    struct Tool {
        address owner;
        string metadataURI;
        uint256 pricePerCallWei;
        bool active;
        uint256 createdAt;
    }

    mapping(bytes32 => Tool) public tools;

    event ToolRegistered(
        bytes32 indexed toolId,
        address indexed owner,
        uint256 price
    );
    event ToolUpdated(bytes32 indexed toolId, uint256 newPrice);
    event ToolDeactivated(bytes32 indexed toolId);

    modifier onlyToolOwner(bytes32 toolId) {
        require(tools[toolId].owner == msg.sender, "Not tool owner");
        _;
    }

    function registerTool(string calldata metadataURI, uint256 pricePerCallWei)
        external
        whenNotPaused
        returns (bytes32)
    {
        bytes32 toolId = keccak256(
            abi.encodePacked(msg.sender, metadataURI, block.timestamp)
        );

        require(tools[toolId].owner == address(0), "Tool already exists");

        tools[toolId] = Tool({
            owner: msg.sender,
            metadataURI: metadataURI,
            pricePerCallWei: pricePerCallWei,
            active: true,
            createdAt: block.timestamp
        });

        emit ToolRegistered(toolId, msg.sender, pricePerCallWei);
        return toolId;
    }

    function updatePricing(bytes32 toolId, uint256 newPrice)
        external
        onlyToolOwner(toolId)
    {
        require(tools[toolId].owner != address(0), "Tool not found");
        tools[toolId].pricePerCallWei = newPrice;
        emit ToolUpdated(toolId, newPrice);
    }

    function deactivateTool(bytes32 toolId) external onlyToolOwner(toolId) {
        require(tools[toolId].owner != address(0), "Tool not found");
        tools[toolId].active = false;
        emit ToolDeactivated(toolId);
    }

    function getTool(bytes32 toolId) external view returns (Tool memory) {
        return tools[toolId];
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
