import { LoadingButton } from "@mui/lab"
import { Chip, Grid, Stack, TextField, Typography } from "@mui/material"
import { styled } from "@mui/system"
import { useState } from "react"
import { startAuction } from "../../apis/auctions"
import { createSale } from "../../apis/marketplace"
import { _e, _w } from "../../utils/ethers"
import { useWeb3 } from "../../utils/web3-context"
import { MintingPaper } from "../collections/CreateCollectionForm"
import Alert from "./Alert"

const SaleChip = styled(Chip)({
    fontSize: '14px',
    fontWeight: 'bold',
    padding: '10px'

})
export default ({ nft, onSuccess }) => {

    const { signer, address } = useWeb3()

    const [isListingSelected, setIsListingSelected] = useState(true)

    const [salePrice, setSalePrice] = useState('1')
    const [salePriceErr, setSalePriceErr] = useState(false)

    const [auctionPrice, setAuctionPrice] = useState('1')
    const [auctionPriceErr, setAuctionPriceErr] = useState(false)

    const [auctionTime, setAuctionTime] = useState('1')
    const [auctionTimeErr, setAuctionTimeErr] = useState(false)

    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false)
    const [alert, setAlert] = useState({})

    const [buttonLoading, setButtonLoading] = useState(false)

    const validate = (value, callback) => {
        if (!value) callback(true)
        else callback(false)
    }
    const showAlert = (alert) => {
        setIsSnackbarOpen(true)
        setAlert(alert)
    }
    const hideAlert = () => {
        setIsSnackbarOpen(false)
        setAlert({})
    }
    const handleClose = () => {
        setIsSnackbarOpen(false)
    }
    const handleSalePrice = (e) => {
        const input = e.target.value
        validate(Number(input) > 0, setSalePriceErr)
        setSalePrice(input)
    }
    const handleAuctionPrice = (e) => {
        const input = e.target.value
        validate(Number(input) > 0, setAuctionPriceErr)
        setAuctionPrice(input)
    }
    const handleAuctionTime = (e) => {
        const input = e.target.value
        validate(Number(input) > 0, setAuctionTimeErr)
        setAuctionTime(input)
    }

    const createListing = async () => {
        if (Number(salePrice) < 1) return showAlert({ message: 'Price required', type: 'warning' })
        setButtonLoading(true)
        try {
            const tx = await createMarketItem(_w(salePrice), nft.contractAddress, nft.id, signer)
            await tx.wait(1)
            showAlert({ message: 'NFT listed in marketplace' })
            setButtonLoading(false)
            onSuccess()
        } catch (err) {
            console.log(err)
            showAlert({ message: 'Unable to list NFT in marketplace', type: "error" })
            setButtonLoading(false)
        }

    }
    const createAuction = async () => {
        if (Number(auctionPrice) < 1) return showAlert({ message: 'Price required', type: 'warning' })
        if (Number(auctionTime) < 1) return showAlert({ message: 'Auction time required', type: 'warning' })
        setButtonLoading(true)
        try {
            const tx = await startAuction(nft.id, nft.contractAddress, _w(auctionPrice), (auctionTime * 60) / 5, signer)
            await tx.wait(1)
            showAlert({ message: 'Auction started' })
            setButtonLoading(false)
            onSuccess()
        } catch (err) {
            console.log(err)
            setButtonLoading(false)
            showAlert({ message: 'Error while starting auction', type: 'error' })
        }


    }
    return <MintingPaper>
        <Alert onClose={handleClose} isOpen={isSnackbarOpen} type={alert.type} message={alert.message} />
        <Typography variant="h5" sx={{ mb: '10px' }}>Sell Your NFT</Typography>
        <Grid container direction="row" spacing={2} sx={{ mb: '30px' }}>
            <Grid item>
                <SaleChip color="success" variant={isListingSelected ? "" : "outlined"} label="Create Listing"
                    onClick={() => setIsListingSelected(true)} />
            </Grid>
            <Grid item>
                <SaleChip color="success" variant={!isListingSelected ? "" : "outlined"} label="Put on Auction"
                    onClick={() => setIsListingSelected(false)} />
            </Grid>
        </Grid>
        {isListingSelected && <Stack spacing={2}>
            <TextField
                error={salePriceErr}
                helperText={salePriceErr && `Please enter valid price`}
                label="Sale price of NFT (Tapps)"
                type="number"
                id="sale-price"
                value={salePrice}
                InputLabelProps={{
                    shrink: true,
                }}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                onChange={handleSalePrice}
            />
            <LoadingButton
                variant="contained"
                component="label"
                onClick={createListing}
                loading={buttonLoading}
            >
                Create Sale
            </LoadingButton>
        </Stack>}
        {!isListingSelected && <Stack spacing={2}>
            <TextField
                error={auctionPriceErr}
                helperText={auctionPriceErr && `Please enter valid price`}
                label="Auction price of NFT (Tapps)"
                type="number"
                id="auction-price"
                value={auctionPrice}
                InputLabelProps={{
                    shrink: true,
                }}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                onChange={handleAuctionPrice}
            />
            <TextField
                error={auctionTimeErr}
                helperText={auctionTimeErr && `Please enter valid time`}
                label="Auction End Time (Minutes)"
                type="number"
                id="auction-time"
                value={auctionTime}
                InputLabelProps={{
                    shrink: true,
                }}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                onChange={handleAuctionTime}
            />
            <LoadingButton
                variant="contained"
                component="label"
                onClick={createAuction}
                loading={buttonLoading}
            >
                Start Auction
            </LoadingButton>
        </Stack>}
    </MintingPaper>

}