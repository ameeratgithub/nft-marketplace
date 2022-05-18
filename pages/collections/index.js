import { Container } from "@mui/material"
import { useEffect, useState } from "react"
import { getAllCollections } from "../../apis/collections"
import CollectionCard from "../../components/collections/CollectionCard"
import Layout from "../../components/layout"
import { useWeb3 } from "../../utils/web3-context"


export default ({ }) => {
    const [collections, setCollections] = useState([])
    const { signer, address } = useWeb3()
    useEffect(() => {
        if (address) loadCollections()
    }, [address])
    const loadCollections = async () => {
        const _collections = await getAllCollections(signer)
        setCollections(_collections)
    }
    return <Layout>
        <Container sx={{ display: 'flex', mt: '40px' }}>
            {
                collections.map((c,i) => <CollectionCard key={i} collection={c} />)
            }
        </Container>
    </Layout>
}

export async function getServerSideProps() {

    return {
        props: {}
    }
}