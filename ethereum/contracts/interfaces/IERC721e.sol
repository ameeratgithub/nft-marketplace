// SPDX-License-Identifier: NONE
pragma solidity ^0.8.9;

import "./IERC721.sol";

interface IERC721e is IERC721 {
    function owner() external view returns (address);

    function floorPrice() external view returns (uint256);

    function tokenURIs(uint256[] calldata _tokenIds)
        external
        view
        returns (string[] memory);

    function mint(string calldata _uri) external returns (uint256);

    function internalTransferTo(address _to, uint256 _tokenId) external;

    function tokensByIds(uint256[] calldata _tokenIds)
        external
        view
        returns (NFT[] memory);

    function userTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external;

    function putOnSale(uint256 _tokenId, uint256 _marketItemId) external;

    function createSale(uint256 _tokenId) external;

    function createOffer(
        uint256 _tokenId,
        uint256 _offerId,
        address _offeror
    ) external;

    function deleteOffer(uint256 _tokenId, uint256 _offerId) external;
    function resetOffers(uint256 _tokenId) external;
    function setAuction(uint _tokenId, uint _auctionId) external;
    function resetAuction(uint _tokenId) external;
}
