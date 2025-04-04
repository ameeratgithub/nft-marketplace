import { useWeb3 } from "../../utils/web3-context"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Layout from "../../components/layout"
import { changeCover, changeName, changePicture, getAllTokens, getUserProfileById } from "../../apis/user"
import { getUserCollections } from "../../apis/collections"

import { ownerOf721, tokensByIds721 } from "../../apis/collection"
import { Button, Chip, CircularProgress, Divider, Grid, IconButton, Menu, MenuItem, Modal, Paper, Stack, Tab, Tabs, TextField, Tooltip, Typography } from "@mui/material"
import NFTItem from "../../components/NFTItem"
import { Box, styled } from "@mui/system"
import { Box as MaterialBox } from "@mui/material"
import { Settings } from "@mui/icons-material"
import { LoadingButton } from "@mui/lab"
import { Web3Storage } from "web3.storage"
import Alert from "../../components/common/Alert"
import CollectionCard from "../../components/collections/CollectionCard"
import PropTypes from 'prop-types';
import { getMarketplaceItem } from "../../apis/marketplace"
import { getAuction, getMyBidAuctions } from "../../apis/auctions"
import { getMyOffers, cancelOffer } from "../../apis/offers"
import { groupBy } from "../../utils/common"
import { _e } from "../../utils/ethers"
import AuctionsStatus from "../../components/auctions.js/AuctionsStatus"



const BannerBox = styled(Box)({
    position: 'absolute', top: '65px', left: '0', width: '100%', height: '200px',
})
const BannerImage = styled('img')({
    height: 'inherit', width: 'inherit', objectFit: 'cover', zIndex: -10
})
const ProfileImage = styled('img')({
    height: '100px', width: '100px', objectFit: 'cover', border: '5px solid white', borderRadius: '100%',
})

const MintingPaper = styled(Paper)({
    position: 'absolute',
    top: '15%',
    left: '25%',
    padding: '20px 30px',
    width: '50%'
})

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box>
                    {children}
                    {/* <div>
                        <Typography></Typography>
                    </div> */}
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};


