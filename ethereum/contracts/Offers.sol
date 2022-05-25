// SPDX-License-Identifier: None

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/IERC721.sol";
import "./interfaces/IERC721e.sol";
import "hardhat/console.sol";

contract Offers is Ownable {
    struct Offer {
        uint256 id;
        uint256 tokenId;
        uint256 price;
        address offeror;
        address contractAddress;
        bool cancelled;
        bool declined;
    }
    uint256 offersCount;

    IERC20 tapp;

    mapping(uint256 => Offer) public offers;

    function createOffer(
        uint256 _tokenId,
        address _contractAddress,
        uint256 _price
    ) public {
        require(_price >= 1 ether, "Offers: Offer must be at least 1 tapp");
        require(_price >= 1 ether, "Offers: Offer must be at least 1 tapp");
        require(
            _contractAddress != address(0),
            "Offers: Invalid collection address"
        );
        require(
            tapp.allowance(msg.sender, address(this)) >= _price,
            "Offers: You don't have enough tapps to create this offer"
        );
        offersCount++;
        IERC721e(_contractAddress).createOffer(
            _tokenId,
            offersCount,
            msg.sender
        );
        Offer storage offer = offers[offersCount];
        offer.id = offersCount;
        offer.price = _price;
        offer.contractAddress = _contractAddress;
        offer.tokenId = _tokenId;
        offer.offeror = msg.sender;
    }

    function setTappContract(address _tappAddress) public onlyOwner {
        require(_tappAddress != address(0), "Offers: Invalid address");
        tapp = IERC20(_tappAddress);
    }

    function cancelOffer(uint256 _id) public {
        Offer storage offer = offers[_id];
        require(offer.offeror == msg.sender, "Offers: You can't cancel offer");
        offer.cancelled = true;
        IERC721e(offer.contractAddress).deleteOffer(offer.tokenId, offer.id);
    }

    function declineOffer(uint256 _id) public {
        Offer storage offer = offers[_id];
        require(
            IERC721(offer.contractAddress).ownerOf(offer.tokenId) == msg.sender,
            "Offers: You can't decline offer"
        );
        offer.declined = true;

        IERC721e(offer.contractAddress).deleteOffer(offer.tokenId, offer.id);
    }

    function acceptOffer(uint256 _id) public {
        Offer storage offer = offers[_id];
        
        require(
            IERC721(offer.contractAddress).ownerOf(offer.tokenId) == msg.sender,
            "Offers: You can't accept offer"
        );
        
        tapp.transferFrom(offer.offeror, msg.sender, offer.price);

        IERC721e(offer.contractAddress).userTransferFrom(
            msg.sender,
            offer.offeror,
            offer.tokenId
        );
    }

    function getOffersByIds(uint256[] calldata _ids)
        public
        view
        returns (Offer[] memory)
    {
        Offer[] memory _offers = new Offer[](_ids.length);

        for (uint256 i = 0; i < _ids.length; i++) {
            _offers[i] = offers[i + 1];
        }
        return _offers;
    }
}
