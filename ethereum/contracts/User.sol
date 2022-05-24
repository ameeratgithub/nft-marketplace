// SPDX-License-Identifier: None

pragma solidity ^0.8.9;

import "./interfaces/IUser.sol";
import "./interfaces/IERC721.sol";
import "hardhat/console.sol";

contract User is IUser {
    uint256 public userCount;

    mapping(uint256 => Profile) public profiles;
    // mapping(uint256 => address[]) public collections;
    mapping(address => uint256) public users;

    modifier authorize(uint256 _id) {
        require(
            profiles[_id].userAddress == msg.sender,
            "User: You're not authorized"
        );
        _;
    }

    function add(address _userAddress) public {
        require(_userAddress != address(0), "User: Invalid user address");
        if (users[_userAddress] < 1) {
            userCount++;
            Profile storage profile = profiles[userCount];
            profile.id = userCount;
            profile.userAddress = _userAddress;
            users[_userAddress] = userCount;
        }
    }

    function addPicture(uint256 _id, string calldata _picture)
        public
        authorize(_id)
    {
        profiles[_id].picture = _picture;
    }

    function addCover(uint256 _id, string calldata _cover)
        public
        authorize(_id)
    {
        profiles[_id].cover = _cover;
    }

    function addName(uint256 _id, string calldata _name) public authorize(_id) {
        profiles[_id].name = _name;
    }

    function addNft(
        address _userAddress,
        address _collectionAddress,
        uint256 _tokenId
    ) public {
        require(_userAddress != address(0), "User: Invalid user address");
        require(
            _collectionAddress != address(0),
            "User: Invalid collection address"
        );
        uint256 id = users[_userAddress];
        require(id > 0, "User: Invalid user Id");
        require(
            IERC721(_collectionAddress).ownerOf(_tokenId) == _userAddress,
            "User: You're not the owner of token"
        );

        Profile storage profile = profiles[id];

        if (!profile.collectionExists[_collectionAddress]) {
            profile.collections.push(_collectionAddress);
            profile.collectionExists[_collectionAddress] = true;
        }

        profile.ownedNfts[_collectionAddress].push(_tokenId);
    }

    function getAllTokens(uint256 _id)
        public
        view
        returns (Collection[] memory)
    {
        require(_id > 0 && _id <= userCount, "User: Invalid Id");

        Profile storage profile = profiles[_id];
        uint256 collectionsCount = profile.collections.length;
        Collection[] memory collections = new Collection[](collectionsCount);

        for (uint256 i = 0; i < collectionsCount; i++) {
            address collectionAddress = profile.collections[i];
            collections[i].collectionAddress = collectionAddress;

            collections[i].tokens = profile.ownedNfts[collectionAddress];
        }

        return collections;
    }
}
