import { Button, Divider, Grid, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { hasParticipated, endAuction } from "../../apis/auctions"
import { getUserProfile } from "../../apis/user"
import { _e } from "../../utils/ethers"
import { useWeb3 } from "../../utils/web3-context"
import { MintingPaper } from "../collections/CreateCollectionForm"
import { NFTUserProfile } from "../NFTItem"

import Alert from "../common/Alert"

import { LoadingButton } from '@mui/lab'
import { acceptOffer, declineOffer, getOffersByIds } from "../../apis/offers"

export default ({ nft, onImageError, onSuccess }) => {
    // const [sellerProfile, setSellerProfile] = useState({})
    // const [participated, setParticipated] = useState(false)
    // const [endTime, setEndTime] = useState(0)

    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false)
    const { signer, address, provider } = useWeb3()
    const [alert, setAlert] = useState({})

    const [offers, setOffers] = useState([])
    const [offerors, setOfferors] = useState([])

    const [isAcceptLoading, setIsAcceptLoading] = useState(false)
    const [isDeclineLoading, setIsDeclineLoading] = useState(false)


    const showAlert = (message, type) => {
        setIsSnackbarOpen(true)
        setAlert({ message, type })
    }
    const handleClose = () => {
        setIsSnackbarOpen(false)
    }

    useEffect(() => {

        if (address)
            intialize()

    }, [nft, address])

    const intialize = async () => {
        console.log(nft.offers)
        const offerItems = await getOffersByIds(nft.offers,signer)
        const profilePromises = offerItems.map(o => getUserProfile(o.offeror, signer))
        const profiles = await Promise.all(profilePromises)
        setOfferors(profiles)
        setOffers(offerItems)
    }
    const acceptTheOffer = async (offerId) => {
        setIsAcceptLoading(true)
        try {
            const tx = await acceptOffer(offerId, signer)
            await tx.wait(1)
            setIsAcceptLoading(false)
            showAlert('Offer has been accepted', 'info')
            onSuccess()
        } catch (err) {
            setIsAcceptLoading(false)
            console.log(err)
            showAlert('Unable to accept Offer. User may ran out of balance', 'error')
        }

    }
    const declineTheOffer = async (offerId) => {
        setIsDeclineLoading(true)
        try {
            const tx = await declineOffer(offerId, signer)
            await tx.wait(1)
            setIsDeclineLoading(false)
            showAlert('Offer has been declined', 'info')
            onSuccess()
        } catch (err) {
            setIsDeclineLoading(false)
            console.log(err)
            showAlert('Unable to decline the Offer. Please try again later', 'error')
        }

    }

    return <MintingPaper>
        <Alert onClose={handleClose} isOpen={isSnackbarOpen} message={alert.message} type={alert.type} />
        {
            offers.map((o, i) => {
                return <Grid container direction="row" alignItems="center" justifyContent="space-between" key={o.id.toString()}>
                    <Grid item>
                        {offerors[i] && <NFTUserProfile onImageError={onImageError} profile={offerors[i]} />}
                    </Grid>
                    <Grid item>
                        <Typography variant="body1">
                            {_e(o.price)} Tapps
                        </Typography>
                    </Grid>
                    <Grid item>
                        <LoadingButton variant="contained" loading={isAcceptLoading} onClick={() => { acceptTheOffer(o.id) }}
                            size="small" color="primary">
                            Accept
                        </LoadingButton>
                    </Grid>
                    <Grid item>
                        <LoadingButton variant="contained" loading={isDeclineLoading} onClick={() => { declineTheOffer(o.id) }}
                            size="small" color="warning">
                            Decline
                        </LoadingButton>
                    </Grid>

                </Grid>
            })
        }
    </MintingPaper >
}