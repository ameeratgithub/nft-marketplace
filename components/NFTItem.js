import { FavoriteBorder } from "@mui/icons-material"
import { Button, Chip, Grid, IconButton, LinearProgress, Paper, Stack, Typography } from "@mui/material"
import { styled } from "@mui/system"
import Link from "next/link"

import { useEffect, useState } from "react"
import { lazyMint } from "../apis/collection"
import { approve } from "../apis/tapp"
import { getUserProfile } from "../apis/user"
import { _e } from "../utils/ethers"
import { loadMetadata } from "../utils/ipfs"
import { useDappProvider } from "../utils/providers"
import { useWeb3 } from "../utils/web3-context"
import Alert from "./common/Alert"



const NFTImage = styled('img')({
    width: '235px',
    height: '300px',
    zIndex: '1',
    objectFit: 'cover',
    borderRadius: '10px',
    boxShadow: '0px 3px 5px -1px rgb(0 0 0 / 20%), 0px 5px 8px 0px rgb(0 0 0 / 14%), 0px 1px 14px 0px rgb(0 0 0 / 12%)'

})
const ProfileImage = styled('img')({
    width: '40px',
    height: '40px',
    objectFit: 'cover',
    borderRadius: '100%',

})


export const AttributeBar = ({ value, title }) => {
    return <Stack spacing={1} sx={{ mt: '10px' }}>
        <Typography variant="subtitle2">{title}</Typography>
        <Grid container direction="row" justifyContent="space-between" alignItems="center">
            <LinearProgress value={value * 10} variant="determinate" sx={{ width: '70%' }} />
            <Chip label={value} size="small" sx={{ position: 'absolute', right: '5%' }} />
        </Grid>
    </Stack>
}
export default ({ nft, collectionAddress, onMint }) => {
    const fallBackImage = process.env.NEXT_PUBLIC_IMAGE_404
    const [nftMeta, setNftMeta] = useState({})
    const [profile, setProfile] = useState({})
    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false)
    const { signer, address } = useWeb3()
    const [alert, setAlert] = useState({})
    const { tapp: { balance } } = useDappProvider()

    useEffect(() => {
        fetchNftMetaData()
        if (address && nft.owner) fetchUserProfile()
    }, [address])
    const fetchUserProfile = async () => {
        const p = await getUserProfile(nft.owner, signer)
        setProfile(p)
    }
    const fetchNftMetaData = async () => {
        try {
            const metaData = await loadMetadata(nft.uri)
            setNftMeta(metaData)
        } catch (err) {
            showAlert('Metadata of some NFTs is being pinned. It will be available in a while')
        }
    }
    const showAlert = (message, type) => {
        setIsSnackbarOpen(true)
        setAlert({ message, type })
    }
    const handleClose = () => {
        setIsSnackbarOpen(false)
    }
    const approveTapps = async () => {
        await approve(collectionAddress, nft.price, signer)
    }
    const mintLazy = async () => {
        if (balance < _e(nft.price)) {
            return showAlert(`You need ${_e(nft.price) - balance} more tapps to mint NFT`, 'warning')
        }
        try {
            await approveTapps()
            const tx = await lazyMint(nft.id, nft.uri, collectionAddress, signer)
            await tx.wait(1)
            showAlert(`NFT minted successfully`, 'info')
        } catch (err) {
            console.error(err)
            showAlert(`Error occured while minting NFT`, 'error')
        }
        onMint()
    }
    const onImageError = ({ currentTarget }) => {
        currentTarget.onerror = null
        currentTarget.src = fallBackImage
    }
    return <Stack sx={{ position: 'relative' }}>
        <Alert onClose={handleClose} isOpen={isSnackbarOpen} message={alert.message} type={alert.type} />
        <NFTImage src={nftMeta.image || fallBackImage} alt={nftMeta.name} sx={{ boxShadow: 4 }}
            onError={onImageError} />
        <Paper sx={{ padding: '15px', position: 'relative', left: "10px", top: '-10px' }} elevation={5}>
            <Stack sx={{ padding: '2px', pt: '15px' }}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                    <Typography variant="body" >{nftMeta?.name || 'Metadata Loading'}</Typography>
                    {nft.price && <Chip label={_e(nft.price)} size="small" />}
                </Stack>

                {/* <Typography variant="body2" sx={{ mt: '10px', mb: '10px' }}>{nftMeta.description}</Typography> */}
                {/* {nftMeta.attributes.map(
                    a => a.type == "bar" && <AttributeBar value={a.value} title={a.title} key={a.title} />
                )} */}
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between"
                    sx={{ mt: '10px' }}>
                    {
                        !nft.minted && !nft.owner && <Button variant="contained" size="small" onClick={mintLazy}>Mint</Button>
                    }
                    {
                        nft.owner && profile?.id && <Link href={`/users/${profile.id}`} passHref>
                            <a>
                                <ProfileImage src={profile.picture} alt={profile.name || profile.userAddress}
                                    onError={onImageError} />
                            </a>
                        </Link>
                    }
                    <IconButton aria-label="like"><FavoriteBorder /></IconButton>
                </Stack>

            </Stack>
        </Paper>
    </Stack>

}