
import { getMarketplaceContract } from '../utils/ethers'



export const getItemsOnSale = (signer) => {
    const marketplace = getMarketplaceContract(signer)
    return marketplace.getItemsOnSale()
}