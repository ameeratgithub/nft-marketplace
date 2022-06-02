import { LoadingButton } from "@mui/lab"
import { Button, FormControlLabel, FormGroup, Paper, Stack, Switch, TextField, Typography } from "@mui/material"
import { styled } from "@mui/system"
import { useState } from "react"
import { Web3Storage } from "web3.storage"
import { lazyAdd, mint } from "../../apis/collection"
import { _w } from "../../utils/ethers"
import { useWeb3 } from "../../utils/web3-context"
import { MintingPaper } from "../collections/CreateCollectionForm"
import Alert from "../common/Alert"

// const MintingPaper = styled(Paper)({
//     position: 'absolute',
//     top: '15%',
//     left: '25%',
//     padding: '20px 30px',
//     width: '50%'
// })

export default function CreateNFTForm({ web3StorageKey, collectionAddress, onSuccess }) {

    const client = new Web3Storage({ token: web3StorageKey })
    const ipfsGateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY

    const { signer, address } = useWeb3()

    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false)
    const [alert, setAlert] = useState({})

    const [name, setName] = useState('')
    const [nameErr, setNameErr] = useState(false)

    const [description, setDescription] = useState('')
    const [descriptionErr, setDescriptionErr] = useState(false)

    const [image, setImage] = useState('')

    const [mintNow, setMintNow] = useState(true)

    const [price, setPrice] = useState('')
    const [priceErr, setPriceErr] = useState(false)

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
    const handleDescription = e => {
        const input = e.target.value
        validate(input, setDescriptionErr)
        setDescription(input)
    }
    const handlePrice = e => {
        const input = e.target.value
        validate(Number(input) > 0 || Number(input) <= 2000, setPriceErr)
        setPrice(input)
    }
    const uploadImage = async (ev) => {
        showAlert({ message: 'Uploading Image' })
        try {
            // const rootCID = 'rootCID'
            const rootCID = await client.put(ev.target.files, { maxRetries: 2 })
            const _image = `https://${rootCID}.${ipfsGateway}/${ev.target.files[0].name}`
            setImage(_image)

            hideAlert()
            showAlert({ message: 'Image uploaded' })
        } catch (err) {
            hideAlert()
            showAlert({ message: 'Error while uploading image', type: 'error' })
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
    const uploadMetadata = async () => {
        if (!name || !description) return;
        if (!image) return showAlert({ message: 'Please choose an Image', type: 'warning' });
        if (!mintNow && !price) return showAlert({ message: 'Please enter minting price', type: 'warning' });

        try {
            setButtonLoading(true)
            const f = new File([JSON.stringify({ name, description, image })],
                "metadata.json", { type: 'application/json', lastModified: Date.now() })
            const rootCID = await client.put([f], { maxRetries: 2 })
            console.log("Metadata saved with hash", rootCID);

            showAlert({ message: 'Metadata is saved on IPFS. It may take a while to show metadata (image, name)' })
            const uri = `https://${rootCID}.${ipfsGateway}/metadata.json`;
            console.log("URI for NFT is", uri)
            let tx
            if (mintNow) tx = await mint(uri, collectionAddress, signer)
            else tx = await lazyAdd(uri, _w(price), collectionAddress, signer)
            await tx.wait(1)
            setButtonLoading(false)
            onSuccess()
        } catch (err) {
            console.log(err)
            setButtonLoading(false)
            showAlert({ message: 'Error while creating nft', type: 'error' })
        }

    }

    return <MintingPaper>
        <Alert onClose={handleClose} isOpen={isSnackbarOpen} type={alert.type} message={alert.message} />
        <form>
            <Stack spacing={2}>
                <Typography variant="h5">
                    Create NFT
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
                    Upload Image
                    <input
                        type="file"
                        hidden
                        onChange={uploadImage}
                    />
                </Button>
                <FormGroup>
                    <FormControlLabel control={
                        <Switch checked={mintNow} onChange={ev => setMintNow(ev.target.checked)
                        } />} label="Mint Now" />
                </FormGroup>
                {!mintNow && <TextField
                    error={priceErr}
                    helperText={priceErr && `Please enter valid price (Max 2000 Tapps)`}
                    label="Minting price of NFT (Tapps)"
                    type="number"
                    id="price"
                    value={price}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    onChange={handlePrice}
                />}
                <LoadingButton
                    variant="contained"
                    component="label"
                    onClick={uploadMetadata}
                    loading={buttonLoading}
                >
                    Create NFT
                </LoadingButton>
            </Stack>
        </form>
    </MintingPaper>
}