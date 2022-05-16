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
    function mint(string calldata _uri) external returns(uint);
    function internalTransferTo(address _to, uint256 _tokenId) external;
}
