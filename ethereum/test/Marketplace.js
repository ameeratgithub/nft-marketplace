const { ethers } = require('hardhat')
const { expect } = require('chai').use(require('chai-as-promised'))

const ERC721le = require('../artifacts/contracts/standards/ERC721le.sol/ERC721le.json')

const _e = (amount) => {
    return ethers.utils.parseEther(amount.toString())
}
const _w = (amount) => {
    return ethers.utils.formatEther(amount.toString())
}

describe("Marketplace", () => {
    let marketplace, signer, signer2, signer3, tapp, monuments, user

    beforeEach(async () => {

        [signer, signer2, signer3] = await ethers.getSigners()

        const Marketplace = await ethers.getContractFactory('Marketplace')
        marketplace = await Marketplace.deploy()
        await marketplace.deployed()

        const User = await ethers.getContractFactory('User')
        user = await User.deploy()
        await user.deployed()

        await user.add(signer.address)
        await user.add(signer2.address)
        await user.add(signer3.address)

        const Tapp = await ethers.getContractFactory('Tapp')
        tapp = await Tapp.deploy(marketplace.address)
        await tapp.deployed()

        const Monuments = await ethers.getContractFactory('Monuments')
        monuments = await Monuments.deploy(tapp.address, user.address, marketplace.address)
        await monuments.deployed()

        await marketplace.setTappContract(tapp.address)


        await tapp.mint(_e(4000))
        await tapp.connect(signer2).mint(_e(4000))
        await tapp.connect(signer3).mint(_e(4000))

        await monuments.mint("uri")
        await monuments.mint("uri")

        await marketplace.createMarketItem(_e(200), monuments.address, 2)
        await marketplace.createMarketItem(_e(100), monuments.address, 1)

    })

    describe("Success", () => {
        it('creates market items successfully', async () => {
            const item1 = await marketplace.items(1)
            const item2 = await marketplace.items(2)

            expect(item1.price.toString()).to.eq(_e(200))
            expect(item2.price.toString()).to.eq(_e(100))

            const nfts = await monuments.tokensByIds([item1.tokenId, item2.tokenId])

            expect(nfts[0].onSale).to.be.true
            expect(nfts[1].onSale).to.be.true

            expect(nfts[0].owner).to.eq(marketplace.address)
            expect(nfts[1].owner).to.eq(marketplace.address)

            expect(nfts[0].marketItemId.toString()).to.eq("1")
            expect(nfts[1].marketItemId.toString()).to.eq("2")
        })
        it('creates sale successfully', async () => {
            const item1 = await marketplace.items(1)
            const item2 = await marketplace.items(2)

            await marketplace.connect(signer2).createSale(item1.id, monuments.address)
            await marketplace.connect(signer2).createSale(item2.id, monuments.address)

            const nfts = await monuments.tokensByIds([item1.tokenId, item2.tokenId])

            expect(nfts[0].onSale).to.be.false
            expect(nfts[1].onSale).to.be.false

            expect(nfts[0].owner).to.eq(signer2.address)
            expect(nfts[1].owner).to.eq(signer2.address)

            expect(await monuments.ownerOf(nfts[0].id)).to.eq(signer2.address)
            expect(await monuments.ownerOf(nfts[1].id)).to.eq(signer2.address)

            const userId = await user.users(signer2.address)

            const collections = await user.getAllTokens(userId.toString())

            expect(collections[0].tokens[0].toString()).to.eq(nfts[0].id)
            expect(collections[0].tokens[1].toString()).to.eq(nfts[1].id)

            const buyerBalance = await tapp.balanceOf(signer2.address)
            const sellerBalance = await tapp.balanceOf(signer.address)

            expect(Number(_w(sellerBalance))).to.be.eq(4300)
            expect(Number(_w(buyerBalance))).to.be.eq(3700)
        })
        it('gets items on sale', async () => {
            let items = await marketplace.getItemsOnSale();

            expect(items[0].tokenId.toString()).to.eq("2")
            expect(items[1].tokenId.toString()).to.eq("1")
            
            expect(items[0].sold).to.be.false
            expect(items[1].sold).to.be.false

        })
        it('should not get sold items', async () => {
            let items = await marketplace.getItemsOnSale();
            
            await marketplace.connect(signer2).createSale(items[0].id, monuments.address)

            items = await marketplace.getItemsOnSale();

            expect(items.length).to.eq(1)

            expect(items[0].tokenId.toString()).to.eq("1")
            
            expect(items[0].sold).to.be.false
            
        })

        it('should not get cancelled items', async () => {
            let items = await marketplace.getItemsOnSale();

            await marketplace.cancelSale(items[1].id, monuments.address)
            
            items = await marketplace.getItemsOnSale();
            
            expect(items.length).to.eq(1)

            expect(items[0].tokenId.toString()).to.eq("2")
            
            expect(items[0].sold).to.be.false
            
        })
        it('should get sold items', async () => {
            let items = await marketplace.getItemsOnSale();

            await marketplace.connect(signer2).createSale(items[0].id, monuments.address)
            await marketplace.connect(signer2).createSale(items[1].id, monuments.address)

            items = await marketplace.getItemsSold();

            expect(items.length).to.eq(2)

            expect(items[0].tokenId.toString()).to.eq("2")
            expect(items[1].tokenId.toString()).to.eq("1")
            
            expect(items[0].sold).to.be.true
            expect(items[1].sold).to.be.true
            
            expect(items[0].buyer).to.eq(signer2.address)
            expect(items[1].buyer).to.eq(signer2.address)
        })
        it('should get cancelled items', async () => {
            let items = await marketplace.getItemsOnSale();

            await marketplace.cancelSale(items[0].id, monuments.address)
            await marketplace.cancelSale(items[1].id, monuments.address)

            items = await marketplace.getItemsCancelled();

            expect(items.length).to.eq(2)

            expect(items[0].tokenId.toString()).to.eq("2")
            expect(items[1].tokenId.toString()).to.eq("1")
            
            expect(items[0].sold).to.be.false
            expect(items[1].sold).to.be.false
            
            expect(items[0].cancelled).to.be.true
            expect(items[1].cancelled).to.be.true
            
            expect(await monuments.ownerOf(items[0].tokenId.toString())).to.eq(signer.address)
            expect(await monuments.ownerOf(items[1].tokenId.toString())).to.eq(signer.address)
        })
    })

})
