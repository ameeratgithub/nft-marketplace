const { ethers } = require('hardhat')
const { expect } = require('chai').use(require('chai-as-promised'))

const _w = (ether) => {
    return ethers.utils.parseEther(ether.toString())
}
const _e = (wei) => {
    return ethers.utils.formatEther(wei)
}

describe("Marketplace", () => {
    let marketplace, signer, signer2, signer3, tapp, monuments, user, auctions, offers
    let tokens

    async function deployMarketplace() {
        const Marketplace = await ethers.getContractFactory('Marketplace')
        marketplace = await Marketplace.deploy()
        await marketplace.deployed()
    }
    async function deployUser() {
        const User = await ethers.getContractFactory('User')
        user = await User.deploy()
        await user.deployed()
    }
    async function registerUsers() {
        await user.add(signer.address)
        await user.add(signer2.address)
        await user.add(signer3.address)
    }

    async function deployAuctions() {
        const Auctions = await ethers.getContractFactory('Auctions')
        auctions = await Auctions.deploy()
        await auctions.deployed()
    }

    async function deployOffers() {
        const Offers = await ethers.getContractFactory('Offers')
        offers = await Offers.deploy()
        await offers.deployed()
    }
    async function deployTapp() {
        const Tapp = await ethers.getContractFactory('Tapp')
        tapp = await Tapp.deploy()
        await tapp.deployed()
    }
    async function assignTappAddresses() {
        await marketplace.setTappContract(tapp.address)
        await auctions.setTappContract(tapp.address)
    }
    async function setTappDependencies() {
        await tapp.setAuctionsAddress(auctions.address)
    }
    async function deployMonuments() {
        const Monuments = await ethers.getContractFactory('Monuments')
        monuments = await Monuments.deploy(tapp.address, user.address, marketplace.address, offers.address, auctions.address)
        await monuments.deployed()
    }
    async function mintTapps() {
        await tapp.mint(_w(4000))
        await tapp.connect(signer2).mint(_w(4000))
        await tapp.connect(signer3).mint(_w(4000))
    }
    async function mintNFTs() {
        await monuments.mint("uri")
        await monuments.mint("uri")
        await monuments.mint("uri")
    }
    async function getTokensList() {
        tokens = await monuments.getTokensList()
    }

    beforeEach(async () => {

        [signer, signer2, signer3] = await ethers.getSigners()

        await deployMarketplace()
        await deployUser()
        await registerUsers()
        await deployAuctions()
        await deployOffers()
        await deployTapp()
        await assignTappAddresses()
        await setTappDependencies()
        await deployMonuments()
        await mintTapps()
        await mintNFTs()
        await getTokensList()

    })

    describe.only("Success", () => {
        beforeEach(async () => {
            await marketplace.createMarketItem(_w(1), tokens[0].contractAddress, tokens[0].id)
            await getTokensList()
        })
        describe.only("Create Market Item", () => {
            it('should transfer nft successfull to the contract', async () => {
                expect(tokens[0].owner).to.eq(marketplace.address)
            })
            it('should set market id for nft', async () => {
                expect(tokens[0].marketItemId.toString()).to.eq("1")
            })
            it('should get remaining nfts', async () => {
                const _tokens =await monuments.tokensByIds([2,3])
                expect(_tokens.length).to.eq(2)
                expect(_tokens[0].id.toString()).to.eq("2")
                expect(_tokens[1].id.toString()).to.eq("3")
            })
        })
        xdescribe("Cancel Listing", () => {
            let auction
            beforeEach(async () => {
                await auctions.cancelAuction(1)
                auction = await auctions.auctions(1)
                await getTokensList()
            })
            it('should mark auction as cancelled', async () => {
                expect(auction.cancelled).to.be.true
            })
            it('transfer nft back successfully', async () => {
                expect(tokens[0].owner).to.eq(signer.address)
            })
            it('should reset auction id for nft', async () => {
                expect(tokens[0].auctionId.toString()).to.eq("0")
            })
        })
        xdescribe("Creating Sale", () => {
            let auction
            beforeEach(async () => {
                await auctions.connect(signer2).placeBid(1, _w(1))
                await auctions.connect(signer3).placeBid(1, _w(2))
                await auctions.connect(signer2).placeBid(1, _w(3))
                auction = await auctions.getAuction(1)
            })
            it('should transfer funds from user to auction contract', async () => {
                expect((await tapp.balanceOf(signer2.address)).toString()).to.eq(_w(3997))
                expect((await tapp.balanceOf(auctions.address)).toString()).to.eq(_w(5))
            })
            it('should get proper highest bid', async () => {
                expect(auction.highestBid.price.toString()).to.eq(_w(3))
            })
            it('should track total bids', async () => {
                expect(auction.bids.length).to.eq(3)
            })
        })
    })
    describe("Failure", () => {
        describe("Create Market Item", () => {
            it('should not create item with price less than 1 tapp', async () => {
                await expect(marketplace.createMarketItem(_w(0.9), tokens[0].contractAddress, tokens[0].id))
                    .to.be.rejectedWith("Marketplace: Price must be at least 1 tapp")
            })
            it('should not create item with tokenId less than 1', async () => {
                await expect(marketplace.createMarketItem(_w(1), tokens[0].contractAddress, 0))
                    .to.be.rejectedWith("Marketplace: Invalid token Id")
            })
            it('should not accept zero address for nft contract', async () => {
                await expect(marketplace.createMarketItem(_w(1), ethers.constants.AddressZero, tokens[0].id))
                    .to.be.rejectedWith("Marketplace: Invalid contract")
            })
            it('should not accept if sender is not nft owner', async () => {
                await expect(marketplace.connect(signer2).createMarketItem(_w(1), tokens[0].contractAddress, tokens[0].id))
                    .to.be.rejectedWith("Marketplace: You don't own this nft")
            })

        })
        describe("Cancel Listing", () => {
            beforeEach(async () => {
                await marketplace.createMarketItem(_w(1), tokens[0].contractAddress, tokens[0].id)
            })
            it('should not cancel listing if id is invalid', async () => {
                await expect(marketplace.cancelListing(2))
                    .to.be.rejectedWith("Marketplace: Item doesn't exist")
            })
            it('should not cancel if already cancelled', async () => {
                await marketplace.cancelListing(1)
                await expect(marketplace.cancelListing(1))
                    .to.be.rejectedWith("Marketplace: Already cancelled")
            })
            it('should not cancel if sender is not owner', async () => {
                await expect(marketplace.connect(signer2).cancelListing(1))
                    .to.be.rejectedWith("Marketplace: You can't cancel market item")
            })
        })
        describe("Creating Sale", () => {
            beforeEach(async () => {
                await marketplace.createMarketItem(_w(1), tokens[0].contractAddress, tokens[0].id)
            })
            it('should not create sale if id is invalid', async () => {
                await expect(marketplace.createSale(2))
                    .to.be.rejectedWith("Marketplace: Item doesn't exist")
            })
            it('should not create sale if listing is cancelled', async () => {
                await marketplace.cancelListing(1)
                await expect(marketplace.createSale(1))
                    .to.be.rejectedWith("Marketplace: Sale for this tem has been cancelled")
            })
        })
    })

})
