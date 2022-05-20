
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
export const mint = (uri, address, signer) => {
    const collection = getERC721Contract(address, signer)
    return collection.mint(uri)
}