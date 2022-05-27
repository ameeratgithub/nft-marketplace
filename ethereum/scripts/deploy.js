
const { ethers } = require("hardhat");

let tapp, monuments, collections, user, offers, marketplace, auctions

const _e = (amount) => {
    return ethers.utils.parseEther(amount.toString())
}

async function deployMarketplace() {
    const Marketplace = await ethers.getContractFactory('Marketplace')
    marketplace = await Marketplace.deploy()
    await marketplace.deployed()

    console.log("Marketplace deployed at:", marketplace.address)
}

async function deployUser() {

    const User = await ethers.getContractFactory("User");
    user = await User.deploy();
    await user.deployed();

    console.log("User deployed to:", user.address);
}

async function deployAuctions() {
    const Auctions = await ethers.getContractFactory('Auctions')
    auctions = await Auctions.deploy()
    await auctions.deployed()

    console.log("Auctions deployed to:", auctions.address);
}

async function deployOffers() {
    const Offers = await ethers.getContractFactory('Offers')
    offers = await Offers.deploy()
    await offers.deployed()

    console.log("Offers deployed to:", offers.address);
}

async function deployTapp() {

    const Tapp = await ethers.getContractFactory("Tapp");
    tapp = await Tapp.deploy();
    await tapp.deployed();

    console.log("Tapp deployed to:", tapp.address);
}

async function assignTappAddresses() {
    await marketplace.setTappContract(tapp.address)
    await offers.setTappContract(tapp.address)
    await auctions.setTappContract(tapp.address)
}

async function setTappDependencies() {
    await tapp.setMarketplaceAddress(marketplace.address)
    await tapp.setOffersAddress(offers.address)
    await tapp.setAuctionsAddress(auctions.address)
}

async function deployMonuments() {
    const Monuments = await ethers.getContractFactory('Monuments')
    monuments = await Monuments.deploy(tapp.address, user.address, marketplace.address, offers.address, auctions.address)
    await monuments.deployed()
}

async function deployCollections() {
    const Collections = await ethers.getContractFactory("Collections");
    collections = await Collections.deploy(tapp.address, user.address, marketplace.address, offers.address, auctions.address);
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
    await addMintableItems()
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
    await deployMarketplace()

    await deployUser()

    await deployAuctions()

    await deployOffers()

    await deployTapp()

    await assignTappAddresses()

    await setTappDependencies()

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
