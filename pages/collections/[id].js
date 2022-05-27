import { Button, Grid, Stack, Typography, Modal, Chip, FormControl, InputLabel, Select, MenuItem } from "@mui/material"
import { useEffect, useState } from "react"
import Layout from "../../components/layout"
import NFTItem from "../../components/NFTItem"
import { useRouter } from "next/router"
import { useWeb3 } from "../../utils/web3-context"
import { getCollection } from "../../apis/collections"
import { getERC721LazyTokens, getERC721Tokens } from "../../apis/collection"
import CreateNFTForm from "../../components/collection/CreateNFTForm"
import { _e } from "../../utils/ethers"
import { Box, styled } from "@mui/system"
import ConnectWallet from "../../components/common/ConnectWallet"


const BannerBox = styled(Box)({
    position: 'absolute', top: '65px', left: '0', width: '100%', height: '400px', zIndex: -11
})
const Banner = styled('img')({
    height: 'inherit', width: 'inherit', objectFit: 'cover', zIndex: -10
})

export default ({ web3StorageKey }) => {
    const router = useRouter()

    const { signer, address, loading } = useWeb3()
    const { id } = router.query
    const [collection, setCollection] = useState({})
    const [tokens, setTokens] = useState([])
    const [lazyTokens, setLazyTokens] = useState([])
    const [openMintingModal, setOpenMintingModal] = useState(false)

    const [sort, setSort] = useState('newest')
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        if (address) loadTokens()
    }, [address])

    const loadTokens = async () => {
        const coll = await getCollection(id, signer)
        const [_tokens, _lazyTokens] = await Promise.all([
            getERC721Tokens(coll.collectionAddress, signer),
            getERC721LazyTokens(coll.collectionAddress, signer)
        ])

        setCollection(coll)
        setTokens([..._tokens].reverse())
        setLazyTokens(_lazyTokens.filter(t => !t.minted).reverse())

        console.log("Tokens loaded")
    }

    const _sortDescending = (array, attr) => {
        array.sort((a, b) => {
            return _e(b[attr]) - _e(a[attr])
        })
    }
    const _sortAscending = (array, attr) => {
        array.sort((a, b) => {
            return _e(a[attr]) - _e(b[attr])
        })
    }
    const sortTokens = (ev) => {
        const _sort = ev.target.value
        const _tokens = tokens;
        const _lazyTokens = lazyTokens;

        if (_sort === 'newest') {

            _sortDescending(_tokens, "id")
            _sortDescending(_lazyTokens, "id")

        }
        else if (_sort === 'oldest') {

            _sortAscending(_tokens, "id")
            _sortAscending(_lazyTokens, "id")

        } else if (_sort === 'highestprice') {
            _sortDescending(_lazyTokens, "price")
        } else if (_sort === 'lowestprice') {
            _sortAscending(_lazyTokens, "price")
        }

        setTokens(_tokens)
        setLazyTokens(_lazyTokens)

        setSort(_sort)
    }
    const handleOnSuccess = () => {
        setOpenMintingModal(false)
        loadTokens()
        
    }

    const CollectionStack = <Stack>
        <Grid container direction="row" justifyContent="space-between" sx={{ mt: '250px', color: 'white' }}>
            <Typography variant="h5">{collection.name}</Typography>
        </Grid>
        <Typography variant="body" sx={{ color: 'wheat' }}>{collection.description}</Typography>
        <Grid container direction="row" justifyContent="space-between" sx={{ mt: '15px' }}>
            <Grid item >
                <Chip sx={{ mr: '10px', color: 'lightblue' }} label={`${lazyTokens.length} Mintable NFTs`} />
                <Chip sx={{ color: 'lightblue' }} label={`${tokens.length} Minted NFTs`} />
            </Grid>
            {!loading && collection.owner == address && <Button variant="contained" color="success"
                onClick={e => setOpenMintingModal(true)}>
                Create
            </Button>}
        </Grid>
        <Grid container direction="row" justifyContent="flex-end" sx={{ mt: '45px' }}>
            <Grid item>

                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                    <InputLabel id="filter-label">filter</InputLabel>
                    <Select
                        labelId="filter-label"
                        id="filter-select"
                        value={filter}
                        label="Filter "
                        onChange={e => setFilter(e.target.value)}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="mintable">Mintable</MenuItem>
                        <MenuItem value="minted">Minted</MenuItem>
                    </Select>
                </FormControl>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                    <InputLabel id="sort-label">Sort</InputLabel>
                    <Select
                        labelId="sort-label"
                        id="sort-select"
                        value={sort}
                        label="Sort Items"
                        onChange={sortTokens}
                    >
                        <MenuItem value="newest">Newest</MenuItem>
                        <MenuItem value="oldest">Oldest</MenuItem>
                        <MenuItem value="highestprice">Highest Price</MenuItem>
                        <MenuItem value="lowestprice">Lowest Price</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
        </Grid>
        <Grid container spacing={12} sx={{ mt: '-40px', mb: '40px' }}>
            {(filter === 'all' || filter === 'mintable') && lazyTokens.map(t => <Grid item xs={12} md={4} lg={3} xl={3} key={t.id.toString()}>
                <NFTItem nft={t} collectionAddress={collection.collectionAddress} onMint={loadTokens} />
            </Grid>)}
            {(filter === 'all' || filter === 'minted') && tokens.map(t => <Grid item xs={12} md={4} lg={3} xl={3} key={t.id.toString()}>
                <NFTItem nft={t} collectionAddress={collection.collectionAddress} onMint={loadTokens} />
            </Grid>)}
        </Grid>
    </Stack>

    return <>
        {address && <BannerBox >
            <Banner src={collection.bannerUri || process.env.NEXT_PUBLIC_IMAGE_404} />
        </BannerBox>}
        <Layout>
            <Modal open={openMintingModal} onClose={() => setOpenMintingModal(false)}>
                <div>
                    <CreateNFTForm web3StorageKey={web3StorageKey} onSuccess={handleOnSuccess} collectionAddress={collection.collectionAddress} />
                </div>
            </Modal>
            {
                address ? CollectionStack :
                    !loading && <ConnectWallet withWrapper={true} />
            }
        </Layout>
    </>
}

export async function getServerSideProps() {
    const web3StorageKey = process.env.WEB3_STORAGE_API_TOKEN
    return {
        props: {
            web3StorageKey
        }
    }
}