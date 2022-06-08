
import { getUserContract, SignerContracts, UserContract } from '../utils/ethers'


const user = UserContract
export const getUserProfile = async (userAddress, signer) => {
    const id = await user.users(userAddress)
    return user.profiles(id)
}
export const getUserProfileById = async (userId, signer) => {
    return user.profiles(userId)
}
export const getAllTokens = async (userId, signer) => {
    return user.getAllTokens(userId)
}
export const getUserId = async (userAddress, signer) => {
    return user.users(userAddress)
}
export const addUser = async (userAddress, signer) => {
    const signerUser = SignerContracts.userContract()
    return signerUser.add(userAddress)
}
export const changeName = async (userId, name, signer) => {
    const signerUser = SignerContracts.userContract()
    return signerUser.addName(userId, name)
}
export const changePicture = async (userId, picture, signer) => {
    const signerUser = SignerContracts.userContract()
    return signerUser.addPicture(userId, picture)
}
export const changeCover = async (userId, cover, signer) => {
    const signerUser = SignerContracts.userContract()
    return signerUser.addCover(userId, cover)
}
