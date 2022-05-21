import { createContext, useContext, useEffect, useState } from "react"
import { getLimit, getUserBalance } from "../apis/tapp"
import { _e } from "./ethers"
import { useWeb3 } from "./web3-context"

const DappContext = createContext()
const UpdateDappContext = createContext()

export const useDappProvider = () => {
    return useContext(DappContext)
}
export const useUpdatedDappProvider = () => {
    return useContext(UpdateDappContext)
}

export const DappProvider = ({ children }) => {
    const initialState = {
        tapp: { balance: '', limit: '' }
    }

    const { signer, address } = useWeb3()
    const [context, setContext] = useState(initialState)

    useEffect(() => {
        if (address) initializeData()
    }, [address])

    const initializeData = async () => {
        loadTappData()
    }
    const loadTappData = async () => {
        const b = await getUserBalance(address, signer)
        const l = await getLimit(signer)
        setContext({ tapp: { balance: _e(b), limit: _e(l) - _e(b) } })
    }
    const methods = {
        loadTappData
    }
    return <DappContext.Provider value={context}>
        <UpdateDappContext.Provider value={methods}>
            {children}
        </UpdateDappContext.Provider>
    </DappContext.Provider>

} 