// SPDX-License-Identifier: NONE
pragma solidity ^0.8.9;
import "./ERC721e.sol";
import "../interfaces/IERC721le.sol";

contract ERC721le is ERC721e, IERC721le {
    

    uint256 public lazyTokenCount;

    mapping(uint256 => LazyNFT) public lazyTokens;

    IERC20 private tapp;

    modifier validLazyToken(uint256 _id) {
        require(
            _id > 0 && _id <= lazyTokenCount,
            "ERC721le: Invalid Lazy tokenId"
        );
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        address _tapp,
        address _owner, 
        address _userContract
    ) ERC721e(_name, _symbol, _userContract) {
        owner = _owner;
        tapp = IERC20(_tapp);
    }

    function addLazyToken(string calldata _uri, uint256 _price) public {
        _addLazyToken(_uri, _price);

        emit LazyTokenCreated(msg.sender, _uri, lazyTokenCount);
    }

    function mintLazyToken(uint256 _tokenId, string calldata _uri)
        public
        validLazyToken(_tokenId)
        onlyOwner
    {
        LazyNFT storage lazyToken = lazyTokens[_tokenId];
        require(
            tapp.allowance(msg.sender, address(this)) >= lazyToken.price,
            "ERC721le: Please approve use to spend tokens"
        );
        tapp.transferFrom(msg.sender, address(this), lazyToken.price);
        uint256 tokenId = mint(_uri);
        require(tokenId > 0, "ERC721le: Minting failed");
        lazyToken.minted = true;
        _tokens[tokenId].creator = lazyToken.creator;
    }

    function getAllLazyTokens() public view returns (LazyNFT[] memory) {
        LazyNFT[] memory tokens = new LazyNFT[](lazyTokenCount);
        for (uint256 i; i < lazyTokenCount; i++) {
            tokens[i] = lazyTokens[i+1];
        }

        return tokens;
    }


    function addLazyTokens(string[] calldata _uris, uint256[] calldata _prices)
        public
    {
        require(_uris.length > 0, "ERC721le: Provide some uris");
        require(
            _uris.length == _prices.length,
            "ERC721le: Arugments are different in length"
        );
        uint256[] memory ids = new uint256[](_uris.length);

        for (uint256 i; i < _uris.length; i++) {
            ids[i] = _addLazyToken(_uris[i], _prices[i]);
        }

        emit LazyTokensCreated(msg.sender, _uris, ids);
    }

    function _addLazyToken(string calldata _uri, uint256 _price)
        private
        returns (uint256)
    {
        lazyTokenCount++;
        LazyNFT memory lazyToken = LazyNFT({
            id: lazyTokenCount,
            creator: msg.sender,
            uri: _uri,
            price: _price,
            minted: false
        });

        lazyTokens[lazyTokenCount] = lazyToken;

        return lazyTokenCount;
    }
}
