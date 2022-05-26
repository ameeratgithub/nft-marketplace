// SPDX-License-Identifier: None
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Tapp is ERC20, Ownable {
    uint256 public currentBalanceLimit = 4000 * 10**18;

    address public marketPlaceAddress;
    address public offersAddress;
    address public auctionsAddress;

    modifier validAddress(address _address) {
        require(_address != address(0), "Tapp: Invalid Address");
        _;
    }

    constructor() ERC20("Tapp", "TAP") {}

    function setMarketplaceAddress(address _address)
        public
        onlyOwner
        validAddress(_address)
    {
        marketPlaceAddress = _address;
    }

    function setOffersAddress(address _address)
        public
        onlyOwner
        validAddress(_address)
    {
        offersAddress = _address;
    }

    function setAuctionsAddress(address _address)
        public
        onlyOwner
        validAddress(_address)
    {
        auctionsAddress = _address;
    }

    function mint(uint256 _amount) external {
        require(
            balanceOf(msg.sender) + _amount <= currentBalanceLimit,
            "Tapp::mint:Limit reached"
        );

        _mint(msg.sender, _amount);

        if (marketPlaceAddress != address(0))
            _approve(msg.sender, marketPlaceAddress, _amount);
        if (offersAddress != address(0))
            _approve(msg.sender, offersAddress, _amount);
        if (auctionsAddress != address(0))
            _approve(msg.sender, auctionsAddress, _amount);
    }
}
