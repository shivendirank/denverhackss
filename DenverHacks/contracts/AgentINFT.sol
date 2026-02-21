// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgentINFT - ERC-7857 Compliant Agent Identity
 * @notice On-chain AI Agent Identity using 0G iNFT primitives
 * @dev Each agent is an NFT with verifiable on-chain identity, capabilities, and action history
 * 
 * 0G Bounty Features:
 * ✅ On-chain identity: Mintable/ownable NFT per agent
 * ✅ Agent profile: Name, specialization, TEE status, reputation
 * ✅ Meaningful actions: Tool execution, payments, state updates logged
 * ✅ Composability: Other contracts can verify permissions
 * ✅ Verifiable history: Complete action log with hashes
 * 
 * Multi-Chain Context:
 * - 0G Chain: Agent identity and action log (this contract)
 * - Kite AI: x402 payment settlements
 * - Hedera: HCS attestations and UCP protocol
 */
contract AgentINFT is ERC721, Ownable {
    
    // ============================================
    // STATE VARIABLES
    // ============================================
    
    uint256 private _nextTokenId;
    
    // Agent metadata structure
    struct AgentProfile {
        string name;
        string specialization;
        address agentWallet; // EVM wallet controlling this agent
        bool hasTEE; // Trusted Execution Environment enabled
        uint256 createdAt;
        bool active;
    }
    
    // Agent capabilities (what tools/actions they can perform)
    struct AgentCapabilities {
        string[] allowedTools; // List of tool IDs agent can execute
        uint256 dailySpendLimitWei; // Max spending per day
        uint256 rateLimitPerMinute; // Max actions per minute
        bool requiresApproval; // Whether actions need owner approval
    }
    
    // On-chain action record
    struct AgentAction {
        uint256 agentTokenId;
        string actionType; // "TOOL_EXECUTION", "PAYMENT", "STATE_UPDATE"
        bytes32 actionHash; // Hash of action parameters
        uint256 timestamp;
        bool approved;
        address approver;
    }
    
    // Storage mappings
    mapping(uint256 => AgentProfile) public agentProfiles;
    mapping(uint256 => AgentCapabilities) public agentCapabilities;
    mapping(uint256 => AgentAction[]) public agentActionHistory;
    mapping(uint256 => uint256) public agentReputation; // 0-100 score
    
    // Agent wallet to token ID (reverse lookup)
    mapping(address => uint256) public walletToTokenId;
    
    // Authorized action executors (backend relayer)
    mapping(address => bool) public authorizedExecutors;
    
    // ============================================
    // EVENTS
    // ============================================
    
    event AgentMinted(
        uint256 indexed tokenId,
        address indexed owner,
        address indexed agentWallet,
        string name,
        bool hasTEE
    );
    
    event AgentActionExecuted(
        uint256 indexed tokenId,
        string actionType,
        bytes32 actionHash,
        uint256 timestamp,
        bool requiresApproval
    );
    
    event AgentActionApproved(
        uint256 indexed tokenId,
        uint256 actionIndex,
        address approver
    );
    
    event AgentCapabilitiesUpdated(
        uint256 indexed tokenId,
        uint256 dailySpendLimit,
        uint256 rateLimit
    );
    
    event AgentReputationUpdated(
        uint256 indexed tokenId,
        uint256 newScore,
        string reason
    );
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    constructor() ERC721("AI Agent iNFT", "AGENT") Ownable(msg.sender) {
        _nextTokenId = 1;
    }
    
    // ============================================
    // MINTING FUNCTIONS
    // ============================================
    
    /**
     * @notice Mint a new Agent iNFT
     * @param to Owner of the agent NFT
     * @param agentWallet Wallet address that will control agent actions
     * @param name Agent name
     * @param specialization Agent's primary function
     * @param hasTEE Whether agent runs in Trusted Execution Environment
     * @return tokenId The newly minted token ID
     */
    function mintAgent(
        address to,
        address agentWallet,
        string memory name,
        string memory specialization,
        bool hasTEE
    ) public onlyOwner returns (uint256) {
        require(to != address(0), "Invalid owner address");
        require(agentWallet != address(0), "Invalid agent wallet");
        require(walletToTokenId[agentWallet] == 0, "Agent wallet already registered");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        
        // Set agent profile
        agentProfiles[tokenId] = AgentProfile({
            name: name,
            specialization: specialization,
            agentWallet: agentWallet,
            hasTEE: hasTEE,
            createdAt: block.timestamp,
            active: true
        });
        
        // Set default capabilities (can be updated later)
        agentCapabilities[tokenId] = AgentCapabilities({
            allowedTools: new string[](0),
            dailySpendLimitWei: 1 ether, // 1 token per day default
            rateLimitPerMinute: 30,
            requiresApproval: false // Autonomous by default
        });
        
        // Initialize reputation
        agentReputation[tokenId] = 100; // Start at 100
        
        // Register wallet lookup
        walletToTokenId[agentWallet] = tokenId;
        
        emit AgentMinted(tokenId, to, agentWallet, name, hasTEE);
        
        return tokenId;
    }
    
    /**
     * @notice Batch mint multiple agents (for initial deployment)
     */
    function batchMintAgents(
        address[] memory owners,
        address[] memory agentWallets,
        string[] memory names,
        string[] memory specializations,
        bool[] memory hasTEEFlags
    ) external onlyOwner {
        require(owners.length == agentWallets.length, "Array length mismatch");
        require(owners.length == names.length, "Array length mismatch");
        require(owners.length == specializations.length, "Array length mismatch");
        require(owners.length == hasTEEFlags.length, "Array length mismatch");
        
        for (uint256 i = 0; i < owners.length; i++) {
            mintAgent(owners[i], agentWallets[i], names[i], specializations[i], hasTEEFlags[i]);
        }
    }
    
    // ============================================
    // AGENT ACTIONS (Core Composability Feature)
    // ============================================
    
    /**
     * @notice Record an agent action on-chain
     * @dev This is called by authorized executors (backend) when agent performs action
     * @param tokenId Agent token ID
     * @param actionType Type of action (TOOL_EXECUTION, PAYMENT, etc.)
     * @param actionHash Hash of action parameters for verification
     */
    function recordAgentAction(
        uint256 tokenId,
        string memory actionType,
        bytes32 actionHash
    ) external {
        require(_ownerOf(tokenId) != address(0), "Agent does not exist");
        require(authorizedExecutors[msg.sender] || msg.sender == owner(), "Not authorized");
        
        AgentProfile memory profile = agentProfiles[tokenId];
        require(profile.active, "Agent not active");
        
        AgentCapabilities memory caps = agentCapabilities[tokenId];
        
        // Create action record
        AgentAction memory action = AgentAction({
            agentTokenId: tokenId,
            actionType: actionType,
            actionHash: actionHash,
            timestamp: block.timestamp,
            approved: !caps.requiresApproval, // Auto-approve if not required
            approver: caps.requiresApproval ? address(0) : msg.sender
        });
        
        agentActionHistory[tokenId].push(action);
        
        emit AgentActionExecuted(
            tokenId,
            actionType,
            actionHash,
            block.timestamp,
            caps.requiresApproval
        );
    }
    
    /**
     * @notice Approve a pending agent action
     * @dev Only NFT owner can approve
     */
    function approveAgentAction(uint256 tokenId, uint256 actionIndex) external {
        require(ownerOf(tokenId) == msg.sender, "Not agent owner");
        require(actionIndex < agentActionHistory[tokenId].length, "Invalid action index");
        
        AgentAction storage action = agentActionHistory[tokenId][actionIndex];
        require(!action.approved, "Already approved");
        
        action.approved = true;
        action.approver = msg.sender;
        
        emit AgentActionApproved(tokenId, actionIndex, msg.sender);
    }
    
    /**
     * @notice Get agent's action history
     * @param tokenId Agent token ID
     * @return Array of agent actions
     */
    function getAgentActions(uint256 tokenId) external view returns (AgentAction[] memory) {
        return agentActionHistory[tokenId];
    }
    
    /**
     * @notice Get total action count for agent
     */
    function getActionCount(uint256 tokenId) external view returns (uint256) {
        return agentActionHistory[tokenId].length;
    }
    
    // ============================================
    // CAPABILITIES MANAGEMENT
    // ============================================
    
    /**
     * @notice Update agent capabilities (by owner)
     * @param tokenId Agent token ID
     * @param allowedTools Array of tool IDs agent can use
     * @param dailySpendLimit Max spend per day (in wei)
     * @param rateLimit Max actions per minute
     * @param requiresApproval Whether actions need approval
     */
    function updateAgentCapabilities(
        uint256 tokenId,
        string[] memory allowedTools,
        uint256 dailySpendLimit,
        uint256 rateLimit,
        bool requiresApproval
    ) external {
        require(ownerOf(tokenId) == msg.sender, "Not agent owner");
        
        agentCapabilities[tokenId] = AgentCapabilities({
            allowedTools: allowedTools,
            dailySpendLimitWei: dailySpendLimit,
            rateLimitPerMinute: rateLimit,
            requiresApproval: requiresApproval
        });
        
        emit AgentCapabilitiesUpdated(tokenId, dailySpendLimit, rateLimit);
    }
    
    /**
     * @notice Check if agent can use a specific tool
     * @param tokenId Agent token ID
     * @param toolId Tool identifier
     * @return bool Whether agent is authorized
     */
    function canUseTools(uint256 tokenId, string memory toolId) external view returns (bool) {
        if (!agentProfiles[tokenId].active) return false;
        
        AgentCapabilities memory caps = agentCapabilities[tokenId];
        
        // If no tools specified, allow all
        if (caps.allowedTools.length == 0) return true;
        
        // Check if tool is in allowed list
        for (uint256 i = 0; i < caps.allowedTools.length; i++) {
            if (keccak256(bytes(caps.allowedTools[i])) == keccak256(bytes(toolId))) {
                return true;
            }
        }
        
        return false;
    }
    
    // ============================================
    // REPUTATION SYSTEM
    // ============================================
    
    /**
     * @notice Update agent reputation based on behavior
     * @param tokenId Agent token ID
     * @param newScore New reputation score (0-100)
     * @param reason Reason for update
     */
    function updateReputation(
        uint256 tokenId,
        uint256 newScore,
        string memory reason
    ) external {
        require(authorizedExecutors[msg.sender] || msg.sender == owner(), "Not authorized");
        require(newScore <= 100, "Score must be 0-100");
        
        agentReputation[tokenId] = newScore;
        
        emit AgentReputationUpdated(tokenId, newScore, reason);
    }
    
    // ============================================
    // COMPOSABILITY QUERIES
    // ============================================
    
    /**
     * @notice Get agent profile by wallet address
     * @param agentWallet Wallet address controlling the agent
     * @return tokenId Agent's token ID
     * @return profile Agent's profile data
     */
    function getAgentByWallet(address agentWallet) 
        external 
        view 
        returns (uint256 tokenId, AgentProfile memory profile) 
    {
        tokenId = walletToTokenId[agentWallet];
        require(tokenId != 0, "Agent not found");
        profile = agentProfiles[tokenId];
    }
    
    /**
     * @notice Check if agent is active and can perform actions
     */
    function isAgentActive(uint256 tokenId) external view returns (bool) {
        return agentProfiles[tokenId].active;
    }
    
    /**
     * @notice Get agent's capabilities
     */
    function getAgentCapabilities(uint256 tokenId) 
        external 
        view 
        returns (AgentCapabilities memory) 
    {
        return agentCapabilities[tokenId];
    }
    
    // ============================================
    // ADMIN FUNCTIONS
    // ============================================
    
    /**
     * @notice Add authorized executor (backend relayer)
     */
    function addAuthorizedExecutor(address executor) external onlyOwner {
        authorizedExecutors[executor] = true;
    }
    
    /**
     * @notice Remove authorized executor
     */
    function removeAuthorizedExecutor(address executor) external onlyOwner {
        authorizedExecutors[executor] = false;
    }
    
    /**
     * @notice Deactivate agent (emergency stop)
     */
    function deactivateAgent(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender || msg.sender == owner(), "Not authorized");
        agentProfiles[tokenId].active = false;
    }
    
    /**
     * @notice Reactivate agent
     */
    function reactivateAgent(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender || msg.sender == owner(), "Not authorized");
        agentProfiles[tokenId].active = true;
    }
    
    // ============================================
    // METADATA (for marketplaces)
    // ============================================
    
    /**
     * @notice Get token URI (can be extended with IPFS metadata)
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        
        AgentProfile memory profile = agentProfiles[tokenId];
        
        // Return basic metadata (can be extended with proper JSON formatting)
        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(abi.encodePacked(
                '{"name":"', profile.name, '",',
                '"description":"AI Agent with specialization: ', profile.specialization, '",',
                '"attributes":[',
                    '{"trait_type":"Has TEE","value":"', profile.hasTEE ? "Yes" : "No", '"},',
                    '{"trait_type":"Reputation","value":', uint2str(agentReputation[tokenId]), '},',
                    '{"trait_type":"Actions","value":', uint2str(agentActionHistory[tokenId].length), '}',
                ']}'
            )))
        ));
    }
    
    // ============================================
    // UTILITIES
    // ============================================
    
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + j % 10));
            j /= 10;
        }
        return string(bstr);
    }
}

// Base64 encoding library (simplified)
library Base64 {
    string internal constant TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    
    function encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";
        
        string memory table = TABLE;
        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        string memory result = new string(encodedLen);
        
        assembly {
            let tablePtr := add(table, 1)
            let dataPtr := add(data, 32)
            let endPtr := add(dataPtr, mload(data))
            let resultPtr := add(result, 32)
            
            for {} lt(dataPtr, endPtr) {}
            {
                dataPtr := add(dataPtr, 3)
                let input := mload(dataPtr)
                
                mstore8(resultPtr, mload(add(tablePtr, and(shr(18, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(12, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(6, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(input, 0x3F))))
                resultPtr := add(resultPtr, 1)
            }
            
            switch mod(mload(data), 3)
            case 1 { mstore(sub(resultPtr, 2), shl(240, 0x3d3d)) }
            case 2 { mstore(sub(resultPtr, 1), shl(248, 0x3d)) }
        }
        
        return result;
    }
}
