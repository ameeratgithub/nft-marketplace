import { Button, Container, Grid, Stack, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { getAllCollections } from "../../apis/collections"
import CollectionCard from "../../components/collections/CollectionCard"
import ConnectWallet from "../../components/common/ConnectWallet"
import Layout from "../../components/layout"
import { useWeb3 } from "../../utils/web3-context"


export default ({ }) => {
    const [collections, setCollections] = useState([])
    const { signer, address, loading } = useWeb3()
    useEffect(() => {
        if (address) loadCollections()
    }, [address, loading])
    const loadCollections = async () => {
        const _collections = await getAllCollections(signer)
        setCollections(_collections)
    }
    return <Layout>
        <Grid container direction="row" spacing={3} sx={{ mt: '1px' }} justifyContent="space-between">
            <Grid item><Typography variant="h5">Collections</Typography></Grid>
            <Grid item >
                <Grid container direction="row" spacing={3}>
                    <Grid item><Button variant="contained">Create</Button></Grid>
                    <Grid item><Button variant="contained" color="success">Add</Button></Grid>
                </Grid>
            </Grid>
        </Grid>
        <Container sx={{ display: 'flex', mt: '30px' }}>
            {
                address ? collections.map((c, i) => <CollectionCard key={i} collection={c} />) :
                    !loading && <ConnectWallet withWrapper={true} />
            }
        </Container>
    </Layout>
}

export async function getServerSideProps() {

    return {
        props: {}
    }
}