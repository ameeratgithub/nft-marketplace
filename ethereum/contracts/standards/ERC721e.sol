// SPDX-License-Identifier: NONE
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "../standards/ERC721.sol";
import "../interfaces/IERC721Receiver.sol";
import "../interfaces/IERC721e.sol";
import "../interfaces/IUser.sol";

contract ERC721e is ERC721, IERC721Receiver, IERC721e {
    using Strings for uint256;

    address public owner;

    uint256 public floorPrice;

    address userContract;
    address marketplaceContract;

    modifier onlyOwner() {
        require(msg.sender == owner, "ERC721e: You're not the owner");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        address _userContract,
        address _marketplaceContract
    ) ERC721(_name, _symbol) {
        userContract = _userContract;
        marketplaceContract = _marketplaceContract;
    }

    function setFloorPrice(uint256 _floorPrice) public onlyOwner {
        floorPrice = _floorPrice;
    }

    function tokenURIs(uint256[] calldata _tokenIds)
        public
        view
        returns (string[] memory)
    {
        require(_tokenIds.length > 0, "ERC721e: Pass some values");
        string[] memory uris = new string[](_tokenIds.length);
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            uris[i] = tokenURI(_tokenIds[i]);
        }
        return uris;
    }

    function tokensByIds(uint256[] calldata _tokenIds)
        public
        view
        returns (NFT[] memory)
    {
        require(_tokenIds.length > 0, "ERC721e: Pass some values");
        NFT[] memory tokens = new NFT[](_tokenIds.length);
        for (uint256 i; i < tokenCount; i++) {
            tokens[i] = _tokens[_tokenIds[i]];
        }

        return tokens;
    }

    // Need to approve tapp tokens first for this smart contract
    function mint(string calldata _uri)
        public
        virtual
        onlyOwner
        returns (uint256)
    {
        tokenCount++;

        NFT storage token = _tokens[tokenCount];

        _balances[msg.sender]++;

        token.owner = msg.sender;

        token.uri = _uri;

        token.id = tokenCount;

        IUser(userContract).addNft(msg.sender, address(this), tokenCount);

        setApprovalForAll(marketplaceContract, true);

        token.contractAddress = address(this);

        emit Transfer(address(0), msg.sender, tokenCount);

        return tokenCount;
    }

    function userTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) public {
        transferFrom(_from, _to, _tokenId);
        IUser(userContract).addNft(_to, address(this), _tokenId);
    }

    function putOnSale(uint256 _tokenId, uint256 _marketItemId) public {
        address _owner = ownerOf(_tokenId);
        require(
            _isAuthorized(_owner, _tokenId),
            "ERC721: You're not authorized"
        );
        NFT storage nft = _tokens[_tokenId];
        nft.onSale = true;
        nft.marketItemId = _marketItemId;
    }

    function createSale(uint256 _tokenId) public {
        address _owner = ownerOf(_tokenId);
        require(
            _isAuthorized(_owner, _tokenId),
            "ERC721: You're not authorized"
        );
        NFT storage nft = _tokens[_tokenId];
        nft.onSale = false;
        nft.marketItemId = 0;
    }

    function getTokensList() public view returns (NFT[] memory) {
        NFT[] memory tokens = new NFT[](tokenCount);
        for (uint256 i; i < tokenCount; i++) {
            tokens[i] = _tokens[i + 1];
        }

        return tokens;
    }

    function internalTransferTo(address _to, uint256 _tokenId)
        external
        onlyOwner
    {
        require(_to != address(0), "ERC721e: Invalid receipient");
        transferFrom(address(this), _to, _tokenId);
    }

    function supportsInterface(bytes4 _interfaceId)
        public
        pure
        override
        returns (bool)
    {
        return
            _interfaceId == type(IERC721MetaData).interfaceId ||
            super.supportsInterface(_interfaceId);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
