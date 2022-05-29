
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
export const withdraw = (id, signer) => {
    const auctions = getAuctionsContract(signer)
    return auctions.withdraw(id)
}
export const getAuction = (id, signer) => {
    const auctions = getAuctionsContract(signer)
    return auctions.getAuction(id)
}
export const hasParticipated = (id, signer) => {
    const auctions = getAuctionsContract(signer)
    return auctions.hasParticipated(id)
}
export const isExpired = (id, signer) => {
    const auctions = getAuctionsContract(signer)
    return auctions.isExpired(id)
}
