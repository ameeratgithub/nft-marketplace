
import { AuctionsContract, getAuctionsContract, SignerContracts } from '../utils/ethers'






export const startAuction = (tokenId, contractAddress, startingPrice, endBlock, signer) => {
    const signerAuctions = SignerContracts.auctionsContract()
    return signerAuctions.startAuction(tokenId, contractAddress, startingPrice, endBlock)
}
export const placeBid = (id, price, signer) => {
    const signerAuctions = SignerContracts.auctionsContract()
    return signerAuctions.placeBid(id, price)
}
export const cancelAuction = (id, signer) => {
    const signerAuctions = SignerContracts.auctionsContract()
    return signerAuctions.cancelAuction(id)
}
export const endAuction = (id, signer) => {
    const signerAuctions = SignerContracts.auctionsContract()
    return signerAuctions.endAuction(id)
}
export const getBidderAuctionAmount = (address, id, signer) => {
    const signerAuctions = SignerContracts.auctionsContract()
    return signerAuctions.bidderAuctionAmount(address, id)
}
export const withdrawFromAuction = (id, signer) => {
    const signerAuctions = SignerContracts.auctionsContract()
    return signerAuctions.withdraw(id)
}
export const getAuction = (id, signer) => {
    return AuctionsContract.getAuction(id)
}
export const getAuctions = (signer) => {
    return AuctionsContract.getAuctions()
}
export const getMyBidAuctions = (signer) => {
    const signerAuctions = SignerContracts.auctionsContract()
    return signerAuctions.getMyBidAuctions()
}
export const hasParticipated = (id, signer) => {
    const signerAuctions = SignerContracts.auctionsContract()
    return signerAuctions.hasParticipated(id)
}
export const isExpired = (id, signer) => {
    return AuctionsContract.isExpired(id)
}
