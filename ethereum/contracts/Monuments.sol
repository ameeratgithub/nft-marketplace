// SPDX-License-Identifier: NONE
pragma solidity ^0.8.9;

import "./standards/ERC721le.sol";

contract Monuments is ERC721le {
    constructor(
        address _tapp,
        address _userContract,
        address _marketplaceContract,
        address _offersContract
    )
        ERC721le(
            "Monument Valley",
            "MV",
            _tapp,
            msg.sender,
            _userContract,
            _marketplaceContract,
            _offersContract
        )
    {}
}
