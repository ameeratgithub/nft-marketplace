
import { CollectionsContract, getCollectionsContract, SignerContracts } from '../utils/ethers'



export const getAllCollections = (signer) => {
    return CollectionsContract.getAllCollections()
}
export const getCollection = (id, signer) => {
    return CollectionsContract.getCollection(id)
}
export const getUserCollections = (userAddress, signer) => {
    return CollectionsContract.getUserCollections(userAddress)
}

export const createCollection = (cname, symbol, bannerUri, description, type, signer) => {
    const collections = SignerContracts.collectionsContract()
    return collections.createCollection(cname, symbol, bannerUri, description, type)
}