import { LoadingButton } from "@mui/lab"
import { Divider, Grid, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { getBidderAuctionAmount, withdrawFromAuction } from "../../apis/auctions"
import { _e } from "../../utils/ethers"
import { useUpdatedDappProvider } from "../../utils/providers"
import { useWeb3 } from "../../utils/web3-context"
import { MintingPaper } from "../collections/CreateCollectionForm"
import Alert from "../common/Alert"

export default ({ bidAuctions, onSuccess }) => {
    const [currentBlock, setCurrentBlock] = useState(0)
    const [withdrawButtonLoading, setWithdrawButtonLoading] = useState(false)

    const { signer, address, loading, provider } = useWeb3()
    // const { loadTappData } = useUpdatedDappProvider()

    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false)
    const [alert, setAlert] = useState({})
    const [bidderAuctionAmounts, setbidderAuctionAmounts] = useState([])
    useEffect(() => {
        getCurrentBlock()
        if (address) loadBidderAuctionAmounts()
    }, [address])

    const loadBidderAuctionAmounts = async () => {
        const amounts = await Promise.all(bidAuctions.reverse().map(a => getBidderAuctionAmount(address, a.id, signer)))
        setbidderAuctionAmounts(amounts)
    }
    const showAlert = (message, type) => {
        setIsSnackbarOpen(true)
        setAlert({ message, type })
    }

    const getCurrentBlock = async () => {
        const block = await provider.getBlockNumber()
        setCurrentBlock(block)
    }
    const withdraw = async (id) => {
        setWithdrawButtonLoading(true)
        try {
            const tx = await withdrawFromAuction(id, signer)
            await tx.wait(1)
            showAlert('Amount successfully transferred to your account')
            setWithdrawButtonLoading(false)
            onSuccess()
            // loadTappData()
        } catch (err) {
            setWithdrawButtonLoading(false)
            console.log(err)
            showAlert('Error occured while transfering amount', 'error')
        }
    }

    return <MintingPaper>
        <Alert onClose={() => {
            setIsSnackbarOpen(false)
        }} isOpen={isSnackbarOpen} type={alert.type} message={alert.message} />
        <Grid container direction="row" justifyContent="space-between" sx={{ mb: '10px' }} alignItems="center">
            <Grid item md={3} lg={3}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>ID</Typography>
            </Grid>
            <Grid item md={3} lg={3}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Price to withdraw</Typography>
            </Grid>
            <Grid item sx={{ fontWeight: 'bold' }} md={3} lg={3}>
                Status
            </Grid>
            <Grid item sx={{ fontWeight: 'bold' }} md={3} lg={3}>
                Action
            </Grid>
        </Grid>
        <Divider />
        {bidAuctions.length > 0 ? bidAuctions.reverse().map((a, i) => {
            const amountToWithdraw = Number(_e(bidderAuctionAmounts[i]?.toString()))
            const myBids = a.bids.filter(b => b.bidder === address)
            // console.log("Amount To Withdraw", amountToWithdraw)
            const myHighestBidPrice = Number(_e(myBids[myBids.length - 1].price.toString()))
            const highestBidPrice = Number(_e(a.highestBid.price.toString()))
            const endBlock = Number(a.endBlock.toString())

            let action
            if (amountToWithdraw > 0) {
                if (myHighestBidPrice !== highestBidPrice && (a.ended || a.cancelled)) action = 'withdraw'
                if (myHighestBidPrice === highestBidPrice && a.ended) action = 'transferred'
                if (myHighestBidPrice === highestBidPrice && a.cancelled) action = 'withdraw'
            }

            let status
            if (a.ended) {
                status = 'Ended'
            } else if (a.cancelled) {
                status = 'Cancelled'
            } else if (endBlock <= currentBlock) {
                status = 'Expired'
            } else {
                status = 'Active'
            }
            return <Grid container direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: '20px' }} key={a.id.toString()}>
                <Grid item md={3} lg={3}>
                    <Typography variant="body1">{a.id.toString()}</Typography>
                </Grid>
                <Grid item md={3} lg={3}>
                    <Typography variant="body1">
                        {
                            amountToWithdraw
                        } Tapps
                    </Typography>
                </Grid>
                <Grid item md={3} lg={3}>
                    {status}
                </Grid>
                <Grid item md={3} lg={3}>
                    {action === 'withdraw' && <LoadingButton loading={withdrawButtonLoading} onClick={async () => await withdraw(a.id.toString())} variant="contained" size="small">
                        Withdraw
                    </LoadingButton>}
                    {action === 'transferred' && 'NFT Received'}
                    {!action && `N/A`}
                </Grid>
            </Grid>
        }) : <Typography sx={{ mt: '20px' }}>You haven't participated in any auction yet</Typography>}
    </MintingPaper>
}