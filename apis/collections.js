
import { getCollectionsContract } from '../utils/ethers'



export const getAllCollections = (signer) => {
    const collections = getCollectionsContract(signer)
    return collections.getAllCollections()
}
export const getCollection = (id,signer) => {
    const collections = getCollectionsContract(signer)
    return collections.getCollection(id)
}