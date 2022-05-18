// SPDX-License-Identifier: None

pragma solidity ^0.8.9;

import "./interfaces/IERC721le.sol";
import "./interfaces/IERC721.sol";
import "./interfaces/IERC1155.sol";
import "./interfaces/IERC1155MetaData.sol";
import "./standards/ERC721le.sol";
import "./Utils.sol";

contract Collections {
    using Utils for string;
    event CollectionAdded(address indexed _collection, address indexed _owner);

    event CollectionCreated(
        address indexed _collection,
        address indexed _owner
    );

    enum Type {
        ERC721,
        ERC1155
    }
    struct Collection {
        string name;
        string description;
        string bannerUri;
        Type collectionType;
        address owner;
        address collectionAddress;
    }

    uint256 public collectionCount;

    mapping(uint256 => Collection) private _collections;

    mapping(address => uint256[]) private _userCollections;

    address private _tapp;

    modifier validCollection(uint256 _id) {
        require(_id > 0 && _id <= collectionCount, "Collections: Invalid id");
        _;
    }

    constructor(address tapp_) {
        _tapp = tapp_;
    }

    function updateCollectionBanner(uint256 _id, string calldata _bannerUri)
        public
        validCollection(_id)
    {
        Collection storage collection = _collections[_id];
        require(
            collection.owner == msg.sender,
            "Collections: You're not collection owner"
        );
        collection.bannerUri = _bannerUri;
    }

    function updateCollectionDescription(
        uint256 _id,
        string calldata _description
    ) public validCollection(_id) {
        Collection storage collection = _collections[_id];
        require(
            collection.owner == msg.sender,
            "Collections: You're not collection owner"
        );
        collection.description = _description;
    }

    function addCollection(address _collection) public {
        require(_collection != address(0), "Collections: Invalid address");
        require(_collection.code.length > 0, "Collections: Invalid contract");
        require(
            IERC721le(_collection).owner() == msg.sender,
            "Collections: You're not the owner of contract"
        );
        if (IERC165(_collection).supportsInterface(type(IERC721).interfaceId)) {
            _addCollection(
                _collection,
                IERC721MetaData(_collection).name(),
                "",
                "",
                Type.ERC721
            );
        } else if (
            IERC165(_collection).supportsInterface(type(IERC1155).interfaceId)
        ) {
            _addCollection(
                _collection,
                IERC1155MetaData(_collection).name(),
                "",
                "",
                Type.ERC1155
            );
        } else {
            revert("Collections: Unsupported smart contract detected");
        }

        emit CollectionAdded(_collection, msg.sender);
    }

    function createCollection(
        string calldata _name,
        string calldata _symbol,
        string calldata _bannerUri,
        string calldata _description,
        Type _type
    ) public returns (address) {
        address collection;
        bytes memory _code;
        if (_type == Type.ERC721) {
            _code = getByteCodeOfERC721le(_name, _symbol);
        }

        require(_code.length > 0, "Collections: Invalid bytecode for contract");

        assembly {
            collection := create(
                // If ethers sent to contract, we can pass this via callvalue(), msg.value doesn't work
                callvalue(),
                /* Pointer in First 32 bytes (0x20 in hex) encode length of the code, actual code 
                    starts after 32 bytes. That's why we're skipping 32 bytes */

                add(_code, 0x20),
                mload(_code)
            )
        }
        require(collection != address(0), "Collections: Deployment failed");
        _addCollection(collection, _name, _bannerUri, _description, _type);
        emit CollectionCreated(collection, msg.sender);
        return collection;
    }

    function owner(uint256 _id)
        public
        view
        validCollection(_id)
        returns (address)
    {
        return _collections[_id].owner;
    }

    function getUserCollections(address _user)
        public
        view
        returns (Collection[] memory)
    {
        require(_user != address(0), "Collections: Invalid User");

        uint256[] memory ids = _userCollections[_user];
        Collection[] memory collections = new Collection[](ids.length);

        for (uint256 i; i < ids.length; i++) {
            collections[i] = _collections[ids[i]];
        }

        return collections;
    }

    function getAllCollections() public view returns (Collection[] memory) {
        Collection[] memory collections = new Collection[](collectionCount);

        for (uint256 i; i < collectionCount; i++) {
            collections[i] = _collections[i+1];
        }

        return collections;
    }

    function getCollection(uint256 _id)
        public
        view
        validCollection(_id)
        returns (Collection memory)
    {
        return _collections[_id];
    }

    function getByteCodeOfERC721le(
        string calldata _name,
        string calldata _symbol
    ) private view returns (bytes memory) {
        bytes memory byteCode = type(ERC721le).creationCode;
        return
            abi.encodePacked(
                byteCode,
                abi.encode(_name, _symbol, _tapp, msg.sender)
            );
    }

    function _addCollection(
        address _collection,
        string memory _name,
        string memory _bannerUri,
        string memory _description,
        Type _type
    ) private {
        collectionCount++;

        _collections[collectionCount] = Collection({
            name: _name,
            bannerUri: _bannerUri,
            owner: msg.sender,
            collectionAddress: _collection,
            collectionType: _type,
            description: _description
        });
        _userCollections[msg.sender].push(collectionCount);
    }
}
