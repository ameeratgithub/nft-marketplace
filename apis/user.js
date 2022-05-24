
import { getUserContract } from '../utils/ethers'

export const getUserProfile = async (userAddress, signer) => {
    const user = getUserContract(signer)
    const id = await user.users(userAddress)
    return user.profiles(id)
}
export const getUserProfileById = async (userId, signer) => {
    const user = getUserContract(signer)
    return user.profiles(userId)
}
export const getAllTokens = async (userId, signer) => {
    const user = getUserContract(signer)
    return user.getAllTokens(userId)
}
export const getUserId = async (userAddress, signer) => {
    const user = getUserContract(signer)
    return user.users(userAddress)
}
export const addUser = async (userAddress, signer) => {
    const user = getUserContract(signer)
    return user.add(userAddress)
}
export const changeName = async (userId, name, signer) => {
    const user = getUserContract(signer)
    return user.addName(userId, name)
}
export const changePicture = async (userId, picture, signer) => {
    const user = getUserContract(signer)
    return user.addPicture(userId, picture)
}
export const changeCover = async (userId, cover, signer) => {
    const user = getUserContract(signer)
    return user.addCover(userId, cover)
}
