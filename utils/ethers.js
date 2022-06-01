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

export const getTappContract = (signer) => {
    return new ethers.Contract(process.env.NEXT_PUBLIC_LOCAL_TAPP, TappJSON.abi, signer)
}
export const getUserContract = (signer) => {
    return new ethers.Contract(process.env.NEXT_PUBLIC_LOCAL_USER, UserJSON.abi, signer)
}
export const getCollectionsContract = (signer) => {
    return new ethers.Contract(process.env.NEXT_PUBLIC_LOCAL_COLLECTIONS, CollectionsJSON.abi, signer)
}
export const getERC721Contract = (address, signer) => {
    return new ethers.Contract(address, ERC721JSON.abi, signer)
}

export const getMarketplaceContract = (signer) => {
    return new ethers.Contract(process.env.NEXT_PUBLIC_LOCAL_MARKETPLACE, MarketplaceJSON.abi, signer)
}
export const getAuctionsContract = (signer) => {
    return new ethers.Contract(process.env.NEXT_PUBLIC_LOCAL_AUCTIONS, AuctionsJSON.abi, signer)
}
export const getOffersContract = (signer) => {
    return new ethers.Contract(process.env.NEXT_PUBLIC_LOCAL_OFFERS, OffersJSON.abi, signer)
}