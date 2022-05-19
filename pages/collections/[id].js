import { Button, Grid, Stack, Typography, Modal } from "@mui/material"
import { useEffect, useState } from "react"
import Layout from "../../components/layout"
import { loadMetadata } from "../../utils/ipfs"
import NFTItem from "../../components/NFTItem"
import MintingForm from "../../components/MintingForm"
import { useRouter } from "next/router"
import { useWeb3 } from "../../utils/web3-context"

export default ({ }) => {
    const router = useRouter()

    const { signer, address } = useWeb3()
    const { id, type } = router.query

    // const [tokens, setTokens] = useState([])
    // const [openMintingModal, setOpenMintingModal] = useState(false)

    useEffect(() => {
        if (address) loadTokens()
    }, [address])

    const loadTokens = async () => {
        console.log(`ID: ${id}, Type:${type}`)
    }

    return <Layout>
        {/* <Modal open={openMintingModal} onClose={() => setOpenMintingModal(false)}>
            <div>
                <MintingForm />
            </div>
        </Modal>
        <Stack>
            <Grid container direction="row" justifyContent="space-between" sx={{ mt: '20px' }}>
                <Typography variant="h5">Monument Valley Collection</Typography>
                <Button variant="contained" color="success"
                    onClick={e => setOpenMintingModal(true)}>
                    Mint Custom NFT
                </Button>
            </Grid>
            <Grid container spacing={12} sx={{ mt: '1px', mb: '40px' }}>
                {json.map(j => <Grid item xs={12} md={4} lg={3} xl={3} key={j.name}>
                    <NFTItem nft={j} ></NFTItem>
                </Grid>)}
            </Grid>
        </Stack> */}
    </Layout>
}