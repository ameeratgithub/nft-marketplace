// SPDX-License-Identifier: NONE
pragma solidity ^0.8.9;
import "./IERC721e.sol";
interface IERC721le is IERC721e{
    struct LazyNFT {
        uint256 price;
        uint256 id;
        string uri;
        address creator;
        address contractAddress;
        bool minted;
    }
    event LazyTokenCreated(
        address indexed creator,
        string indexed uri,
        uint256 indexed tokenId
    );
    event LazyTokensCreated(
        address indexed creator,
        string[] indexed uris,
        uint256[] indexed tokenIds
    );

    function addLazyToken(string calldata _uri, uint256 _price) external;
    function mintLazyToken(uint256 _tokenId, string calldata _uri)
        external;
    function getAllLazyTokens() external view returns (LazyNFT[] memory);
    function addLazyTokens(string[] calldata _uris, uint256[] calldata _prices)
        external;
}