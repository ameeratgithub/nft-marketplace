import { LoadingButton } from "@mui/lab"
import { Stack, TextField, Typography } from "@mui/material"
import { placeBid } from "../../apis/auctions"
import { MintingPaper } from "../collections/CreateCollectionForm"
import Alert from "../common/Alert"

export default ({ auctionItem, onSuccess }) => {

    const [isButtonLoading, setIsButtonLoading] = useState(false)

    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false)
    const [alert, setAlert] = useState({})

    const [biddingPrice, setBiddingPrice] = useState('1')

    const highestBid = Number(_e(auctionItem.highestBid.price))
    const startingPrice = Number(_e(auctionItem.startingPrice))
    const highestPrice = highestBid > 0 ? highestBid : startingPrice;

    const showAlert = (message, type) => {
        setIsSnackbarOpen(true)
        setAlert({ message, type })
    }
    const handleClose = () => {
        setIsSnackbarOpen(false)
    }

    const placeAuctionBid = async () => {
        if (Number(biddingPrice) <= highestPrice) return showAlert('Please increase your bidding amount', 'warning')
        setIsButtonLoading(true)
        try {
            const tx = await placeBid(auctionItem.id, _w(biddingPrice), signer)
            await tx.wait(1)
            setIsButtonLoading(false)
            showAlert('Your bid has been placed')
            onSuccess()
        } catch (err) {
            setIsButtonLoading(false)
            console.log(err)
            showAlert('Unable to place bid', 'error')
        }

    }
    return <MintingPaper>
        <Alert onClose={handleClose} isOpen={isSnackbarOpen} type={alert.type} message={alert.message} />
        <Typography variant="h5" sx={{ mb: '12px' }}>Place Bid</Typography>
        <Typography sx={{ mb: '20px' }}>Bid more than {highestPrice} Tapps</Typography>

        <Stack spacing={2}>
            <TextField
                label="Bidding price (Tapps)"
                type="number"
                id="bidding-price"
                value={biddingPrice}
                InputLabelProps={{
                    shrink: true,
                }}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                onChange={(e) => setBiddingPrice(e.target.value)}
            />
            <LoadingButton
                variant="contained"
                component="label"
                onClick={placeAuctionBid}
                loading={isButtonLoading}
            >
                Place Bid
            </LoadingButton>
        </Stack>
    </MintingPaper>
}