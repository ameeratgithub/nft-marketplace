import { Alert, Container, Snackbar } from '@mui/material'
import { useEffect, useState } from 'react'
import { useWeb3 } from '../../utils/web3-context'
import ResponsiveAppBar from './Navbar'

export default function ({ children }) {

    const [isOpen, setIsOpen] = useState(false)
    const [profile, setProfile] = useState({})
    const [count, setCount] = useState(0)

    const { signer, provider, address, loadAccount, profile: _profile } = useWeb3()


    useEffect(() => {
        showConnectionMessage()
    }, [])
    useEffect(() => {
        if (_profile.userAddress) {
            setProfile(_profile)
        }
    }, [_profile])

    const showConnectionMessage = async () => {

        const account = await loadAccount()
    
        if (!account?.address && !isOpen) {
            setIsOpen(true)
        }

    }


    const handleClose = () => {
        setIsOpen(false)
    }

    return <>


        <ResponsiveAppBar profile={profile}></ResponsiveAppBar>


        <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={isOpen}
            onClose={handleClose} autoHideDuration={6000}>
            <Alert onClose={handleClose} severity="warning" sx={{ width: '100%' }}>
                Your wallet is not connected
            </Alert>
        </Snackbar>
        <Container>
            {children}
        </Container>
    </>
}