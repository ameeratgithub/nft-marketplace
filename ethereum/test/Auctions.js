const { ethers } = require('hardhat')
const { expect } = require('chai').use(require('chai-as-promised'))

const _w = (ether) => {
    return ethers.utils.parseEther(ether.toString())
}
const _e = (wei) => {
    return ethers.utils.formatEther(wei)
}

describe("Auctions", () => {
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

    describe("Success", () => {
        beforeEach(async () => {
            await auctions.startAuction(tokens[0].id, tokens[0].contractAddress, 1, 3)
            await getTokensList()
        })
        describe("Start Auction", () => {
            it('should transfer nft successfull to the contract', async () => {
                expect(tokens[0].owner).to.eq(auctions.address)
            })
            it('should set auction id for nft', async () => {
                expect(tokens[0].auctionId.toString()).to.eq("1")
            })
        })
        describe("Cancel Auction", () => {
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
        describe("Placing Bids", () => {
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
        describe("End Auction", () => {
            let auction
            beforeEach(async () => {
                await auctions.connect(signer2).placeBid(1, _w(1))
                await auctions.connect(signer3).placeBid(1, _w(2))
                await auctions.connect(signer2).placeBid(1, _w(3))
                await auctions.endAuction(1)
                await getTokensList()
                auction = await auctions.getAuction(1)
            })
            it('should track if auction has been ended', async () => {
                expect(auction.ended).to.be.true
            })
            it('should transfer balances successfully', async () => {
                const sellerBalance = await tapp.balanceOf(auction.seller)
                const buyerBalance = await tapp.balanceOf(signer2.address)
                const contractBalance = await tapp.balanceOf(auctions.address)
                expect(sellerBalance.toString()).to.eq(_w(4003))
                expect(buyerBalance.toString()).to.eq(_w(3997))
                expect(contractBalance.toString()).to.eq(_w(2))
            })
            it('should transfer nft successfully', async () => {
                expect(tokens[0].owner).to.eq(signer2.address)
            })
            it('should reset auction id of nft', async () => {
                expect(tokens[0].auctionId.toString()).to.eq("0")
            })
        })
        describe("Withdraw", () => {
            let auction
            beforeEach(async () => {
                await auctions.connect(signer2).placeBid(1, _w(1))
                await auctions.connect(signer3).placeBid(1, _w(2))
                await auctions.connect(signer2).placeBid(1, _w(3))
                await auctions.endAuction(1)
                await getTokensList()
                auction = await auctions.getAuction(1)
            })
            it('should be able to withdraw amount', async () => {
                await auctions.connect(signer3).withdraw(1)
                expect((await tapp.balanceOf(signer3.address))).to.eq(_w(4000))
            })
        })
    })
    describe("Failure", () => {
        describe("Start Auction", () => {
            it('should not start auction with zero price', async () => {
                await expect(auctions.startAuction(tokens[0].id, tokens[0].contractAddress, 0, 1))
                    .to.be.rejectedWith("Auctions: Provide some starting price")
            })
            it('should not start auction with less than 1 block', async () => {
                await expect(auctions.startAuction(tokens[0].id, tokens[0].contractAddress, 1, 0))
                    .to.be.rejectedWith("Auctions: Provide valid block number")
            })
            it('should not accept zero contract address', async () => {
                await expect(auctions.startAuction(tokens[0].id, ethers.constants.AddressZero, 1, 1))
                    .to.be.rejectedWith("Auctions: invalid collection address")
            })
            it('should reject if person is not the owner of nft', async () => {
                await expect(auctions.connect(signer2).startAuction(tokens[0].id, tokens[0].contractAddress, 1, 1))
                    .to.be.rejectedWith("Auctions: You can't start auction")
            })
            it('should not start auction if already started', async () => {
                await auctions.startAuction(tokens[0].id, tokens[0].contractAddress, 1, 1)
                await expect(auctions.startAuction(tokens[0].id, tokens[0].contractAddress, 1, 1))
                    .to.be.rejectedWith("Auctions: Auction already started")
            })
        })
        describe("Cancel Auction", () => {
            beforeEach(async () => {
                await auctions.startAuction(tokens[0].id, tokens[0].contractAddress, 1, 3)
            })
            it('should not cancel auction if seller is not owner', async () => {
                await expect(auctions.connect(signer2).cancelAuction(1))
                    .to.be.rejectedWith("Auctions: You can't cancel Auction")
            })
            it('should not cancel auction if already cancelled', async () => {
                await auctions.cancelAuction(1)
                await expect(auctions.cancelAuction(1))
                    .to.be.rejectedWith("Auctions: Auction already ended or cancelled")
            })
            it('should not cancel auction if late', async () => {
                await ethers.provider.send('evm_mine')
                await ethers.provider.send('evm_mine')
                await expect(auctions.cancelAuction(1))
                    .to.be.rejectedWith("Auctions: You can't cancel auction now")
            })
        })
        describe("Placing Bid", () => {
            beforeEach(async () => {
                await auctions.startAuction(tokens[0].id, tokens[0].contractAddress, 1, 2)
            })
            it('should not place bid if seller is owner', async () => {
                await expect(auctions.placeBid(1, 1))
                    .to.be.rejectedWith("Auctions: You can't bid on your Auction")
            })
            it('should not place bid if auction cancelled', async () => {
                await auctions.cancelAuction(1)
                await expect(auctions.connect(signer2).placeBid(1, 1))
                    .to.be.rejectedWith("Auctions: Auction is not active for bids")
            })
            it('should not place bid if price is less than starting price', async () => {
                await expect(auctions.connect(signer2).placeBid(1, 0))
                    .to.be.rejectedWith("Auctions: Price must be greator than starting price")
            })
            it('should not place bid if price is less than previous highest bid', async () => {
                auctions.connect(signer2).placeBid(1, 5)
                auctions.connect(signer2).placeBid(1, 10)
                await expect(auctions.connect(signer2).placeBid(1, 9))
                    .to.be.rejectedWith("Auctions: Price must be more than previous bid")
            })
        })
        describe("Withdraw", () => {
            beforeEach(async () => {
                await auctions.startAuction(tokens[0].id, tokens[0].contractAddress, 1, 2)
            })
            it('should not be able to withdraw if auction is active', async () => {
                await expect(auctions.withdraw(1))
                    .to.be.rejectedWith("Auctions: You can't withdraw from active auction")
            })
            it('should not be able to withdraw if has no ammount', async () => {
                await auctions.cancelAuction(1)
                await expect(auctions.withdraw(1))
                    .to.be.rejectedWith("Auctions: You don't have anything to withdraw")
            })
            it('should not be able to withdraw for highest bidder', async () => {
                await auctions.connect(signer2).placeBid(1, _w(1))
                await auctions.connect(signer3).placeBid(1, _w(2))
                await auctions.connect(signer2).placeBid(1, _w(3))
                await auctions.endAuction(1)

                await expect(auctions.connect(signer2).withdraw(1))
                    .to.be.rejectedWith("Auctions: You don't have anything to withdraw")
            })
        })
        describe("End Auction", () => {
            beforeEach(async () => {
                await auctions.startAuction(tokens[0].id, tokens[0].contractAddress, 1, 2)
            })
            it('should not be able to end before endTime', async () => {
                await expect(auctions.endAuction(1))
                    .to.be.rejectedWith("Auctions: You can't end auction now")
            })
            it('should not end if seller or participant doesn\'t end', async () => {
                await ethers.provider.send('evm_mine')
                await expect(auctions.connect(signer2).endAuction(1))
                    .to.be.rejectedWith("Auctions: Only bidders or seller can end auction")
            })
            it('should not be able to end if not active', async () => {
                await auctions.cancelAuction(1)
                await expect(auctions.endAuction(1))
                    .to.be.rejectedWith("Auctions: Auction already ended or cancelled")
            })
        })
    })

})
