// SPDX-License-Identifier: None

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/IERC721.sol";
import "./interfaces/IERC721e.sol";
import "hardhat/console.sol";

contract Auctions is Ownable {
    struct Bid {
        uint256 id;
        uint256 price;
        address bidder;
    }
    struct Auction {
        uint256 id;
        uint256 tokenId;
        uint256 startingPrice;
        uint256 startBlock;
        uint256 endBlock;
        uint256 bidsCount;
        address contractAddress;
        address seller;
        Bid highestBid;
        Bid[] bids;
        bool cancelled;
        bool ended;
    }

    uint256 public auctionsCount;

    // Collection Address -> Token ID
    mapping(address => mapping(uint256 => bool)) private _hasAuctionStarted;

    mapping(uint256 => Auction) public auctions;

    // Bidder -> Total Auctions he participated in
    mapping(address => uint256) public bidderAuctionCount;

    // Bidder -> Auction ID -> Yes/No
    mapping(address => mapping(uint256 => bool)) public alreadyParticipated;

    mapping(address => Auction) public bidderAuctions;

    // Bidder -> Auction ID -> Amount Invested
    mapping(address => mapping(uint256 => uint256)) public bidderAuctionAmount;

    IERC20 tapp;

    function setTappContract(address _tappAddress) public onlyOwner {
        require(
            _tappAddress != address(0),
            "Marketplace: Invalid Tapp Address"
        );
        tapp = IERC20(_tappAddress);
    }

    function startAuction(
        uint256 _tokenId,
        address _contractAddress,
        uint256 _startingPrice,
        uint256 _endBlock
    ) public {
        require(_startingPrice > 0, "Auctions: Provide some starting price");
        require(_endBlock > 0, "Auctions: Provide valid block number");
        require(
            _contractAddress != address(0),
            "Auctions: invalid collection address"
        );
        require(
            !_hasAuctionStarted[_contractAddress][_tokenId],
            "Auctions: Auction already started"
        );
        require(
            IERC721(_contractAddress).ownerOf(_tokenId) == msg.sender,
            "Auctions: You can't start auction"
        );

        auctionsCount++;

        Auction storage auction = auctions[auctionsCount];
        auction.id = auctionsCount;
        auction.tokenId = _tokenId;
        auction.contractAddress = _contractAddress;
        auction.startBlock = block.number;
        auction.endBlock = block.number + _endBlock;
        auction.startingPrice = _startingPrice;
        auction.seller = msg.sender;

        IERC721(_contractAddress).transferFrom(
            msg.sender,
            address(this),
            _tokenId
        );
        IERC721e(_contractAddress).setAuction(_tokenId, auctionsCount);
        _hasAuctionStarted[_contractAddress][_tokenId] = true;
    }

    function placeBid(uint256 _id, uint256 _price) public {
        Auction storage auction = auctions[_id];
        require(
            !auction.ended && !auction.cancelled,
            "Auctions: Auction is not active for bids"
        );
        require(
            auction.seller != msg.sender,
            "Auctions: You can't bid on your Auction"
        );
        if (auction.bids.length == 0) {
            require(
                _price > auction.startingPrice,
                "Auctions: Price must be greator than starting price"
            );
        } else {
            require(
                _price > auction.highestBid.price,
                "Auctions: Price must be more than previous bid"
            );
        }

        uint256 currentAmount = _price - bidderAuctionAmount[msg.sender][_id];

        tapp.transferFrom(msg.sender, address(this), currentAmount);

        bidderAuctionAmount[msg.sender][_id] += currentAmount;

        auction.bidsCount++;

        Bid memory bid = Bid({
            bidder: msg.sender,
            price: _price,
            id: auction.bidsCount
        });
        auction.highestBid = bid;
        auction.bids.push(bid);

        if (!alreadyParticipated[msg.sender][_id]) {
            bidderAuctions[msg.sender] = auction;
            alreadyParticipated[msg.sender][_id] = true;
            bidderAuctionCount[msg.sender]++;
        }
    }

    function cancelAuction(uint256 _id) public {
        Auction storage auction = auctions[_id];

        require(
            auction.seller == msg.sender,
            "Auctions: You can't cancel Auction"
        );
        require(
            !auction.ended && !auction.cancelled,
            "Auctions: Auction already ended or cancelled"
        );
        require(
            auction.endBlock > block.number,
            "Auctions: You can't cancel auction now"
        );

        IERC721(auction.contractAddress).transferFrom(
            address(this),
            msg.sender,
            auction.tokenId
        );

        auction.cancelled = true;
        IERC721e(auction.contractAddress).resetAuction(auction.tokenId);
        _hasAuctionStarted[auction.contractAddress][auction.tokenId] = false;
    }

    function endAuction(uint256 _id) public {
        Auction storage auction = auctions[_id];
        require(
            !auction.ended && !auction.cancelled,
            "Auctions: Auction already ended or cancelled"
        );
        require(
            auction.endBlock <= block.number,
            "Auctions: You can't end auction now"
        );
        require(
            alreadyParticipated[msg.sender][_id] ||
                msg.sender == auction.seller,
            "Auctions: Only bidders or seller can end auction"
        );

        auction.ended = true;
        bidderAuctionAmount[auction.highestBid.bidder][_id] = 0;
        _hasAuctionStarted[auction.contractAddress][auction.tokenId] = false;
        tapp.transfer(
            auction.seller,
            auction.highestBid.price
        );
        IERC721e(auction.contractAddress).resetAuction(auction.tokenId);

        IERC721e(auction.contractAddress).userTransferFrom(
            address(this),
            auction.highestBid.bidder,
            auction.tokenId
        );
    }

    function withdraw(uint256 _id) public {
        Auction storage auction = auctions[_id];
        require(
            auction.ended || auction.cancelled,
            "Auctions: You can't withdraw from active auction"
        );
        uint256 amount = bidderAuctionAmount[msg.sender][_id];
        require(amount > 0, "Auctions: You don't have anything to withdraw");

        bidderAuctionAmount[msg.sender][_id] = 0;
        tapp.transfer(msg.sender, amount);
    }

    function getMyBidAuctions() public view returns (Auction[] memory) {
        uint256 myAuctionsCount = bidderAuctionCount[msg.sender];
        Auction[] memory myAuctions = new Auction[](myAuctionsCount);

        for (uint256 i; i < myAuctionsCount; i++) {
            myAuctions[i] = bidderAuctions[msg.sender];
        }
        return myAuctions;
    }

    function getAuction(uint256 _id) public view returns (Auction memory) {
        return auctions[_id];
    }
}
