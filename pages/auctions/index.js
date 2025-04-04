import { Button, CircularProgress, Grid, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { tokensByIds721 } from "../../apis/collection"
import Layout from "../../components/layout"
import NFTItem from "../../components/NFTItem"
import { groupBy } from "../../utils/common"
import { useWeb3 } from "../../utils/web3-context"
import ConnectWallet from "../../components/common/ConnectWallet"
import Link from 'next/link'
import { getAuctions } from "../../apis/auctions"

export default function Index() {
    const { signer, address, profile, loading } = useWeb3()
    const [tokens, setTokens] = useState({})
    const [currentLoading, setCurrentLoading] = useState(false)

    useEffect(() => {
        loadAuctionsData()
    }, [address])

    const loadAuctionsData = async () => {
        setCurrentLoading(true)
        const items = await getAuctions(signer)
        const groupedItems = groupBy(items, 'contractAddress')

        let nfts = []
        for (const contractAddress in groupedItems) {
            const tokenIds = groupedItems[contractAddress].map(i => i.tokenId.toString());
            const contractTokens = await tokensByIds721(tokenIds, contractAddress, signer)
            nfts = [...nfts, ...contractTokens]
        }
        setCurrentLoading(false)
        setTokens(nfts)
    }
    const handleCallBack = async () => {
        await loadAuctionsData()
    }
    return <Layout>
        {currentLoading || loading ? <CircularProgress sx={{position:'relative', left:'45%'}} color="secondary" /> : <>
            <Grid container direction="row" spacing={3} sx={{ mt: '1px' }} justifyContent="space-between">
                <Grid item><Typography variant="h5">Auctions</Typography></Grid>
                <Grid item >
                    {profile?.id && <Link href={`/users/${profile.id.toString()}`} passHref>
                        <Button variant="contained" color="success">
                            Sell Your NFT
                        </Button>
                    </Link>}
                </Grid>
            </Grid>
            <Grid container direction="row" spacing={12} sx={{ mt: '-30px', mb: '40px' }}>
                {tokens?.length > 0 ? tokens?.map(t => <Grid item xs={12} md={4} lg={3} xl={3} key={t.id.toString()}>
                    <NFTItem nft={t} onMint={handleCallBack} />
                </Grid>) : <Grid item><Typography variant="subtitle1">No NFT is on Auction right now</Typography></Grid>}
            </Grid>
        </>}
    </Layout>
}