
import { getERC721Contract, SignerContracts } from '../utils/ethers'



export const getERC721Tokens = (address) => {
    const collection = getERC721Contract(address)
    return collection.getTokensList()
}
export const getERC721LazyTokens = (address) => {
    const collection = getERC721Contract(address)
    return collection.getAllLazyTokens()
}
export const lazyAdd = (uri, price, address, signer) => {
    const collection = SignerContracts.erc721Contract(address)
    return collection.addLazyToken(uri, price)
}
export const lazyMint = (lazyId, uri, address, signer) => {
    const collection = SignerContracts.erc721Contract(address)
    return collection.mintLazyToken(lazyId, uri)
}

export const mint = (uri, address, signer) => {
    const collection = SignerContracts.erc721Contract(address)
    return collection.mint(uri)
}
export const ownerOf721 = (tokenId, address, signer) => {
    const collection = getERC721Contract(address)
    return collection.ownerOf(tokenId)
}
export const tokensByIds721 = (tokenIds, address, signer) => {
    const collection = getERC721Contract(address)
    return collection.tokensByIds(tokenIds)
}
export const approvedAllContracts = (userAddress, collectionaddress, signer) => {
    const collection = SignerContracts.erc721Contract(collectionaddress)
    return collection.approvedAllContracts(userAddress)
}
export const approveAllContracts = ( collectionaddress, signer) => {
    const collection = SignerContracts.erc721Contract(collectionaddress)
    return collection.approveAllContracts()
}