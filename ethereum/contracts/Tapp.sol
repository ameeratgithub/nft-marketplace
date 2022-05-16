// SPDX-License-Identifier: None
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Tapp is ERC20, Ownable {
    uint256 public currentBalanceLimit = 4000 * 10**18;

    address private _marketPlace;

    constructor() ERC20("Tapp", "TAP") {}

    function setMarketPlace(address marketPlace_) external onlyOwner {
        _marketPlace = marketPlace_;
    }

    function mint(uint256 _amount) external {
        require(
            balanceOf(msg.sender) + _amount <= currentBalanceLimit,
            "Tapp::mint:Limit reached"
        );

        _mint(msg.sender, _amount);

        if (_marketPlace != address(0))
            _approve(msg.sender, _marketPlace, _amount);
    }
}
