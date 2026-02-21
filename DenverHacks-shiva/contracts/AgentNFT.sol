// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AgentNFT is ERC721, Ownable {
    struct AgentMetadata {
        bytes32 agentId;
        string name;
        string hcsTopicId;
        string hederaAccountId;
        uint256 reputationScore;
        uint256 totalExecutions;
        uint256 createdAt;
    }

    mapping(uint256 => AgentMetadata) public agentData;
    mapping(address => uint256) public walletToTokenId;

    uint256 private tokenIdCounter = 1;
    address public relayer;

    event AgentMinted(uint256 indexed tokenId, address indexed owner, bytes32 agentId);
    event ReputationUpdated(uint256 indexed tokenId, uint256 newScore);

    modifier onlyRelayer() {
        require(msg.sender == relayer, "Only relayer");
        _;
    }

    constructor(address _relayer) ERC721("AgentIdentity", "AGENT") {
        require(_relayer != address(0), "Invalid relayer");
        relayer = _relayer;
    }

    function setRelayer(address _newRelayer) external onlyOwner {
        require(_newRelayer != address(0), "Invalid relayer");
        relayer = _newRelayer;
    }

    function mint(address to, AgentMetadata calldata metadata)
        external
        onlyRelayer
        returns (uint256)
    {
        // One NFT per wallet
        require(walletToTokenId[to] == 0, "Agent already minted");

        uint256 tokenId = tokenIdCounter++;
        _safeMint(to, tokenId);

        walletToTokenId[to] = tokenId;
        agentData[tokenId] = AgentMetadata({
            agentId: metadata.agentId,
            name: metadata.name,
            hcsTopicId: metadata.hcsTopicId,
            hederaAccountId: metadata.hederaAccountId,
            reputationScore: metadata.reputationScore,
            totalExecutions: metadata.totalExecutions,
            createdAt: metadata.createdAt
        });

        emit AgentMinted(tokenId, to, metadata.agentId);
        return tokenId;
    }

    function updateReputation(
        uint256 tokenId,
        uint256 newScore,
        uint256 newExecutions
    ) external onlyRelayer {
        require(_ownerOf(tokenId) != address(0), "Token not found");
        agentData[tokenId].reputationScore = newScore;
        agentData[tokenId].totalExecutions = newExecutions;
        emit ReputationUpdated(tokenId, newScore);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_ownerOf(tokenId) != address(0), "Token not found");

        AgentMetadata memory metadata = agentData[tokenId];
        string memory json = string(
            abi.encodePacked(
                '{"name":"',
                metadata.name,
                '","description":"ERC-7857 Agent Identity","attributes":[',
                '{"trait_type":"agentId","value":"0x',
                bytes32ToHexString(metadata.agentId),
                '"},',
                '{"trait_type":"reputationScore","value":',
                uint256ToString(metadata.reputationScore),
                "},",
                '{"trait_type":"totalExecutions","value":',
                uint256ToString(metadata.totalExecutions),
                "},",
                '{"trait_type":"hcsTopicId","value":"',
                metadata.hcsTopicId,
                '"},',
                '{"trait_type":"hederaAccountId","value":"',
                metadata.hederaAccountId,
                '"}',
                "]}"
            )
        );

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                base64Encode(bytes(json))
            )
        );
    }

    function bytes32ToHexString(bytes32 value)
        internal
        pure
        returns (string memory)
    {
        bytes memory hexChars = "0123456789abcdef";
        bytes memory result = new bytes(64);

        for (uint256 i = 0; i < 32; i++) {
            uint8 value_ = uint8(value[i]);
            result[i * 2] = hexChars[value_ >> 4];
            result[i * 2 + 1] = hexChars[value_ & 0x0f];
        }

        return string(result);
    }

    function uint256ToString(uint256 value)
        internal
        pure
        returns (string memory)
    {
        if (value == 0) {
            return "0";
        }

        uint256 temp = value;
        uint256 digits;

        while (temp != 0) {
            digits++;
            temp /= 10;
        }

        bytes memory result = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            result[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }

        return string(result);
    }

    function base64Encode(bytes memory data)
        internal
        pure
        returns (string memory)
    {
        bytes memory TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

        if (data.length == 0) return "";

        string memory result = new string(4 * ((data.length + 2) / 3));
        assembly {
            let resultPtr := add(result, 32)

            let dataPtr := data
            let endPtr := add(data, mload(data))

            for {

            } lt(dataPtr, endPtr) {

            } {
                dataPtr := add(dataPtr, 3)
                let input := mload(dataPtr)

                mstore(
                    resultPtr,
                    shl(248, mload(add(TABLE, and(shr(18, input), 0x3F))))
                )
                resultPtr := add(resultPtr, 1)
                mstore(
                    resultPtr,
                    shl(248, mload(add(TABLE, and(shr(12, input), 0x3F))))
                )
                resultPtr := add(resultPtr, 1)
                mstore(
                    resultPtr,
                    shl(248, mload(add(TABLE, and(shr(6, input), 0x3F))))
                )
                resultPtr := add(resultPtr, 1)
                mstore(
                    resultPtr,
                    shl(248, mload(add(TABLE, and(input, 0x3F))))
                )
                resultPtr := add(resultPtr, 1)
            }

            switch mod(mload(data), 3)
            case 1 {
                mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
            }
            case 2 {
                mstore(sub(resultPtr, 1), shl(248, 0x3d))
            }
        }

        return result;
    }
}