export default function Id({ web3StorageKey }) {

    const [openNameModal, setOpenNameModal] = useState(false)
    const [openPictureModal, setOpenPictureModal] = useState(false)
    const [openCoverModal, setOpenCoverModal] = useState(false)
    const [openAuctionStatusModal, setOpenAuctionStatusModal] = useState(false)

    const ipfsGateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY
    const client = new Web3Storage({ token: web3StorageKey })

    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false)
    const [alert, setAlert] = useState({})

    const [name, setName] = useState('')
    const [picture, setPicture] = useState('')
    const [cover, setCover] = useState('')

    const [buttonLoading, setButtonLoading] = useState(false)

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);



    const [tabValue, setTabValue] = useState(0);


    const router = useRouter()
    const { id } = router.query
    const [collections, setCollections] = useState([])

    const { signer, address, loading, provider } = useWeb3()
    const [profile, setProfile] = useState({})
    const [tokens, setTokens] = useState([])
    const [bidTokens, setBidTokens] = useState([])
    const [bidAuctions, setBidAuctions] = useState([])
    const [myOffers, setMyOffers] = useState([])
    const [myOfferTokens, setMyOfferTokens] = useState([])

    const [currentLoading, setCurrentLoading] = useState(false)

    useEffect(() => {
        setTabValue(0)
        loadProfileData()
    }, [address, loading, id, router.query.id])
    const handleTabChange = (event, newValue) => {
        if (profile.userAddress !== address && newValue > 1) {
            setTabValue(0)
        } else
            setTabValue(newValue);
    };



    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleModalClose = () => {
        setAnchorEl(null);
    };

    const showAlert = (alert) => {
        setIsSnackbarOpen(true)
        setAlert(alert)
    }
    const hideAlert = () => {
        setIsSnackbarOpen(false)
        setAlert({})
    }
    useEffect(() => {
        if (profile.id) {
            getCollections()
            getNfts()
            getBidTokens()
            fetchMyOffers()
        }
    }, [profile])



    const loadProfileData = async () => {
        getProfile()
    }
    const getCollections = async () => {
        setCurrentLoading(true)
        const _collections = await getUserCollections(profile.userAddress, signer)
        setCollections(_collections)
    }
    const getProfile = async () => {
        const _profile = await getUserProfileById(id, signer)
        setProfile(_profile)
    }
    const fetchMyOffers = async () => {
        if (profile.userAddress !== address) {
            return
        }
        const offers = [...await getMyOffers(signer)].reverse()
        const groupedOffers = groupBy(offers, 'contractAddress')

        let offerTokens = []
        for (const contractAddress in groupedOffers) {
            const tokenIds = groupedOffers[contractAddress].map(i => i.tokenId.toString());
            const contractTokens = await tokensByIds721(tokenIds, contractAddress, signer)
            offerTokens = [...offerTokens, ...contractTokens]
        }

        setMyOfferTokens(offerTokens)
        setMyOffers(offers)

    }
    const getNfts = async () => {
        if (!id) return
        const collections = await getAllTokens(id, signer)
        const promises = _buildPromises(collections)
        const results = await Promise.all(promises)

        const filteredResults = await _filterResults(collections, results)

        const tokenPromises = filteredResults.map(c => tokensByIds721(c.tokens, c.collection, signer))

        const nfts = await Promise.all(tokenPromises)

        setCurrentLoading(false)
        setTokens(...nfts)

    }
    const getBidTokens = async () => {
        if (profile.userAddress !== address) {
            return
        }


        const items = await getMyBidAuctions(signer)
        const _itemsPromise = items.map(i => {
            return getAuction(i.id.toString(), signer)
        })
        const _bidAuctions = await Promise.all(_itemsPromise)

        const groupedItems = groupBy(items, 'contractAddress')

        let nfts = []
        for (const contractAddress in groupedItems) {
            const tokenIds = groupedItems[contractAddress].filter(i => !i.ended && !i.cancelled).map(i => i.tokenId.toString());
            const contractTokens = await tokensByIds721(tokenIds, contractAddress, signer)
            nfts = [...nfts, ...contractTokens]
        }

        setBidAuctions(_bidAuctions)
        setBidTokens(nfts)
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

    const _filterResults = async (collections, results) => {
        const ownedNfts = []
        const nftIndex = 0;
        for (const c of collections) {
            const col = {}
            col.collection = c.collectionAddress
            col.tokens = []
            for (const t of c.tokens) {
                if (results[nftIndex] === profile.userAddress) {
                    col.tokens.push(t.toString())
                } else {
                    if (!t) return
                    const _tokens = await tokensByIds721([t.toString()], c.collectionAddress, signer)
                    const marketItemId = _tokens[0].marketItemId.toString()
                    const auctionId = _tokens[0].auctionId.toString()
                    if (marketItemId !== "0") {
                        const marketItem = await getMarketplaceItem(marketItemId, signer)
                        if (marketItem.seller === profile.userAddress) {
                            col.tokens.push(t.toString())
                        }
                    } else if (auctionId !== "0") {
                        const auctionItem = await getAuction(auctionId, signer)
                        if (auctionItem.seller === profile.userAddress) {
                            col.tokens.push(t.toString())
                        }
                    }

                }
                nftIndex++;
            }
            ownedNfts.push(col)
        }
        return ownedNfts
    }

    const uploadProfilePicture = async (ev) => {
        showAlert({ message: 'Uploading Image' })
        try {
            const rootCID = await client.put(ev.target.files, { maxRetries: 2 })
            const _image = `https://${rootCID}.${ipfsGateway}/${ev.target.files[0].name}`
            setPicture(_image)

            hideAlert()
            showAlert({ message: 'Image uploaded. It may take a while to appear. Please be patient' })
        } catch (err) {
            hideAlert()
            showAlert({ message: 'Error while uploading image', type: 'error' })
        }

    }
    const uploadCoverPhoto = async (ev) => {
        showAlert({ message: 'Uploading Image' })
        try {
            const rootCID = await client.put(ev.target.files, { maxRetries: 2 })
            const _image = `https://${rootCID}.${ipfsGateway}/${ev.target.files[0].name}`
            setCover(_image)

            hideAlert()
            showAlert({ message: 'Image uploaded. It may take a while to appear. Please be patient' })
        } catch (err) {
            hideAlert()
            showAlert({ message: 'Error while uploading image', type: 'error' })
        }
    }
    const saveName = async () => {
        if (!name) return
        setButtonLoading(true)

        try {
            const tx = await changeName(id, name, signer)
            await tx.wait(1)
            loadProfileData()
            getNfts()
        } catch (err) {
            showAlert({ message: 'Unable to save name', type: 'error' })
        }
        showAlert({ message: 'Changes saved' })
        setButtonLoading(false)
        setOpenNameModal(false)
    }
    const saveProfilePicture = async () => {
        if (!picture) return
        setButtonLoading(true)

        try {
            const tx = await changePicture(id, picture, signer)
            await tx.wait(1)
            loadProfileData()
            getNfts()
        } catch (err) {
            showAlert({ message: 'Unable to save picture', type: 'error' })
        }
        showAlert({ message: 'Changes saved' })
        setButtonLoading(false)
        setOpenPictureModal(false)
    }
    const saveCoverPhoto = async () => {
        if (!cover) return
        setButtonLoading(true)

        try {
            const tx = await changeCover(id, cover, signer)
            await tx.wait(1)
            loadProfileData()
            getNfts()
        } catch (err) {
            showAlert({ message: 'Unable to save cover', type: 'error' })
        }
        showAlert({ message: 'Changes Saved' })
        setButtonLoading(false)
        setOpenCoverModal(false)
    }

    const cancelMyOffer = async (offerId) => {
        setButtonLoading(true)
        try {
            const tx = await cancelOffer(offerId, signer)
            await tx.wait(1)
            showAlert({ message: 'Offer cancelled' })
            loadProfileData()
            fetchMyOffers()
        } catch (err) {
            showAlert({ message: 'Unable to cancel offer', type: 'error' })
        }
        setButtonLoading(false)
    }

    const SettingMenu = <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleModalClose}
        onClick={handleModalClose}
        PaperProps={{
            elevation: 0,
            sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                },
                '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                },
            },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
        <MenuItem onClick={() => setOpenNameModal(true)} >
            Change Name
        </MenuItem>
        <MenuItem onClick={() => setOpenPictureModal(true)}>
            Change Profile Picture
        </MenuItem>
        <MenuItem onClick={() => setOpenCoverModal(true)}>
            Change Cover Photo
        </MenuItem>
    </Menu>

    return <>
        <Alert onClose={() => {
            setIsSnackbarOpen(false)
        }} isOpen={isSnackbarOpen} type={alert.type} message={alert.message} />
        <Modal open={openNameModal} onClose={() => setOpenNameModal(false)}>
            <div>
                <MintingPaper>
                    <Stack spacing={2}>
                        <Typography variant="h5">
                            Change Name
                        </Typography>
                        <TextField
                            required
                            id="name"
                            label="Name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                        <LoadingButton
                            variant="contained"
                            component="label"
                            onClick={saveName}
                            loading={buttonLoading}
                        >
                            Save
                        </LoadingButton>
                    </Stack>
                </MintingPaper>
            </div>
        </Modal>
        <Modal open={openPictureModal} onClose={() => setOpenPictureModal(false)}>
            <div>
                <MintingPaper>
                    <Stack spacing={2}>
                        <Typography variant="h5">
                            Change Name
                        </Typography>

                        <Button
                            variant="outlined"
                            component="label"
                        >
                            Upload Profile Picture
                            <input
                                type="file"
                                hidden
                                onChange={uploadProfilePicture}
                            />
                        </Button>
                        <LoadingButton
                            variant="contained"
                            component="label"
                            onClick={saveProfilePicture}
                            loading={buttonLoading}
                        >
                            Save
                        </LoadingButton>
                    </Stack>
                </MintingPaper>
            </div>
        </Modal>
        <Modal open={openCoverModal} onClose={() => setOpenCoverModal(false)}>
            <div>
                <MintingPaper>
                    <Stack spacing={2}>
                        <Typography variant="h5">
                            Change Cover
                        </Typography>

                        <Button
                            variant="outlined"
                            component="label"
                        >
                            Upload Cover Photo
                            <input
                                type="file"
                                hidden
                                onChange={uploadCoverPhoto}
                            />
                        </Button>
                        <LoadingButton
                            variant="contained"
                            component="label"
                            onClick={saveCoverPhoto}
                            loading={buttonLoading}
                        >
                            Save
                        </LoadingButton>
                    </Stack>
                </MintingPaper>
            </div>
        </Modal>
        <Modal open={openAuctionStatusModal} onClose={() => setOpenAuctionStatusModal(false)}>
            <div>
                <AuctionsStatus bidAuctions={bidAuctions} onSuccess={() => {
                    loadProfileData()
                    setOpenAuctionStatusModal(false)
                }} />
            </div>
        </Modal>
        <BannerBox >
            <BannerImage src={profile.cover || process.env.NEXT_PUBLIC_IMAGE_404} />

            <Stack alignItems="center" sx={{ mt: "-60px" }}>
                <ProfileImage src={profile.picture || process.env.NEXT_PUBLIC_IMAGE_404} />
                <Typography variant="h6">{profile.name || 'User#' + profile.id}</Typography>
                <Stack direction="row" >
                    <Chip sx={{ ml: '30px' }} variant="outlined" label={`${profile.userAddress?.slice(0, 6)}...${profile.userAddress?.slice(-4)}`} />
                    {profile.userAddress === address && <Tooltip title="Account settings">
                        <IconButton
                            onClick={handleClick}
                            size="small"
                            sx={{ position: 'relative', left: '10px' }}
                            aria-controls={open ? 'account-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                        >
                            <Settings fontSize="small" />
                        </IconButton>
                    </Tooltip>}
                </Stack>
                {SettingMenu}
            </Stack>
        </BannerBox>
        <Layout>
            <Stack sx={{ mt: '350px' }}>
                <Box>
                    <MaterialBox sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs example">
                            <Tab label={`Owned (${tokens?.length || 0})`} />
                            <Tab label={`Collections (${collections?.length || 0})`} />
                            {profile.userAddress === address && <Tab label={`My Bids (${bidTokens?.length || 0})`} />}
                            {profile.userAddress === address && <Tab label={`My Offers (${myOffers?.length || 0})`} />}
                        </Tabs>
                    </MaterialBox>
                    <TabPanel value={tabValue} index={0}>
                        <Grid container spacing={12} sx={{ mt: '-40px', mb: '40px' }}>
                            {currentLoading || loading ? <Grid item><CircularProgress sx={{ position: 'relative', left: '45%' }} color="secondary" /></Grid> : tokens?.length > 0 ? tokens?.map(t => <Grid item xs={12} md={4} lg={3} xl={3} key={t.id.toString()}>
                                <NFTItem nft={t} onMint={loadProfileData} />
                            </Grid>) : <Grid item><Typography variant="subtitle1">No Owned NFT Found</Typography></Grid>}
                        </Grid>
                    </TabPanel>
                    <TabPanel value={tabValue} index={1} >
                        <Grid container direction="row" spacing={4} sx={{ mt: '-10px' }}>
                            {
                                currentLoading || loading ? <Grid item><CircularProgress sx={{ position: 'relative', left: '45%' }} color="secondary" /></Grid> : collections?.length > 0 ? collections?.map((c, i) =>
                                    <Grid key={i} item lg={4} xl={4} md={4} sm={12}>
                                        <CollectionCard collection={c} />
                                    </Grid>
                                ) : <Grid item> <Typography variant="subtitle1">No Collection Found</Typography></Grid>
                            }
                        </Grid>
                    </TabPanel>
                    {profile.userAddress === address && <TabPanel value={tabValue} index={2}>
                        <Grid container direction="row" justifyContent="flex-end" sx={{ mt: '20px' }}>
                            <Grid item>
                                <Button variant="contained" size="small" onClick={() => setOpenAuctionStatusModal(true)}>Auctions Status</Button>
                            </Grid>
                        </Grid>
                        <Grid container spacing={12} sx={{ mt: '-40px', mb: '40px' }}>
                            {bidTokens?.length > 0 ? bidTokens?.map(t => <Grid item xs={12} md={4} lg={3} xl={3} key={t.id.toString()}>
                                <NFTItem nft={t} onMint={loadProfileData} />
                            </Grid>) : <Grid item><Typography variant="subtitle1">You don&apos;t have active bids. You can check status of your previous bids by clicking &apos;Auctions Status&apos; button</Typography></Grid>}
                        </Grid>
                    </TabPanel>}
                    {profile.userAddress === address && <TabPanel value={tabValue} index={3}>
                        <Grid container direction="column" spacing={12} sx={{ mt: '-40px', mb: '40px' }}>
                            {myOffers?.length > 0 ? myOffers?.map((o, i) => {
                                let status
                                if (o.declined) {
                                    status = 'declined'
                                } else if (o.cancelled) {
                                    status = 'cancelled'
                                } else if (o.accepted) {
                                    status = 'accepted'
                                }
                                else {
                                    status = 'unanswered'
                                }
                                return <Grid item key={o.id.toString()}>
                                    <Grid container spacing={12} justifyContent="center">
                                        <Grid item xs={12} md={4} lg={3} xl={3} >
                                            <NFTItem nft={myOfferTokens[i]} onMint={loadProfileData} />
                                        </Grid>
                                        <Grid item md={6} lg={4} xl={4} >
                                            <Stack sx={{ height: '80%' }} direction="column" justifyContent="space-between">
                                                <Grid container>
                                                    <Grid item md={6} lg={6}><Typography sx={{ fontWeight: 'bold' }}>Offer ID:</Typography></Grid>
                                                    <Grid item md={6} lg={6}><Typography>{o.id.toString()}</Typography></Grid>
                                                </Grid>
                                                <Grid container>
                                                    <Grid item md={6} lg={6}><Typography sx={{ fontWeight: 'bold' }}>Status:</Typography></Grid>
                                                    <Grid item md={6} lg={6}><Typography>{status}</Typography></Grid>
                                                </Grid>
                                                <Grid container>
                                                    <Grid item md={6} lg={6}><Typography sx={{ fontWeight: 'bold' }}>Price:</Typography></Grid>
                                                    <Grid item md={6} lg={6}><Typography>{_e(o.price.toString())} Tapps</Typography></Grid>
                                                </Grid>
                                                <Grid container>
                                                    <Grid item md={6} lg={6}><Typography sx={{ fontWeight: 'bold' }}>Token Id:</Typography></Grid>
                                                    <Grid item md={6} lg={6}><Typography>{o.tokenId.toString()}</Typography></Grid>
                                                </Grid>
                                                <Grid container>
                                                    <Grid item md={6} lg={6}>
                                                        {status === 'unanswered' && <LoadingButton loading={buttonLoading}
                                                            variant="contained" size="small" onClick={() => cancelMyOffer(o.id)}>
                                                            Cancel Offer
                                                        </LoadingButton>}
                                                    </Grid>

                                                </Grid>
                                            </Stack>
                                        </Grid>
                                    </Grid>

                                </Grid>
                            }) : <Grid item><Typography variant="subtitle1">You haven&apos;t created any offer yet</Typography></Grid>}
                        </Grid>
                    </TabPanel>}
                </Box>

            </Stack>
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