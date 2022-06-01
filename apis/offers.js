
import { getOffersContract } from '../utils/ethers'



export const createOffer = (tokenId, contractAddress, price, signer) => {
    const offers = getOffersContract(signer)
    return offers.createOffer(tokenId, contractAddress, price)
}
export const cancelOffer = (offerId, signer) => {
    const offers = getOffersContract(signer)
    return offers.cancelOffer(offerId)
}
export const declineOffer = (offerId, signer) => {
    const offers = getOffersContract(signer)
    return offers.declineOffer(offerId)
}
export const acceptOffer = (offerId, signer) => {
    const offers = getOffersContract(signer)
    return offers.acceptOffer(offerId)
}
export const getMyOffers = (signer) => {
    const offers = getOffersContract(signer)
    return offers.getMyOffers()
}
export const getOffersByIds = (offerIds, signer) => {
    const offers = getOffersContract(signer)
    console.log("Offers contract: ",offers)
    return offers.getOffersByIds(offerIds)
}
