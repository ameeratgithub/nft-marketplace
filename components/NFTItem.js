import { FavoriteBorder } from "@mui/icons-material"
import { Button, Chip, Grid, IconButton, LinearProgress, Paper, Stack, Typography } from "@mui/material"
import { styled } from "@mui/system"


const NFTImage = styled('img')({
    width: '235px',
    height: '300px',
    zIndex: '1',
    // position: 'absolute',
    // top: '-50%',
    // left: '-175px',
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
    return <Stack sx={{ position: 'relative' }}>
        <NFTImage src={nft.image} alt={nft.name} sx={{ boxShadow: 4 }} />
        <Paper sx={{ padding: '15px', position: 'relative', left: "10px", top: '-10px' }} elevation={5}>
            <Stack sx={{ padding: '2px', pt: '15px' }}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                    <Typography variant="body" >{nft.name}</Typography>
                    <Chip label="1000" size="small" />
                </Stack>
                
                {/* <Typography variant="body2" sx={{ mt: '10px', mb: '10px' }}>{nft.description}</Typography> */}
                {/* {nft.attributes.map(
                    a => a.type == "bar" && <AttributeBar value={a.value} title={a.title} key={a.title} />
                )} */}
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between"
                    sx={{ mt: '10px' }}>
                    <Button variant="contained" size="small">Mint</Button>
                    <IconButton aria-label="like"><FavoriteBorder /></IconButton>
                </Stack>

            </Stack>
        </Paper>
    </Stack>

}