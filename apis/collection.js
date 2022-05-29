
import { getERC721Contract } from '../utils/ethers'



export const getERC721Tokens = (address, signer) => {
    const collection = getERC721Contract(address, signer)
    return collection.getTokensList()
}
export const getERC721LazyTokens = (address, signer) => {
    const collection = getERC721Contract(address, signer)
    return collection.getAllLazyTokens()
}
export const lazyAdd = (uri, price, address, signer) => {
    const collection = getERC721Contract(address, signer)
    return collection.addLazyToken(uri, price)
}
export const lazyMint = (lazyId, uri, address, signer) => {
    const collection = getERC721Contract(address, signer)
    return collection.mintLazyToken(lazyId, uri)
}

export const mint = (uri, address, signer) => {
    const collection = getERC721Contract(address, signer)
    return collection.mint(uri)
}
export const ownerOf721 = (tokenId, address, signer) => {
    const collection = getERC721Contract(address, signer)
    return collection.ownerOf(tokenId)
}
export const tokensByIds721 = (tokenIds, address, signer) => {
    const collection = getERC721Contract(address, signer)
    return collection.tokensByIds(tokenIds)
}
export const approvedAllContracts = (address, signer) => {
    const collection = getERC721Contract(address, signer)
    return collection.approvedAllContracts()
}