const { ethers } = require("hardhat");


setInterval(() => {
    ethers.provider.send('evm_mine')
}, 1000)