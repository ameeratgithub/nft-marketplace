
const hre = require("hardhat");

let tapp, monuments, collections

async function deployTapp() {

    const Tapp = await hre.ethers.getContractFactory("Tapp");
    tapp = await Tapp.deploy();
    await tapp.deployed();

    console.log("Tapp deployed to:", tapp.address);
}

async function deployMonuments() {
    const Monuments = await hre.ethers.getContractFactory("Monuments");
    monuments = await Monuments.deploy(tapp.address);
    await monuments.deployed();

    console.log("Monuments deployed to:", monuments.address);
}
async function deployCollections() {
    const Collections = await hre.ethers.getContractFactory("Collections");
    collections = await Collections.deploy(tapp.address);
    await collections.deployed();

    console.log("Collections deployed to:", collections.address);
}

async function addMonumentsToCollection() {
    await collections.addCollection(tapp.address)

    const banner = 'https://bafybeiavbtndduyxg3sd6nd3wpgnkn5tr2ot2modlajmruhto6adm7qtcu.ipfs.dweb.link/images/6.jpg'

    await collections.updateCollectionBanner(1, banner)
}

async function addMintableItems() {
    const uris = []

    const baseUri = ''

    await monuments.addLazyTokens(uris)

    // const banner = 'https://bafybeiavbtndduyxg3sd6nd3wpgnkn5tr2ot2modlajmruhto6adm7qtcu.ipfs.dweb.link/images/6.jpg'

    await collections.updateCollectionBanner(1, banner)
}

async function main() {
    await deployTapp()
    await deployMonuments()
    await deployCollections()
    await addMonumentsToCollection()
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
