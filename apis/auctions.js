
import { getAuctionsContract } from '../utils/ethers'



export const startAuction = (tokenId, contractAddress, startingPrice, endBlock, signer) => {
    const auctions = getAuctionsContract(signer)
    return auctions.startAuction(tokenId, contractAddress, startingPrice, endBlock)
}
export const placeBid = (id, price, signer) => {
    const auctions = getAuctionsContract(signer)
    return auctions.placeBid(id, price)
}
export const cancelAuction = (id, signer) => {
    const auctions = getAuctionsContract(signer)
    return auctions.cancelAuction(id)
}
export const endAuction = (id, signer) => {
    const auctions = getAuctionsContract(signer)
    return auctions.endAuction(id)
}
export const getBidderAuctionAmount=(address, id, signer)=>{
    const auctions = getAuctionsContract(signer)
    return auctions.bidderAuctionAmount(address, id)
}
export const withdrawFromAuction = (id, signer) => {
    const auctions = getAuctionsContract(signer)
    return auctions.withdraw(id)
}
export const getAuction = (id, signer) => {
    const auctions = getAuctionsContract(signer)
    return auctions.getAuction(id)
}
export const getAuctions = ( signer) => {
    const auctions = getAuctionsContract(signer)
    return auctions.getAuctions()
}
export const getMyBidAuctions = ( signer) => {
    const auctions = getAuctionsContract(signer)
    return auctions.getMyBidAuctions()
}
export const hasParticipated = (id, signer) => {
    const auctions = getAuctionsContract(signer)
    return auctions.hasParticipated(id)
}
export const isExpired = (id, signer) => {
    const auctions = getAuctionsContract(signer)
    return auctions.isExpired(id)
}
