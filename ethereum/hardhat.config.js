require("@nomiclabs/hardhat-waffle");
require('dotenv').config()


const fs = require("fs");
let rawdata = fs.readFileSync("H:/Practice/Secret/private_keys.json");

const PRIVATE_KEY = JSON.parse(rawdata).account4;

const alchemyMumbaiEndPoint = `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_MUMBAI_KEY}`
const infuraRinkeby = `https://rinkeby.infura.io/v3/${process.env.INFURA_RINKEBY_KEY}`;


// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      }
    }
  },
  networks: {
    rinkeby: {
      url: infuraRinkeby,
      accounts: [PRIVATE_KEY],
      gas: 2100000000,
      gasPrice: 80000000000,
    },
    mumbai: {
      url: alchemyMumbaiEndPoint,
      accounts: [PRIVATE_KEY],
      // gas: 2100000000,
      // gasPrice: 8000000000,
    }
  },
};
