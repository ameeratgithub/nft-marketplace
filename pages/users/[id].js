import { useWeb3 } from "../../utils/web3-context"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Layout from "../../components/layout"
import { getAllTokens, getUserProfile, getUserProfileById } from "../../apis/user"
import { ownerOf721, tokensByIds721 } from "../../apis/collection"
import { Grid } from "@mui/material"
import NFTItem from "../../components/NFTItem"

export default ({ }) => {
    const router = useRouter()
    const { id } = router.query

    const { signer, address, loading } = useWeb3()
    const [profile, setProfile] = useState({})
    const [tokens, setTokens] = useState([])

    useEffect(() => {
        if (address) loadProfileData()
    }, [address])

    useEffect(() => {
        getNfts()
    }, [profile])

    const loadProfileData = async () => {
        await getProfile()
    }
    const getProfile = async () => {
        const _profile = await getUserProfileById(id, signer)
        setProfile(_profile)


    }
    const getNfts = async () => {
        if (!id) return
        const collections = await getAllTokens(id, signer)
        const promises = _buildPromises(collections)
        const results = await Promise.all(promises)

        const filteredResults = _filterResults(collections, results)

        const tokenPromises = filteredResults.map(c => tokensByIds721(c.tokens, c.collection, signer))

        const nfts = await Promise.all(tokenPromises)

        console.log(nfts)

        setTokens(...nfts)

    }

    const _buildPromises = (collections) => {
        const promisesArray = []
        collections.forEach((c, i) => {
            c.tokens.forEach((t, j) => {
                promisesArray.push(ownerOf721(t.toString(), c.collectionAddress, signer))
            })
        })
        return promisesArray
    }

    const _filterResults = (collections, results) => {
        const ownedNfts = []
        const nftIndex = 0;
        collections.forEach((c, i) => {
            const col = {}
            col.collection = c.collectionAddress
            col.tokens = []
            c.tokens.forEach((t, j) => {
                if (results[nftIndex] === profile.userAddress) {
                    col.tokens.push(t.toString())
                }
                nftIndex++;
            })
            ownedNfts.push(col)
        })
        return ownedNfts
    }



    return <Layout>
        <Grid container spacing={12} sx={{ mb: '40px' }}>
            {tokens.map(t => <Grid item xs={12} md={4} lg={3} xl={3} key={t.id.toString()}>
                <NFTItem nft={t} />
            </Grid>)}
        </Grid>
    </Layout>

}