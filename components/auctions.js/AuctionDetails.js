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

export default function Auction({ auctionItem, onImageError, onSuccess }) {
    const [sellerProfile, setSellerProfile] = useState({})
    const [participated, setParticipated] = useState(false)
    const [endTime, setEndTime] = useState(0)

    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false)
    const { signer, address, provider } = useWeb3()
    const [alert, setAlert] = useState({})

    const [bidders, setBidders] = useState([])

    const [isLoading, setIsLoading] = useState(false)


    const showAlert = (message, type) => {
        setIsSnackbarOpen(true)
        setAlert({ message, type })
    }
    const handleClose = () => {
        setIsSnackbarOpen(false)
    }

    useEffect(() => {
        intialize()
    }, [auctionItem])

    const intialize = async () => {
        const currentBlock = await provider.getBlockNumber()
        const endBlock = Number(auctionItem.endBlock.toString())

        console.log("AuctionDetails::Current Block:", currentBlock)
        console.log("AuctionDetails::End Block:", endBlock)

        if (currentBlock >= endBlock) {
            setEndTime(0)
        } else {
            const minutes = ((endBlock - currentBlock) * process.env.NEXT_PUBLIC_BLOCK_TIME) / 60
            if (parseInt(minutes) < 1) {
                setEndTime(Math.round(minutes * 10) / 10)
            } else {
                setEndTime(parseInt(minutes))
            }

        }
        const profile = await getUserProfile(auctionItem.seller, signer)
        setSellerProfile(profile)

        const profilePromises = [...auctionItem.bids].reverse().map(b => getUserProfile(b.bidder, signer))
        const profiles = await Promise.all(profilePromises)
        setBidders(profiles)

        const _participated = await hasParticipated(auctionItem.id, signer)
        setParticipated(_participated)
    }
    const endTheAuction = async () => {
        setIsLoading(true)
        try {
            const tx = await endAuction(auctionItem.id, signer)
            await tx.wait(1)
            setIsLoading(false)
            showAlert('Auction has been ended', 'info')
            onSuccess()
        } catch (err) {
            setIsLoading(false)
            console.log(err)
            showAlert('Unable to end auction', 'error')
        }

    }

    return <MintingPaper>
        <Alert onClose={handleClose} isOpen={isSnackbarOpen} message={alert.message} type={alert.type} />
        <Grid container direction="row" justifyContent="space-between">
            <Grid item>
                <Typography variant="h6">
                    Seller
                </Typography>
            </Grid>
            <Grid item>
                <NFTUserProfile onImageError={onImageError} profile={sellerProfile} />
            </Grid>
        </Grid>
        <Grid container direction="row" justifyContent="space-between" sx={{ mt: '20px', mb: '20px' }}>
            <Grid item>
                <Typography variant="subtitle1">
                    Ends In
                </Typography>
            </Grid>
            <Grid item>
                <Grid container direction="row" alignItems="center" spacing={2}>
                    <Grid item><Typography variant="body1">
                        {endTime > 0 ? `${endTime} minutes` : 'Expired'}
                    </Typography>
                    </Grid>
                    {
                        !auctionItem.ended && !auctionItem.cancelled && endTime <= 0 && (participated || auctionItem.seller === address) &&
                        <Grid item>
                            <LoadingButton loading={isLoading} onClick={endTheAuction} color="success" size="small">
                                End Auction
                            </LoadingButton>
                        </Grid>
                    }
                </Grid>
            </Grid>
        </Grid>
        <Grid container direction="row" justifyContent="space-between" sx={{ mt: '20px', mb: '20px' }}>
            <Grid item>
                <Typography variant="subtitle1">
                    Starting Price
                </Typography>
            </Grid>
            <Grid item>
                <Typography variant="body1">
                    {_e(auctionItem.startingPrice)} Tapps
                </Typography>
            </Grid>
        </Grid>
        <Divider sx={{ mb: '20px' }} />
        {
            auctionItem.bids.length > 0 ? [...auctionItem.bids].reverse().map((b, i) => {
                return <Grid container direction="row" alignItems="center" justifyContent="space-between" key={b.id}>
                    <Grid item sx={{mb:'10px'}}>
                        {bidders[i] && <NFTUserProfile onImageError={onImageError} profile={bidders[i]} />}
                    </Grid>
                    <Grid item>
                        <Typography variant="body1">
                            {_e(b.price)} Tapps
                        </Typography>
                        {/* {
                            b.bidder === address && (auctionItem.ended || auctionItem.cancelled) &&
                            <Button size="small">
                                Withdraw
                            </Button>
                        } */}
                    </Grid>

                </Grid>
            }) : <Typography>No Bid Found</Typography>
        }
    </MintingPaper >
}