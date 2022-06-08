
import { getOffersContract, OffersContract, SignerContracts } from '../utils/ethers'



export const createOffer = (tokenId, contractAddress, price, signer) => {
    const offers = SignerContracts.offersContract()
    return offers.createOffer(tokenId, contractAddress, price)
}
export const cancelOffer = (offerId, signer) => {
    const offers = SignerContracts.offersContract()
    return offers.cancelOffer(offerId)
}
export const declineOffer = (offerId, signer) => {
    const offers = SignerContracts.offersContract()
    return offers.declineOffer(offerId)
}
export const acceptOffer = (offerId, signer) => {
    const offers = SignerContracts.offersContract()
    return offers.acceptOffer(offerId)
}
export const getMyOffers = (signer) => {
    const offers = SignerContracts.offersContract()
    return offers.getMyOffers()
}
export const getOffersByIds = (offerIds, signer) => {
    return OffersContract.getOffersByIds(offerIds)
}
