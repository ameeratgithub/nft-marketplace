import { Button, Grid, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { tokensByIds721 } from "../../apis/collection"
import { getItemsOnSale } from "../../apis/marketplace"
import Layout from "../../components/layout"
import NFTItem from "../../components/NFTItem"
import { groupBy } from "../../utils/common"
import { useWeb3 } from "../../utils/web3-context"

import ConnectWallet from "../../components/common/ConnectWallet"

import Link from 'next/link'

export default function Index ({ }) {
    const { signer, address, profile, loading } = useWeb3()
    const [tokens, setTokens] = useState({})

    useEffect(() => {
        if (address) loadMarketplaceData()
    }, [address])

    const loadMarketplaceData = async () => {
        const items = await getItemsOnSale(signer)
        const groupedItems = groupBy(items, 'nftContract')

        let nfts = []
        for (const nftContract in groupedItems) {
            const tokenIds = groupedItems[nftContract].map(i => i.tokenId.toString());
            const contractTokens = await tokensByIds721(tokenIds, nftContract, signer)
            nfts = [...nfts, ...contractTokens]
        }

        setTokens(nfts)
    }
    const handleCallBack = async () => {
        await loadMarketplaceData()
    }
    return <Layout>
        {!address && !loading && <ConnectWallet withWrapper={true} />}

        {
            address && <>
                <Grid container direction="row" spacing={3} sx={{ mt: '1px' }} justifyContent="space-between">
                    <Grid item><Typography variant="h5">Marketplace</Typography></Grid>
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
                    </Grid>) : <Grid item><Typography variant="subtitle1">No Listing Item Found</Typography></Grid>}
                </Grid>
            </>
        }
    </Layout>
}