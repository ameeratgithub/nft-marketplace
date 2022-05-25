// SPDX-License-Identifier: None

pragma solidity ^0.8.9;

import "./interfaces/IERC721.sol";
import "./interfaces/IERC721e.sol";

contract Offers {
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

    mapping(uint256 => Offer) public offers;

    function createOffer(
        uint256 _tokenId,
        address _contractAddress,
        uint256 _price
    ) public {
        require(_price >= 1 ether, "Offers: Offer must be at least 1 ether");
        require(
            _contractAddress != address(0),
            "Offers: Invalid collection address"
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
}
