import { LoadingButton } from "@mui/lab"
import { Stack, TextField, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { createOffer } from "../../apis/offers"
import { _e, _w } from "../../utils/ethers"
import { useDappProvider, useUpdatedDappProvider } from "../../utils/providers"
import { useWeb3 } from "../../utils/web3-context"
import { MintingPaper } from "../collections/CreateCollectionForm"
import Alert from "../common/Alert"

export default function CreateOfferForm ({ nft, onSuccess }){

    const { signer, address } = useWeb3()

    const [offerPrice, setOfferPrice] = useState('1')
    const [offerPriceErr, setOfferPriceErr] = useState(false)


    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false)
    const [alert, setAlert] = useState({})

    const { tapp: { balance, limit } } = useDappProvider()
    const { loadTappData } = useUpdatedDappProvider()

    const [buttonLoading, setButtonLoading] = useState(false)

    useEffect(() => {
        if (address) loadTappData()
    }, [address])
    const validate = (value, callback) => {
        if (!value) callback(true)
        else callback(false)
    }
    const showAlert = (alert) => {
        setIsSnackbarOpen(true)
        setAlert(alert)
    }
    const handleClose = () => {
        setIsSnackbarOpen(false)
    }
    const handleOfferPrice = (e) => {
        const input = e.target.value
        validate(Number(input) > 0, setOfferPriceErr)
        setOfferPrice(input)
    }

    const createMyOffer = async () => {
        if (Number(offerPrice) < 1) return showAlert({ message: 'Price required', type: 'warning' })
        if (Number(balance) < Number(offerPrice)) return showAlert({ message: 'You don\'t have enough balance. Please mint some tokens first', type: 'warning' })
        setButtonLoading(true)
        try {
            const tx = await createOffer(nft.id, nft.contractAddress, _w(offerPrice), signer)
            await tx.wait(1)
            showAlert({ message: 'Offer sent to NFT owner' })
            setButtonLoading(false)
            onSuccess()
        } catch (err) {
            console.log(err)
            showAlert({ message: 'Unable to sent offer', type: "error" })
            setButtonLoading(false)
        }

    }
    return <MintingPaper>
        <Alert onClose={handleClose} isOpen={isSnackbarOpen} type={alert.type} message={alert.message} />
        <Typography variant="h5" sx={{ mb: '10px' }}>Create Offer</Typography>
        <Stack spacing={2}>
            <TextField
                error={offerPriceErr}
                helperText={offerPriceErr && `Please enter valid price`}
                label="Offer price of NFT (Tapps)"
                type="number"
                id="offer-price"
                value={offerPrice}
                InputLabelProps={{
                    shrink: true,
                }}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                onChange={handleOfferPrice}
            />
            <LoadingButton
                variant="contained"
                component="label"
                onClick={createMyOffer}
                loading={buttonLoading}
            >
                Create Offer
            </LoadingButton>
        </Stack>
    </MintingPaper>

}