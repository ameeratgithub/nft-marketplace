import { FavoriteBorder } from "@mui/icons-material"
import { Button, Chip, Grid, IconButton, LinearProgress, Paper, Stack, Typography } from "@mui/material"
import { styled } from "@mui/system"
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import { _e } from "../utils/ethers"
import { loadMetadata } from "../utils/ipfs"


const NFTImage = styled('img')({
    width: '235px',
    height: '300px',
    zIndex: '1',
    objectFit: 'cover',
    borderRadius: '10px',
    boxShadow: '0px 3px 5px -1px rgb(0 0 0 / 20%), 0px 5px 8px 0px rgb(0 0 0 / 14%), 0px 1px 14px 0px rgb(0 0 0 / 12%)'

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
export default ({ nft }) => {
    const [nftMeta, setNftMeta] = useState({})

    useEffect(() => {
        fetchNftMetaData()
    }, [])

    const fetchNftMetaData = async () => {
        const metaData = await loadMetadata(nft.uri)
        console.log(metaData)
        setNftMeta(metaData)
    }

    return <Stack sx={{ position: 'relative' }}>
        <NFTImage src={nftMeta.image} alt={nftMeta.name} sx={{ boxShadow: 4 }} />
        <Paper sx={{ padding: '15px', position: 'relative', left: "10px", top: '-10px' }} elevation={5}>
            <Stack sx={{ padding: '2px', pt: '15px' }}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                    <Typography variant="body" >{nftMeta.name}</Typography>
                    {nft.price && <Chip label={_e(nft.price)} size="small" />}
                </Stack>

                {/* <Typography variant="body2" sx={{ mt: '10px', mb: '10px' }}>{nftMeta.description}</Typography> */}
                {/* {nftMeta.attributes.map(
                    a => a.type == "bar" && <AttributeBar value={a.value} title={a.title} key={a.title} />
                )} */}
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between"
                    sx={{ mt: '10px' }}>
                    {
                        !nft.minted && !nft.owner && <Button variant="contained" size="small">Mint</Button>
                    }
                    <IconButton aria-label="like"><FavoriteBorder /></IconButton>
                </Stack>

            </Stack>
        </Paper>
    </Stack>

}