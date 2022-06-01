import { Button, Grid, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { tokensByIds721 } from "../../apis/collection"
import Layout from "../../components/layout"
import NFTItem from "../../components/NFTItem"
import { groupBy } from "../../utils/common"
import { useWeb3 } from "../../utils/web3-context"
import ConnectWallet from "../../components/common/ConnectWallet"
import Link from 'next/link'
import { getAuctions } from "../../apis/auctions"

export default ({ }) => {
    const { signer, address, profile } = useWeb3()
    const [tokens, setTokens] = useState({})

    useEffect(() => {
        if (address) loadAuctionsData()
    }, [address])

    const loadAuctionsData = async () => {
        const items = await getAuctions(signer)
        const groupedItems = groupBy(items, 'contractAddress')

        let nfts = []
        for (const contractAddress in groupedItems) {
            const tokenIds = groupedItems[contractAddress].map(i => i.tokenId.toString());
            const contractTokens = await tokensByIds721(tokenIds, contractAddress, signer)
            nfts = [...nfts, ...contractTokens]
        }

        setTokens(nfts)
    }
    const handleCallBack = async () => {
        await loadAuctionsData()
    }
    return <Layout>
        {!address && <ConnectWallet withWrapper={true} />}

        {
            address && <>
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
            </>
        }
    </Layout>
}