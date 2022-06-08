
import { getMarketplaceContract, MarketplaceContract, SignerContracts } from '../utils/ethers'



export const getItemsOnSale = (signer) => {
    return MarketplaceContract.getItemsOnSale()
}
export const createMarketItem = (price, nftContract, tokenId, signer) => {
    const marketplace = SignerContracts.marketplaceContract()
    return marketplace.createMarketItem(price, nftContract, tokenId)
}
export const getMarketplaceItem = (id, signer) => {
    return MarketplaceContract.items(id)
}
export const cancelListing = (id, signer) => {
    const marketplace = SignerContracts.marketplaceContract()
    return marketplace.cancelListing(id)
}
export const createSale = (id, signer) => {
    const marketplace = SignerContracts.marketplaceContract()
    return marketplace.createSale(id)
}