import { LoadingButton } from "@mui/lab"
import { Button, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Switch, TextField, Typography } from "@mui/material"
import { styled } from "@mui/system"
import { useState } from "react"
import { Web3Storage } from "web3.storage"
import { createCollection } from '../../apis/collections'
import { _w } from "../../utils/ethers"
import { useWeb3 } from "../../utils/web3-context"
import Alert from "../common/Alert"

export const MintingPaper = styled(Paper)({
    position: 'absolute',
    top: '15%',
    left: '25%',
    padding: '20px 30px',
    width: '50%'
})

export default function CreateCollectionForm ({ web3StorageKey, onSuccess }){

    const client = new Web3Storage({ token: web3StorageKey })
    const ipfsGateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY

    const { signer } = useWeb3()

    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false)
    const [alert, setAlert] = useState({})

    const [name, setName] = useState('')
    const [nameErr, setNameErr] = useState(false)

    const [symbol, setSymbol] = useState('')
    const [symbolErr, setSymbolErr] = useState(false)

    const [description, setDescription] = useState('')
    const [descriptionErr, setDescriptionErr] = useState(false)


    const [type, setType] = useState(0)

    const [bannerUri, setBannerUri] = useState('')

    const [buttonLoading, setButtonLoading] = useState(false)

    const validate = (value, callback) => {
        if (!value) callback(true)
        else callback(false)
    }

    const handleName = e => {
        const input = e.target.value
        validate(input, setNameErr)
        setName(input)
    }
    const handleSymbol = e => {
        const input = e.target.value
        validate(input, setSymbolErr)
        setSymbol(input)
    }
    const handleDescription = e => {
        const input = e.target.value
        validate(input, setDescriptionErr)
        setDescription(input)
    }

    const uploadBanner = async (ev) => {
        showAlert({ message: 'Uploading Banner' })
        try {
            const rootCID = await client.put(ev.target.files, { maxRetries: 2 })
            const _image = `https://${rootCID}.${ipfsGateway}/${ev.target.files[0].name}`
            setBannerUri(_image)

            hideAlert()
            showAlert({ message: 'Banner uploaded. It may take a while to appear. Please be patient' })
        } catch (err) {
            hideAlert()
            showAlert({ message: 'Error while uploading banner', type: 'error' })
        }
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
    const addCollection = async () => {
        if (!name || !description || !symbol) return showAlert({ message: 'Please provide all fields', type: 'warning' });
        if (!bannerUri) return showAlert({ message: 'Please choose a banner', type: 'warning' });
        try {
            setButtonLoading(true)

            const tx = await createCollection(name, symbol, bannerUri, description, type, signer)
            await tx.wait(1)

            onSuccess()
        } catch (err) {
            console.log(err)
            hideAlert()
            showAlert({ message: 'Error while creating nft', type: 'error' })
        }
        setButtonLoading(false)
    }

    return <MintingPaper>
        <Alert onClose={handleClose} isOpen={isSnackbarOpen} type={alert.type} message={alert.message} />
        <form>
            <Stack spacing={2}>
                <Typography variant="h5">
                    Create Collection
                </Typography>
                <TextField
                    error={nameErr}
                    helperText={nameErr && "Name is required"}
                    required
                    id="name"
                    label="Name"
                    value={name}
                    onChange={handleName}
                />
                <TextField
                    error={symbolErr}
                    helperText={symbolErr && "Symbol is required"}
                    required
                    id="symbol"
                    label="Symbol"
                    value={symbol}
                    onChange={handleSymbol}
                />
                <TextField
                    error={descriptionErr}
                    helperText={descriptionErr && "Description is required"}
                    required
                    id="description"
                    label="Description"
                    value={description}
                    onChange={handleDescription}
                />
                <Button
                    variant="outlined"
                    component="label"
                >
                    Upload Banner
                    <input
                        type="file"
                        hidden
                        onChange={uploadBanner}
                    />
                </Button>
                <FormControl>
                    <InputLabel id="type-label">Type</InputLabel>
                    <Select
                        labelId="type-label"
                        id="type-select"
                        value={type}
                        label="Type"
                        onChange={e => setType(e.target.value)}
                    >
                        <MenuItem value="0">ERC721</MenuItem>
                        <MenuItem value="1" disabled>ERC1155</MenuItem>
                    </Select>
                </FormControl>
                <LoadingButton
                    variant="contained"
                    component="label"
                    onClick={addCollection}
                    loading={buttonLoading}
                >
                    Create Collection
                </LoadingButton>
            </Stack>
        </form>
    </MintingPaper>
}