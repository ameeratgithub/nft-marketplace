import { ethers } from 'ethers'

const TappJSON = require('../ethereum/artifacts/contracts/Tapp.sol/Tapp.json')
const UserJSON = require('../ethereum/artifacts/contracts/User.sol/User.json')
const CollectionsJSON = require('../ethereum/artifacts/contracts/Collections.sol/Collections.json')
const ERC721JSON = require('../ethereum/artifacts/contracts/standards/ERC721le.sol/ERC721le.json')
const MarketplaceJSON = require('../ethereum/artifacts/contracts/Marketplace.sol/Marketplace.json')
const AuctionsJSON = require('../ethereum/artifacts/contracts/Auctions.sol/Auctions.json')
const OffersJSON = require('../ethereum/artifacts/contracts/Offers.sol/Offers.json')

export const _e = (wei) => {
    if (!wei) return 0
    return Number(ethers.utils.formatEther(wei))

}
export const _w = (ether) => {
    if (!ether) return 0
    return ethers.utils.parseEther(ether)
}
let tappAddress, userAddress, collectionsAddres, marketplaceAddress, auctionsAddress, offersAddress
let rpcProvider
if (process.env.NEXT_PUBLIC_APP_ENV === 'production') {
    tappAddress = process.env.NEXT_PUBLIC_TESTNET_TAPP
    userAddress = process.env.NEXT_PUBLIC_TESTNET_USER
    collectionsAddres = process.env.NEXT_PUBLIC_TESTNET_COLLECTIONS
    marketplaceAddress = process.env.NEXT_PUBLIC_TESTNET_MARKETPLACE
    auctionsAddress = process.env.NEXT_PUBLIC_TESTNET_AUCTIONS
    offersAddress = process.env.NEXT_PUBLIC_TESTNET_OFFERS
    rpcProvider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_PROD)
}
else if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
    tappAddress = process.env.NEXT_PUBLIC_LOCAL_TAPP
    userAddress = process.env.NEXT_PUBLIC_LOCAL_USER
    collectionsAddres = process.env.NEXT_PUBLIC_LOCAL_COLLECTIONS
    marketplaceAddress = process.env.NEXT_PUBLIC_LOCAL_MARKETPLACE
    auctionsAddress = process.env.NEXT_PUBLIC_LOCAL_AUCTIONS
    offersAddress = process.env.NEXT_PUBLIC_LOCAL_OFFERS
}

export const getTappContract = (signer) => {
    return new ethers.Contract(tappAddress, TappJSON.abi, rpcProvider)
}
export const getUserContract = (signer) => {
    return new ethers.Contract(userAddress, UserJSON.abi, rpcProvider)
}
export const getCollectionsContract = (signer) => {
    return new ethers.Contract(collectionsAddres, CollectionsJSON.abi, rpcProvider)
}
export const getERC721Contract = (address, signer) => {
    return new ethers.Contract(address, ERC721JSON.abi, rpcProvider)
}

export const getMarketplaceContract = (signer) => {
    return new ethers.Contract(marketplaceAddress, MarketplaceJSON.abi, rpcProvider)
}
export const getAuctionsContract = (signer) => {
    return new ethers.Contract(auctionsAddress, AuctionsJSON.abi, rpcProvider)
}
export const getOffersContract = (signer) => {
    return new ethers.Contract(offersAddress, OffersJSON.abi, rpcProvider)
}