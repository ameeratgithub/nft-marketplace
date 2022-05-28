
import { Button, Chip, Divider, Grid, IconButton, LinearProgress, Modal, Paper, Stack, TextField, Typography } from "@mui/material"
import { styled } from "@mui/system"
import Link from "next/link"
import { LoadingButton } from "@mui/lab"


import { useEffect, useState } from "react"
import { lazyMint } from "../apis/collection"
import { getMarketplaceItem, cancelListing, createSale } from "../apis/marketplace"
import { approve } from "../apis/tapp"
import { getUserProfile } from "../apis/user"
import { _e, _w } from "../utils/ethers"
import { loadMetadata } from "../utils/ipfs"
import { useDappProvider } from "../utils/providers"
import { useWeb3 } from "../utils/web3-context"
import Alert from "./common/Alert"
import CreateSaleForm from "./common/CreateSaleForm"
import { cancelAuction, getAuction, placeBid } from "../apis/auctions"
import { InfoOutlined } from "@mui/icons-material"
import { MintingPaper } from "./collections/CreateCollectionForm"
import { ethers } from "ethers"
import BiddingForm from "./auctions.js/BiddingForm"



const NFTImage = styled('img')({
    width: '235px',
    height: '300px',
    zIndex: '1',
    objectFit: 'cover',
    borderRadius: '10px',
    boxShadow: '0px 3px 5px -1px rgb(0 0 0 / 20%), 0px 5px 8px 0px rgb(0 0 0 / 14%), 0px 1px 14px 0px rgb(0 0 0 / 12%)'

})
export const ProfileImage = styled('img')({
    width: '40px',
    height: '40px',
    objectFit: 'cover',
    borderRadius: '100%',

})


