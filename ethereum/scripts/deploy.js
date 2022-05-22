
const hre = require("hardhat");

let tapp, monuments, collections, user

const _e = (amount) => {
    return ethers.utils.parseEther(amount.toString())
}

async function deployTapp() {

    const Tapp = await hre.ethers.getContractFactory("Tapp");
    tapp = await Tapp.deploy();
    await tapp.deployed();

    console.log("Tapp deployed to:", tapp.address);
}
async function deployUser() {

    const User = await hre.ethers.getContractFactory("User");
    user = await User.deploy();
    await user.deployed();

    console.log("User deployed to:", user.address);
}

async function deployMonuments() {
    const Monuments = await hre.ethers.getContractFactory("Monuments");
    monuments = await Monuments.deploy(tapp.address, user.address);
    await monuments.deployed();

    console.log("Monuments deployed to:", monuments.address);
}
async function deployCollections() {
    const Collections = await hre.ethers.getContractFactory("Collections");
    collections = await Collections.deploy(tapp.address, user.address);
    await collections.deployed();

    console.log("Collections deployed to:", collections.address);
}

async function addMonumentsToCollection() {
    
    await collections.addCollection(monuments.address)

    const banner = 'https://bafybeiavbtndduyxg3sd6nd3wpgnkn5tr2ot2modlajmruhto6adm7qtcu.ipfs.dweb.link/images/6.jpg'
    const description = 'An illusory adventure of impossible architecture and forgiveness'

    await collections.updateCollectionBanner(1, banner)
    await collections.updateCollectionDescription(1, description)
    const _collections = await collections.getAllCollections()
    console.log(_collections[0].collectionAddress)
    await addMintableItems()
    console.log(`Adding ${monuments.address} to ${collections.address}`)
}

async function addMintableItems() {
    const uris = []
    const prices = []

    const baseUri = 'https://bafybeicorp7kgx2katk6fjkb2wvoavhwymzkfdjj5qj2iv7g5bvespyqmq.ipfs.dweb.link/web.storage%20json/'

    for (let i = 1; i <= 16; i++) {
        uris.push(`${baseUri + i}.json`)
        prices.push(_e(50 * i))
    }

    await monuments.addLazyTokens(uris, prices)
}

async function main() {
    await deployTapp()

    await deployUser()
    
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
