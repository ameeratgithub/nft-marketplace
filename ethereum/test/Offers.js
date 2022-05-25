const { ethers } = require('hardhat')
const { expect } = require('chai').use(require('chai-as-promised'))

const _w = (ether) => {
    return ethers.utils.parseEther(ether.toString())
}
const _e = (wei) => {
    return ethers.utils.formatEther(wei)
}

describe("Offers", () => {
    let marketplace, signer, signer2, signer3, tapp, monuments, user, offers
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

    async function deployOffers() {
        const Offers = await ethers.getContractFactory('Offers')
        offers = await Offers.deploy()
        await offers.deployed()
    }

    async function deployTapp() {
        const Tapp = await ethers.getContractFactory('Tapp')
        tapp = await Tapp.deploy(marketplace.address, offers.address)
        await tapp.deployed()
    }
    async function initializeTappContracts() {
        await marketplace.setTappContract(tapp.address)
        await offers.setTappContract(tapp.address)
    }
    async function deployMonuments() {
        const Monuments = await ethers.getContractFactory('Monuments')
        monuments = await Monuments.deploy(tapp.address, user.address, marketplace.address, offers.address)
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
        await deployOffers()
        await deployTapp()
        await initializeTappContracts()
        await deployMonuments()
        await mintTapps()
        await mintNFTs()
        await getTokensList()

    })

    describe("Success", () => {
        it('should create offers', async () => {
            await offers.connect(signer2).createOffer(tokens[0].id, tokens[0].contractAddress, _w(50))
            await offers.connect(signer2).createOffer(tokens[0].id, tokens[0].contractAddress, _w(100))

            await getTokensList()

            expect(tokens[0].offers.length).to.eq(2)

            expect(tokens[0].offers[0].toString()).to.eq("1")
            expect(tokens[0].offers[1].toString()).to.eq("2")

            const offerID1 = tokens[0].offers[0].toString()
            const offerID2 = tokens[0].offers[1].toString()

            const _offers = await offers.getOffersByIds([offerID1, offerID2])

            expect(_offers[0].offeror).to.eq(signer2.address)
            expect(_offers[1].offeror).to.eq(signer2.address)

            expect(_offers[0].price.toString()).to.eq(_w(50))
            expect(_offers[1].price.toString()).to.eq(_w(100))
        })
        it('should cancel offers', async () => {
            await offers.connect(signer2).createOffer(tokens[0].id, tokens[0].contractAddress, _w(50))
            await offers.connect(signer2).createOffer(tokens[0].id, tokens[0].contractAddress, _w(100))
            await offers.connect(signer2).createOffer(tokens[0].id, tokens[0].contractAddress, _w(150))

            await getTokensList()

            const offerId1 = tokens[0].offers[0].toString()
            const offerId2 = tokens[0].offers[1].toString()
            const offerId3 = tokens[0].offers[2].toString()

            await offers.connect(signer2).cancelOffer(offerId3)
            await offers.connect(signer2).cancelOffer(offerId1)
            await offers.connect(signer2).cancelOffer(offerId2)


            const _offers = await offers.getOffersByIds([offerId1, offerId2, offerId3])

            expect(_offers[0].cancelled).to.be.true
            expect(_offers[1].cancelled).to.be.true
            expect(_offers[2].cancelled).to.be.true

            await getTokensList()

            expect(tokens[0].offers.length).to.eq(0)
        })
        it('should decline offers', async () => {
            await offers.connect(signer2).createOffer(tokens[0].id, tokens[0].contractAddress, _w(50))
            await offers.connect(signer2).createOffer(tokens[0].id, tokens[0].contractAddress, _w(100))
            await offers.connect(signer2).createOffer(tokens[0].id, tokens[0].contractAddress, _w(150))

            await getTokensList()

            const offerId1 = tokens[0].offers[0].toString()
            const offerId2 = tokens[0].offers[1].toString()
            const offerId3 = tokens[0].offers[2].toString()

            await offers.declineOffer(offerId3)
            await offers.declineOffer(offerId1)
            await offers.declineOffer(offerId2)


            const _offers = await offers.getOffersByIds([offerId1, offerId2, offerId3])

            expect(_offers[0].declined).to.be.true
            expect(_offers[1].declined).to.be.true
            expect(_offers[2].declined).to.be.true

            await getTokensList()

            expect(tokens[0].offers.length).to.eq(0)
        })
        it('should accept offer', async () => {
            await offers.connect(signer2).createOffer(tokens[0].id, tokens[0].contractAddress, _w(50))
            await offers.connect(signer2).createOffer(tokens[0].id, tokens[0].contractAddress, _w(100))
            await offers.connect(signer2).createOffer(tokens[0].id, tokens[0].contractAddress, _w(150))

            await getTokensList()

            const offerId3 = tokens[0].offers[2].toString()

            await offers.acceptOffer(offerId3)

            await getTokensList()

            expect(tokens[0].owner).to.eq(signer2.address)

            const balance1 = await tapp.balanceOf(signer.address)
            const balance2 = await tapp.balanceOf(signer2.address)

            expect(_e(balance1)).to.eq('4150.0')
            expect(_e(balance2)).to.eq('3850.0')
        })
    })
    describe("failure", () => {
        it('should not create an offer by nft owner', async () => {
            await expect(offers.createOffer(tokens[0].id, tokens[0].contractAddress, _w(50)))
                .to.be.rejectedWith("ERC721e: You can't create offers for yourself")
        })
        it('should not create an offer for price < 1 tapp', async () => {
            await expect(offers.connect(signer2).createOffer(tokens[0].id, tokens[0].contractAddress, _w(0.9)))
                .to.be.rejectedWith("Offers: Offer must be at least 1 tapp")
        })
        it('should not accept zero contract address', async () => {
            await expect(offers.connect(signer2).createOffer(tokens[0].id, ethers.constants.AddressZero, _w(1)))
                .to.be.rejectedWith("Offers: Invalid collection address")
        })
        it('should reject invalid token', async () => {
            await expect(offers.connect(signer2).createOffer(4, tokens[0].contractAddress, _w(1)))
                .to.be.rejectedWith("ERC721::ownerOf:Token doesn't exist")
        })
        it('should reject if other person than offeror cancels offer', async () => {
            await offers.connect(signer2).createOffer(tokens[0].id, tokens[0].contractAddress, _w(1))
            await expect(offers.cancelOffer(1))
                .to.be.rejectedWith("Offers: You can't cancel offer")
        })
        it('should reject if other person than token owner declines offer', async () => {
            await offers.connect(signer2).createOffer(tokens[0].id, tokens[0].contractAddress, _w(1))
            await expect(offers.connect(signer2).declineOffer(1))
                .to.be.rejectedWith("Offers: You can't decline offer")
        })
    })

})
