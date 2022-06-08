
import { getTappContract, SignerContracts, TappContract } from '../utils/ethers'



export const getUserBalance = (address, signer) => {
    return TappContract.balanceOf(address)
}

export const getLimit = (signer) => {
    return TappContract.currentBalanceLimit()
}

export const approve = (spender, amount, signer) => {
    const signerTapp = SignerContracts.tappContract()
    return signerTapp.approve(spender, amount)
}

export const mint = (amount, signer) => {
    const signerTapp = SignerContracts.tappContract()
    return signerTapp.mint(amount)
}