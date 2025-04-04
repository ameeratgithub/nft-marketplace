import CoinbaseWalletSDK from "@coinbase/wallet-sdk"
import WalletConnectProvider from "@walletconnect/web3-provider"
import { ethers } from "ethers"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import Web3Modal from 'web3modal'
import { addUser, getUserId, getUserProfile } from "../apis/user"
import { SignerContracts } from "./ethers"



const Web3Context = createContext()
const Web3UpdateContext = createContext()

let web3Modal

export const useWeb3 = () => {
    return useContext(Web3Context)
}
export const useWeb3Update = () => {
    return useContext(Web3UpdateContext)
}

const getDesiredChainId = () => {
    if (process) {
        const { NEXT_PUBLIC_APP_ENV, NEXT_PUBLIC_DEV_CHAINID, NEXT_PUBLIC_REL_CHAINID } = process.env
        const chainId = NEXT_PUBLIC_APP_ENV == 'development' ? NEXT_PUBLIC_DEV_CHAINID : NEXT_PUBLIC_REL_CHAINID
        return Number(chainId)
    }
    return 0;
}
const initializeWeb3Modal = () => {
    const providerOptions = {
        walletlink: {
            package: CoinbaseWalletSDK,
            options: {
                appName: 'Mumbai',
                rpc: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_MUMBAI_KEY}`
            }
        },
        walletconnect: {
            package: WalletConnectProvider,
            options: {
                appName: 'Mumbai',
                // rpc: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_MUMBAI_KEY}`
                rpc: {
                    137: 'https://matic-mumbai.chainstacklabs.com'
                }
            }
        }
    }

    web3Modal = new Web3Modal({
        network: 'matic',
        cacheProvider: true,
        providerOptions
    })

}

async function switchNetwork() {
    const provider = window.ethereum
    if (provider) {
        const chainId = ethers.utils.hexValue(getDesiredChainId())
        try {

            await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId }]
            })
            // window.location.reload()
            // return true
        } catch (error) {
            if (error.code === 4902) {
                provider.request({
                    method: "wallet_addEthereumChain",
                    params: [{
                        chainId,
                        rpcUrls: ["https://matic-mumbai.chainstacklabs.com"],
                        chainName: "Mumbai Testnet",
                        nativeCurrency: {
                            name: "MATIC",
                            symbol: "MATIC",
                            decimals: 18
                        },
                        blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
                    }]
                });
                // window.location.reload()
                return true
            }
            console.log("Failed to switch network")
            return false
        }
    }
    return false
}


export default ({ children }) => {
    const [context, setContext] = useState({ provider: null, signer: null, address: '', profile: {} })
    const [contextLoading, setContextLoading] = useState(true)

    useEffect(() => {
        initializeWeb3Modal()
    }, [])

    const loadAccount = async () => {
        let provider, signer

        if (window.ethereum) {
            provider = new ethers.providers.Web3Provider(window.ethereum, 'any')
            window.ethereum.once('accountsChanged', (accounts) => {
                loadAccount()
            })
            window.ethereum.once('chainChanged', function (chainId) {
                const desiredChainId = getDesiredChainId()
                if (chainId !== desiredChainId) {
                    switchNetwork()
                }
                window.location.reload()
            });
        } else {
            const item = localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER");

            if (!item) return

            const cachedProviderName = JSON.parse(item)

            const connector = web3Modal.providerController.providers.filter(p => p.id == cachedProviderName)[0].connector

            const options = web3Modal.providerController.providerOptions[cachedProviderName]

            const proxy = await connector(options.package, options.options)

            provider = new ethers.providers.Web3Provider(proxy)
        }


        signer = provider.getSigner()

        try {
            if (!provider) {
                provider = new ethers.providers.AlchemyProvider('maticmum', process.env.NEXT_PUBLIC_ALCHEMY_MUMBAI_KEY)
            }

            const address = await signer.getAddress()
            const { chainId } = await provider.getNetwork()

            const desiredChainId = getDesiredChainId()
            if (chainId !== desiredChainId) {
                return switchNetwork()
            }

            SignerContracts.setSigner(signer)

            let profile = await getUserProfile(address, signer);

            if (profile?.id && profile.id.toString() === "0") {
                const tx = await addUser(address, signer)
                await tx.wait(1)
                profile = await getUserProfile(address, signer);
            }

            setContext({ provider, signer, address, profile })
            setContextLoading(false)

            return { provider, signer, address, profile }
        } catch (err) {
            setContextLoading(false)
            provider = new ethers.providers.AlchemyProvider('maticmum', process.env.NEXT_PUBLIC_ALCHEMY_MUMBAI_KEY)
            setContext({ provider })
            console.log(err)
        }

    }

    const connect = async () => {

        try {

            const instance = await web3Modal.connect()

            const provider = new ethers.providers.Web3Provider(instance)
            const signer = provider.getSigner()
            const address = await signer.getAddress()

            const desiredChainId = getDesiredChainId()

            if (chainId !== desiredChainId) return switchNetwork()

            setContext({ provider, signer, address })
            window.location.reload()
        }
        catch (err) { }
    }

    const contextValue = useMemo(() => ({ ...context, loading: contextLoading, loadAccount }), [context, contextLoading])
    const contextConnect = useMemo(() => ({ connect }), [connect])

    return <Web3Context.Provider value={contextValue}>
        <Web3UpdateContext.Provider value={connect}>
            {children}
        </Web3UpdateContext.Provider>
    </Web3Context.Provider>

}