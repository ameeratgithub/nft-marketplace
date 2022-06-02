
import { Button, Chip, Divider, Grid, IconButton, LinearProgress, Modal, Paper, Stack, TextField, Typography } from "@mui/material"
import { Box, styled } from "@mui/system"
import Link from "next/link"
import { LoadingButton } from "@mui/lab"


import { useEffect, useState } from "react"
import { approveAllContracts, approvedAllContracts, lazyMint } from "../apis/collection"
import { getMarketplaceItem, cancelListing, createSale } from "../apis/marketplace"
import { approve } from "../apis/tapp"
import { getUserProfile } from "../apis/user"
import { _e, _w } from "../utils/ethers"
import { loadMetadata } from "../utils/ipfs"
import { useDappProvider } from "../utils/providers"
import { useWeb3 } from "../utils/web3-context"
import Alert from "./common/Alert"
import CreateSaleForm from "./common/CreateSaleForm"
import { cancelAuction, getAuction, placeBid, hasParticipated } from "../apis/auctions"
import { InfoOutlined } from "@mui/icons-material"
import { MintingPaper } from "./collections/CreateCollectionForm"
import { ethers } from "ethers"
import BiddingForm from "./auctions.js/BiddingForm"
import AuctionDetails from "./auctions.js/AuctionDetails"
import CreateOfferForm from "./offers/CreateOfferForm"
import OfferDetails from "./offers/OfferDetails"



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
export default function NFTItem({ nft, collectionAddress, onMint }) {
    const fallBackImage = process.env.NEXT_PUBLIC_IMAGE_404
    const [nftMeta, setNftMeta] = useState({})
    const [profile, setProfile] = useState({})
    const [sellerProfile, setSellerProfile] = useState({})
    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false)
    const { signer, address, provider } = useWeb3()
    const [alert, setAlert] = useState({})
    const { tapp: { balance } } = useDappProvider()

    const [marketItem, setMarketItem] = useState({})
    const [auctionItem, setAuctionItem] = useState({})

    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false)
    const [isAuctionDetailsModalOpen, setIsAuctionDetailsModalOpen] = useState(false)
    const [isBiddingModalOpen, setIsBiddingModalOpen] = useState(false)
    const [isApproveContractModalOpen, setIsApproveContractModalOpen] = useState(false)
    const [isCreateOfferModalOpen, setIsCreateOfferModalOpen] = useState(false)
    const [isOffersDetailModalOpen, setIsOffersDetailModalOpen] = useState(false)

    const [isButtonLoading, setIsButtonLoading] = useState(false)
    const [isAuctionExpired, setIsAuctionExpired] = useState(false)

    const [approvedByContract, setApprovedByContract] = useState(false)

    useEffect(() => {
        fetchNftMetaData()
        if (address && nft.owner) {
            fetchUserProfile()
            fetchSellingData()
        }

    }, [address, nft.auctionId, nft.marketItemId, nft.offers])
    useEffect(() => {
        isApprovedByContract()
    }, [approvedByContract])

    const isApprovedByContract = async () => {
        const approved = await approvedAllContracts(address, nft.contractAddress, signer)
        console.log('Approved', approved)
        setApprovedByContract(approved)
    }
    const fetchSellingData = async () => {
        if (nft.marketItemId.toString() !== "0") {
            const item = await getMarketplaceItem(nft.marketItemId.toString(), signer)
            const p = await getUserProfile(item.seller, signer)
            setSellerProfile(p)
            setMarketItem(item)
        }
        if (nft.auctionId.toString() !== "0") {
            const item = await getAuction(nft.auctionId.toString(), signer)
            const p = await getUserProfile(item.seller, signer)

            const currentBlock = await provider.getBlockNumber()
            const endBlock = Number(item.endBlock.toString())

            setSellerProfile(p)
            setIsAuctionExpired(currentBlock >= endBlock)
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
        const tx = await approve(nft.contractAddress, nft.price, signer)
        await tx.wait(1)
    }
    const mintLazy = async () => {
        if (balance < _e(nft.price)) {
            return showAlert(`You need ${_e(nft.price) - balance} more tapps to mint NFT`, 'warning')
        }
        setIsButtonLoading(true)
        console.log(nft.contractAddress)
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
        setIsButtonLoading(false)
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

    const handleSell = () => {
        if (!approvedByContract)
            setIsApproveContractModalOpen(true)
        else
            setIsSaleModalOpen(true)
    }
    const handleOnSuccess = async () => {
        setIsSaleModalOpen(false)
        setIsBiddingModalOpen(false)
        setIsAuctionDetailsModalOpen(false)
        await fetchSellingData()
        await onMint()
    }
    const approveContracts = async () => {
        setIsButtonLoading(true)
        try {
            const tx = await approveAllContracts(nft.contractAddress, signer)
            await tx.wait(1)
            setApprovedByContract(true)
            showAlert(`Approval completed. You can proceed now`)
            setIsButtonLoading(false)
            onMint()
        } catch (err) {
            console.log(err)
            setIsButtonLoading(false)
            showAlert(`Error while getting approved`, 'error')
        }
        setIsApproveContractModalOpen(false)
    }
    const ApproveContract = () => {
        return <MintingPaper>
            <Typography variant="h6">Get Approved</Typography>
            <Typography sx={{ mb: '20px', mt: '15px' }}>You&apos;re not approved by contract. Please get approved first to proceed</Typography>
            <LoadingButton loading={isButtonLoading} onClick={approveContracts} variant="contained" size="small" sx={{ width: '100%' }}>
                Get Approved
            </LoadingButton>
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
                        <LoadingButton disabled={isAuctionExpired} loading={isButtonLoading} onClick={cancelAuctionItem} variant="contained" size="small" sx={{ width: '100%' }}>
                            Cancel Auction
                        </LoadingButton>
                        <IconButton size="small" onClick={() => setIsAuctionDetailsModalOpen(true)}>
                            <InfoOutlined fontSize="small" />
                        </IconButton>
                    </>
                }
                else {
                    return <>
                        <LoadingButton disabled={isAuctionExpired} loading={isButtonLoading} onClick={() => setIsBiddingModalOpen(true)} variant="contained" size="small" sx={{ width: '100%' }}>
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
                        <Button variant="contained" onClick={handleSell} size="small" sx={{ width: '100%' }}>
                            Sell
                        </Button>
                        {nft.offers.length > 0 && <IconButton size="small" onClick={() => setIsOffersDetailModalOpen(true)}>
                            <InfoOutlined fontSize="small" />
                        </IconButton>}
                    </>
                }
                else {
                    return <Button onClick={() => setIsCreateOfferModalOpen(true)} variant="contained" size="small" sx={{ width: '100%' }}>
                        Create Offer
                    </Button>
                }
            }
        } else if (!nft.minted && !nft.owner) {
            return <LoadingButton loading={isButtonLoading} variant="contained" size="small" onClick={mintLazy} sx={{ width: '100%' }}>
                Mint
            </LoadingButton>
        }

    }

    const ownerProfile = sellerProfile.id ? sellerProfile : profile;
    return <>
        <Modal open={isSaleModalOpen} onClose={() => setIsSaleModalOpen(false)}>
            <div>
                <CreateSaleForm nft={nft} onSuccess={handleOnSuccess} />
            </div>
        </Modal>
        <Modal open={isAuctionDetailsModalOpen} onClose={() => setIsAuctionDetailsModalOpen(false)}>
            <div>
                {auctionItem.id && <AuctionDetails auctionItem={auctionItem} onImageError={onImageError}
                    onSuccess={handleOnSuccess} />}
            </div>
        </Modal>
        <Modal open={isBiddingModalOpen} onClose={() => setIsBiddingModalOpen(false)}>
            <div>
                <BiddingForm auctionItem={auctionItem} onSuccess={handleOnSuccess} />
            </div>
        </Modal>
        <Modal open={isApproveContractModalOpen} onClose={() => setIsApproveContractModalOpen(false)}>
            <div>
                <ApproveContract />
            </div>
        </Modal>
        <Modal open={isCreateOfferModalOpen} onClose={() => setIsCreateOfferModalOpen(false)}>
            <div>
                <CreateOfferForm nft={nft} onSuccess={handleOnSuccess} />
            </div>
        </Modal>
        <Modal open={isOffersDetailModalOpen} onClose={() => setIsOffersDetailModalOpen(false)}>
            <div>
                {nft.offers?.length > 0 && <OfferDetails nft={nft} onImageError={onImageError}
                    onSuccess={() => {
                        setIsOffersDetailModalOpen(false)
                        handleOnSuccess()
                    }} />}
            </div>
        </Modal>
        <Stack sx={{ position: 'relative' }}>
            <Alert onClose={handleClose} isOpen={isSnackbarOpen} message={alert.message} type={alert.type} />

            <NFTImage src={nftMeta.image || fallBackImage} alt={nftMeta.name} sx={{ boxShadow: 4 }}
                onError={onImageError} />
            {nft.owner && ownerProfile.id && <Box sx={{ position: 'absolute', top: '250px', right: '0', zIndex: 1 }}>
                <NFTUserProfile
                    profile={ownerProfile} onImageError={onImageError} hideName={true} />
            </Box>}
            <Paper sx={{ padding: '15px', position: 'relative', left: "10px", top: '-10px' }} elevation={5}>
                <Stack sx={{ padding: '2px', pt: '15px' }}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle1" >{nftMeta?.name || 'Metadata Loading'}</Typography>
                        {nft.price && <Chip label={_e(nft.price)} size="small" />}
                        {marketItem.price && <Chip label={_e(marketItem.price)} size="small" />}
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between"
                        sx={{ mt: '10px' }}>

                        {
                            fetchItemAction()
                        }
                    </Stack>

                </Stack>
            </Paper>
        </Stack></>

}

export const NFTUserProfile = ({ profile, onImageError, hideName }) => {
    return <Link href={`/users/${profile.id}`} passHref>
        <a style={{ display: 'flex', color: 'inherit', textDecoration: 'none', alignItems: 'center' }}>
            <ProfileImage src={profile.picture} alt={profile.name || profile.userAddress}
                onError={onImageError} />
            {!hideName && <Typography variant="body2" style={{ marginLeft: '10px' }}>{profile.name || `User#${profile.id}`}</Typography>}
        </a>
    </Link>
}