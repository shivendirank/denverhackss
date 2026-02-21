// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Escrow is Ownable, Pausable {
    mapping(address => uint256) public agentBalances;
    mapping(address => uint256) public ownerEarnings;

    address public relayer;

    event Deposited(address indexed agent, uint256 amount);
    event Debited(address indexed agent, address indexed owner, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);
    event RelayerUpdated(address indexed newRelayer);

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
        emit RelayerUpdated(_newRelayer);
    }

    function deposit() external payable whenNotPaused {
        require(msg.value > 0, "No deposit");
        agentBalances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function debit(
        address agent,
        address toolOwner,
        uint256 amount
    ) external onlyRelayer {
        require(agentBalances[agent] >= amount, "Insufficient balance");

        agentBalances[agent] -= amount;
        ownerEarnings[toolOwner] += amount;

        emit Debited(agent, toolOwner, amount);
    }

    function withdraw() external whenNotPaused {
        uint256 amount = agentBalances[msg.sender];
        if (amount == 0) {
            amount = ownerEarnings[msg.sender];
            require(amount > 0, "No balance to withdraw");
            ownerEarnings[msg.sender] = 0;
        } else {
            agentBalances[msg.sender] = 0;
        }

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");

        emit Withdrawn(msg.sender, amount);
    }

    function emergencyPause() external onlyOwner {
        _pause();
    }

    function emergencyUnpause() external onlyOwner {
        _unpause();
    }
}
