import { ethers } from 'ethers'

const TappJSON = require('../ethereum/artifacts/contracts/Tapp.sol/Tapp.json')
const CollectionsJSON = require('../ethereum/artifacts/contracts/Collections.sol/Collections.json')

export const _e = (wei) => Number(ethers.utils.formatEther(wei))
export const _w = (ether) => ethers.utils.parseEther(ether)

export const getTappContract = (signer) => {
    return new ethers.Contract(process.env.NEXT_PUBLIC_LOCAL_TAPP, TappJSON.abi, signer)
}
export const getCollectionsContract = (signer) => {
    return new ethers.Contract(process.env.NEXT_PUBLIC_LOCAL_COLLECTIONS, CollectionsJSON.abi, signer)
}