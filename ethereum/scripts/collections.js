
const hre = require("hardhat");

async function main() {
  const Collections = await hre.ethers.getContractFactory("Collections");
  const collections = await Collections.deploy();

  await collections.deployed();
  
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
