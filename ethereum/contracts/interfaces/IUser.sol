// SPDX-License-Identifier: None

pragma solidity ^0.8.9;

interface IUser {
    struct Profile {
        uint256 id;
        string name;
        string picture;
        string cover;
        address userAddress;
        // Collection Address -> Token Ids
        mapping(address => uint256[]) ownedNfts;
        mapping(address => bool) collectionExists;
        address[] collections;
    }
    struct Collection {
        address collectionAddress;
        uint256[] tokens;
    }

    function add(address _userAddress) external;

    function addName(uint256 _id, string calldata _name) external;

    function addPicture(uint256 _id, string calldata _picture) external;

    function addCover(uint256 _id, string calldata _cover) external;

    function addNft(
        address _userAddress,
        address _collectionAddress,
        uint256 _tokenId
    ) external;

    function getAllTokens(uint256 _id)
        external
        view
        returns (Collection[] memory);
}
