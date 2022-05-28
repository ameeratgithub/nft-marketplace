// SPDX-License-Identifier: None

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/IERC721.sol";
import "./interfaces/IERC721e.sol";

contract Marketplace is Ownable {
    struct Item {
        uint256 id;
        uint256 tokenId;
        uint256 price;
        address nftContract;
        address seller;
        address buyer;
        bool sold;
        bool cancelled;
    }

    uint256 public itemsCount;
    uint256 public itemsSold;
    uint256 public itemsCancelled;

    mapping(uint256 => Item) public items;

    IERC20 tapp;

    function setTappContract(address _tappAddress) public onlyOwner {
        require(
            _tappAddress != address(0),
            "Marketplace: Invalid Tapp Address"
        );
        tapp = IERC20(_tappAddress);
    }

    function createMarketItem(
        uint256 _price,
        address _nftContract,
        uint256 _tokenId
    ) public {
        require(
            _price >= 1 ether,
            "Marketplace: Price must be at least 1 tapp"
        );
        require(_tokenId > 0, "Marketplace: Invalid token Id");
        require(_nftContract != address(0), "Marketplace: Invalid contract");
        require(
            IERC721(_nftContract).ownerOf(_tokenId) == msg.sender,
            "Marketplace: You don't own this nft"
        );

        IERC721(_nftContract).transferFrom(msg.sender, address(this), _tokenId);
        itemsCount++;

        Item storage item = items[itemsCount];

        item.id = itemsCount;
        item.tokenId = _tokenId;
        item.price = _price;
        item.seller = msg.sender;
        item.nftContract = _nftContract;
        IERC721e(_nftContract).putOnSale(_tokenId, itemsCount);
    }

    function cancelListing(uint256 _itemId) public {
        Item storage item = items[_itemId];
        require(item.id > 0, "Marketplace: Item doesn't exist");
        require(!item.cancelled, "Marketplace: Already cancelled");
        require(
            msg.sender == item.seller,
            "Marketplace: You can't cancel market item"
        );

        IERC721e(item.nftContract).createSale(item.tokenId);
        IERC721e(item.nftContract).userTransferFrom(
            address(this),
            msg.sender,
            item.tokenId
        );
        item.cancelled = true;
        itemsCancelled++;
    }

    function createSale(uint256 _itemId) public {
        Item storage item = items[_itemId];
        require(item.id > 0, "Marketplace: Item doesn't exist");
        require(
            !item.cancelled,
            "Marketplace: Sale for this tem has been cancelled"
        );
        require(
            tapp.allowance(msg.sender, address(this)) >= item.price,
            "Marketplace: Please allow funds to make sale"
        );
        
        tapp.transferFrom(msg.sender, item.seller, item.price);

        IERC721e(item.nftContract).createSale(item.tokenId);

        IERC721e(item.nftContract).userTransferFrom(
            address(this),
            msg.sender,
            item.tokenId
        );
        item.buyer = msg.sender;
        item.sold = true;
        itemsSold++;
    }

    function getItemsOnSale() public view returns (Item[] memory) {
        Item[] memory _items = new Item[](
            itemsCount - itemsSold - itemsCancelled
        );

        uint256 currentIndex = 0;

        for (uint256 i; i < itemsCount; i++) {
            Item memory item = items[i + 1];
            if (!item.sold && !item.cancelled) {
                _items[currentIndex] = item;
                currentIndex++;
            }
        }
        return _items;
    }

    function getItemsSold() public view returns (Item[] memory) {
        Item[] memory _items = new Item[](itemsSold);

        uint256 currentIndex = 0;

        for (uint256 i; i < itemsCount; i++) {
            Item memory item = items[i + 1];
            if (item.sold) {
                _items[currentIndex] = item;
                currentIndex++;
            }
        }
        return _items;
    }

    function getItemsCancelled() public view returns (Item[] memory) {
        Item[] memory _items = new Item[](itemsCancelled);

        uint256 currentIndex = 0;

        for (uint256 i; i < itemsCount; i++) {
            Item memory item = items[i + 1];
            if (item.cancelled) {
                _items[currentIndex] = item;
                currentIndex++;
            }
        }
        return _items;
    }
}
