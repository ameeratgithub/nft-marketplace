import { Button, Container, Grid, Modal, Stack, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { getAllCollections } from "../../apis/collections"
import CollectionCard from "../../components/collections/CollectionCard"
import CreateCollectionForm from "../../components/collections/CreateCollectionForm"
import ConnectWallet from "../../components/common/ConnectWallet"
import ConnectWalletModal from "../../components/common/ConnectWalletModal"
import Layout from "../../components/layout"
import { useWeb3 } from "../../utils/web3-context"


export default function Index({ web3StorageKey }) {
    const [collections, setCollections] = useState([])
    const { signer, address, loading } = useWeb3()

    const [openCreateModal, setOpenCreateModal] = useState(false)
    const [openConnectModal, setOpenConnectModal] = useState(false)

    useEffect(() => {
        loadCollections()
    }, [address, loading])
    const loadCollections = async () => {
        const _collections = await getAllCollections(signer)
        setCollections(_collections)
    }
    const handleOpenCreateModal = () => {
        if (!address && !loading) {
            setOpenConnectModal(true)
        } else {
            setOpenConnectModal(false)
            setOpenCreateModal(true)
        }
    }
    return <Layout>
        <Modal open={openCreateModal} onClose={() => setOpenCreateModal(false)}>
            <div>
                <CreateCollectionForm onSuccess={() => {
                    setOpenCreateModal(false)
                    loadCollections()
                }} web3StorageKey={web3StorageKey} />
            </div>
        </Modal>
        <ConnectWalletModal opened={openConnectModal} handleClose={() => setOpenConnectModal(false)}></ConnectWalletModal>
        <Grid container direction="row" spacing={3} sx={{ mt: '1px' }} justifyContent="space-between">
            <Grid item><Typography variant="h5">Collections</Typography></Grid>
            <Grid item >
                <Grid container direction="row" spacing={3}>
                    <Grid item><Button variant="contained" onClick={handleOpenCreateModal}>
                        Create
                    </Button>
                    </Grid>
                    {/* <Grid item><Button variant="contained" color="success">Add</Button></Grid> */}
                </Grid>
            </Grid>
        </Grid>
        <Grid container direction="row" spacing={4} sx={{ mt: '30px', mb: '30px' }}>
            {
                collections.map((c, i) => <Grid item md={4} key={i}>
                    <CollectionCard collection={c} /></Grid>)

            }
        </Grid>
    </Layout>
}

export async function getServerSideProps() {
    const web3StorageKey = process.env.WEB3_STORAGE_API_TOKEN
    return {
        props: {
            web3StorageKey
        }
    }
}