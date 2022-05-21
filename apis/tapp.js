
import { getTappContract } from '../utils/ethers'



export const getUserBalance = (address, signer) => {
    const tapp = getTappContract(signer)
    return tapp.balanceOf(address)
}

export const getLimit = (signer) => {
    const tapp = getTappContract(signer)
    return tapp.currentBalanceLimit()
}
export const approve = (spender, amount, signer) => {
    const tapp = getTappContract(signer)
    return tapp.approve(spender, amount)
}

export const mint = (amount, signer) => {
    const tapp = getTappContract(signer)
    return tapp.mint(amount)
}