export const AttributeBar = ({ value, title }) => {
    return <Stack spacing={1} sx={{ mt: '10px' }}>
        <Typography variant="subtitle2">{title}</Typography>
        <Grid container direction="row" justifyContent="space-between" alignItems="center">
            <LinearProgress value={value * 10} variant="determinate" sx={{ width: '70%' }} />
            <Chip label={value} size="small" sx={{ position: 'absolute', right: '5%' }} />
        </Grid>
    </Stack>
}
export default ({ nft, collectionAddress, onMint }) => {
    const fallBackImage = process.env.NEXT_PUBLIC_IMAGE_404
    const [nftMeta, setNftMeta] = useState({})
    const [profile, setProfile] = useState({})
    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false)
    const { signer, address, provider } = useWeb3()
    const [alert, setAlert] = useState({})
    const { tapp: { balance } } = useDappProvider()

    const [marketItem, setMarketItem] = useState({})
    const [auctionItem, setAuctionItem] = useState({})

    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false)
    const [isAuctionDetailsModalOpen, setIsAuctionDetailsModalOpen] = useState(false)
    const [isBiddingModalOpen, setIsBiddingModalOpen] = useState(false)

    const [isButtonLoading, setIsButtonLoading] = useState(false)

    useEffect(() => {
        fetchNftMetaData()
        if (address && nft.owner) {
            fetchUserProfile()
            fetchSellingData()
        }

    }, [address])
    const fetchSellingData = async () => {
        if (nft.marketItemId.toString() !== "0") {
            const item = await getMarketplaceItem(nft.marketItemId.toString(), signer)
            setMarketItem(item)
        }
        if (nft.auctionId.toString() !== "0") {
            const item = await getAuction(nft.auctionId.toString(), signer)
            setAuctionItem(item)
        }
    }
    const fetchUserProfile = async () => {
        const p = await getUserProfile(nft.owner, signer)
        setProfile(p)
    }
    const fetchNftMetaData = async () => {
        try {
            const metaData = await loadMetadata(nft.uri)
            setNftMeta(metaData)
        } catch (err) {
            showAlert('Metadata of some NFTs is being pinned. It will be available in a while')
        }
    }
    const showAlert = (message, type) => {
        setIsSnackbarOpen(true)
        setAlert({ message, type })
    }
    const handleClose = () => {
        setIsSnackbarOpen(false)
    }
    const approveTapps = async () => {
        await approve(nft.contractAddress, nft.price, signer)
    }
    const mintLazy = async () => {
        if (balance < _e(nft.price)) {
            return showAlert(`You need ${_e(nft.price) - balance} more tapps to mint NFT`, 'warning')
        }
        if (!nft.contractAddress) return
        try {
            await approveTapps()
            const tx = await lazyMint(nft.id, nft.uri, nft.contractAddress, signer)
            await tx.wait(1)
            showAlert(`NFT minted successfully`, 'info')
        } catch (err) {
            console.error(err)
            showAlert(`Error occured while minting NFT`, 'error')
        }
        onMint()
    }
    const onImageError = ({ currentTarget }) => {
        currentTarget.onerror = null
        currentTarget.src = fallBackImage
    }
    const cancelMarketListing = async () => {
        setIsButtonLoading(true)
        if (!marketItem.id) return
        try {
            const tx = await cancelListing(marketItem.id.toString(), signer)
            await tx.wait(1)
            showAlert(`NFT Listing cancelled`, 'info')
            onMint()
        } catch (err) {
            console.log(err)
            showAlert(`Error occured while cancelling nft listing`, 'error')
        }
        setIsButtonLoading(false)
    }
    const cancelAuctionItem = async () => {
        setIsButtonLoading(true)
        if (!auctionItem.id) return
        try {
            const tx = await cancelAuction(auctionItem.id.toString(), signer)
            await tx.wait(1)
            showAlert(`NFT Auction cancelled`, 'info')
            setIsButtonLoading(false)
            onMint()
        } catch (err) {
            console.log(err)
            showAlert(`Error occured while cancelling nft Auction`, 'error')
            setIsButtonLoading(false)
        }

    }
    const buyNFT = async () => {
        if (!marketItem.id) return
        if (Number(balance) < Number(_e(marketItem.price)))
            return showAlert(`You need ${Number(_e(marketItem.price)) - Number(balance)} more tapps`, 'warning')

        setIsButtonLoading(true)
        try {
            await createSale(marketItem.id.toString(), signer)
            showAlert(`NFT purchased successfully`, 'info')
            onMint()
        } catch (err) {
            console.log(err)
            showAlert(`Error occured while buying nft`, 'error')
        }
        setIsButtonLoading(false)
    }
    const handleOnSuccess = async () => {
        setIsSaleModalOpen(false)
        await fetchSellingData()
        onMint()
    }
    const AuctionDetails = () => {
        const [sellerProfile, setSellerProfile] = useState({})
        const [endTime, setEndTime] = useState(0)

        const [bidders, setBidders] = useState([])

        useEffect(() => {
            intialize()
        }, [])

        const intialize = async () => {
            const currentBlock = await provider.getBlockNumber()
            const endBlock = Number(auctionItem.endBlock.toString())
            if (currentBlock >= endBlock) {
                setEndTime(0)
            } else {
                const minutes = ((endBlock - currentBlock) * 5) / 60
                setEndTime(parseInt(minutes))
            }
            const profile = await getUserProfile(auctionItem.seller, signer)
            setSellerProfile(profile)

            const profilePromises = auctionItem.bids.map(b => getUserProfile(b.bidder, signer))
            const profiles = await Promise.all(profilePromises)

            console.log("Loaded profiles", profiles);
            setBidders(profiles)
        }

        return <MintingPaper>
            <Grid container direction="row" justifyContent="space-between">
                <Grid item>
                    <Typography variant="h6">
                        Seller
                    </Typography>
                </Grid>
                <Grid item>
                    <NFTUserProfile onImageError={onImageError} profile={sellerProfile} />
                </Grid>
            </Grid>
            <Grid container direction="row" justifyContent="space-between" sx={{ mt: '20px', mb: '20px' }}>
                <Grid item>
                    <Typography variant="subtitle1">
                        Ends In
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography variant="body1">
                        {endTime > 0 ? `${endTime} minutes` : 'Expired'}
                    </Typography>
                    <Button>
                        End Auction
                    </Button>
                </Grid>
            </Grid>
            <Grid container direction="row" justifyContent="space-between" sx={{ mt: '20px', mb: '20px' }}>
                <Grid item>
                    <Typography variant="subtitle1">
                        Starting Price
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography variant="body1">
                        {_e(auctionItem.startingPrice)} Tapps
                    </Typography>
                </Grid>
            </Grid>
            <Divider sx={{ mb: '20px' }} />
            {
                auctionItem.bids.length > 0 ? auctionItem.bids.map((b, i) => {
                    return <Grid container direction="row" alignItems="center" justifyContent="space-between" key={b.id}>
                        <Grid item>
                            {bidders[i] && <NFTUserProfile onImageError={onImageError} profile={bidders[i]} />}
                        </Grid>
                        <Grid item>
                            <Typography variant="body1">
                                {_e(b.price)} Tapps
                            </Typography>
                            {
                                b.bidder === address && (auctionItem.ended || auctionItem.cancelled) &&
                                <Button size="small">
                                    Withdraw
                                </Button>
                            }
                        </Grid>

                    </Grid>
                }) : <Typography>No Bid Found</Typography>
            }
        </MintingPaper>
    }

    const fetchItemAction = () => {
        if (profile?.id) {
            if (nft.marketItemId.toString() !== "0") {
                if (marketItem.seller == address) {
                    return <LoadingButton loading={isButtonLoading} variant="contained" onClick={cancelMarketListing} size="small" sx={{ width: '100%' }}>
                        Cancel Sell
                    </LoadingButton>
                }
                else {
                    return <LoadingButton loading={isButtonLoading} onClick={buyNFT} variant="contained" size="small" sx={{ width: '100%' }}>
                        Buy
                    </LoadingButton>
                }
            } else if (nft.auctionId.toString() !== "0") {

                if (auctionItem.seller == address) {
                    return <>
                        <LoadingButton loading={isButtonLoading} onClick={cancelAuctionItem} variant="contained" size="small" sx={{ width: '100%' }}>
                            Cancel Auction
                        </LoadingButton>
                        <IconButton size="small" onClick={() => setIsAuctionDetailsModalOpen(true)}>
                            <InfoOutlined fontSize="small" />
                        </IconButton>
                    </>
                }
                else {
                    return <>
                        <LoadingButton loading={isButtonLoading} onClick={() => setIsBiddingModalOpen(true)} variant="contained" size="small" sx={{ width: '100%' }}>
                            Place Bid
                        </LoadingButton>
                        <IconButton size="small" onClick={() => setIsAuctionDetailsModalOpen(true)}>
                            <InfoOutlined fontSize="small" />
                        </IconButton>
                    </>
                }
            } else {
                if (nft.owner == address) {
                    return <>
                        <Button variant="contained" onClick={() => setIsSaleModalOpen(true)} size="small" sx={{ width: '100%' }}>
                            Sell
                        </Button>
                        {nft.offers.length > 0 && <IconButton size="small">
                            <InfoOutlined fontSize="small" />
                        </IconButton>}
                    </>
                }
                else {
                    return <Button variant="contained" size="small" sx={{ width: '100%' }}>
                        Create Offer
                    </Button>
                }
            }
        } else if (!nft.minted && !nft.owner) {
            return <Button variant="contained" size="small" onClick={mintLazy} sx={{ width: '100%' }}>
                Mint
            </Button>
        }

    }


    return <>
        <Modal open={isSaleModalOpen} onClose={() => setIsSaleModalOpen(false)}>
            <div>
                <CreateSaleForm nft={nft} onSuccess={handleOnSuccess} />
            </div>
        </Modal>
        <Modal open={isAuctionDetailsModalOpen} onClose={() => setIsAuctionDetailsModalOpen(false)}>
            <div>
                <AuctionDetails />
            </div>
        </Modal>
        <Modal open={isBiddingModalOpen} onClose={() => setIsBiddingModalOpen(false)}>
            <div>
                <BiddingForm auctionItem={auctionItem} onSuccess={onMint} />
            </div>
        </Modal>
        <Stack sx={{ position: 'relative' }}>
            <Alert onClose={handleClose} isOpen={isSnackbarOpen} message={alert.message} type={alert.type} />

            <NFTImage src={nftMeta.image || fallBackImage} alt={nftMeta.name} sx={{ boxShadow: 4 }}
                onError={onImageError} />
            <Paper sx={{ padding: '15px', position: 'relative', left: "10px", top: '-10px' }} elevation={5}>
                <Stack sx={{ padding: '2px', pt: '15px' }}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle1" >{nftMeta?.name || 'Metadata Loading'}</Typography>
                        {nft.price && <Chip label={_e(nft.price)} size="small" />}
                        {marketItem.price && <Chip label={_e(marketItem.price)} size="small" />}
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between"
                        sx={{ mt: '10px' }}>
                        {/* {nft.owner && profile.id && <NFTUserProfile profile={profile} onImageError={onImageError} />} */}
                        {
                            fetchItemAction()
                        }
                    </Stack>

                </Stack>
            </Paper>
        </Stack></>

}

const NFTUserProfile = ({ profile, onImageError }) => {
    return <Link href={`/users/${profile.id}`} passHref>
        <a style={{ display: 'flex', color: 'inherit', textDecoration: 'none', alignItems: 'center' }}>
            <ProfileImage src={profile.picture} alt={profile.name || profile.userAddress}
                onError={onImageError} />
            <Typography variant="body2" style={{ marginLeft: '10px' }}>{profile.name || `User#${profile.id}`}</Typography>
        </a>
    </Link>
}