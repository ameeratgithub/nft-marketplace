
import { getMarketplaceContract } from '../utils/ethers'



export const getItemsOnSale = (signer) => {
    const marketplace = getMarketplaceContract(signer)
    return marketplace.getItemsOnSale()
}
export const createMarketItem = (price, nftContract, tokenId, signer) => {
    const marketplace = getMarketplaceContract(signer)
    return marketplace.createMarketItem(price, nftContract, tokenId)
}
export const getMarketplaceItem = (id, signer) => {
    const marketplace = getMarketplaceContract(signer)
    return marketplace.items(id)
}
export const cancelListing = (id, signer) => {
    const marketplace = getMarketplaceContract(signer)
    return marketplace.cancelListing(id)
}
export const createSale = (id, signer) => {
    const marketplace = getMarketplaceContract(signer)
    return marketplace.createSale(id)
}