const ERC721_INTERFACE_ID = '0x80ac58cd'
const ERC721_METADATA_INTERFACE_ID = '0x5b5e139f'
const ERC165_INTERFACE_ID = '0x01ffc9a7'


const { ethers } = require('hardhat')
const { expect } = require('chai')

const _e = (amount) => {
    return ethers.utils.parseEther(amount.toString())
}

xdescribe("Monuments", () => {
    let monuments, signer, signer2, signer3, tapp, marketplace

    beforeEach(async () => {
        [signer, signer2, signer3] = await ethers.getSigners()

        const Tapp = await ethers.getContractFactory('Tapp')
        tapp = await Tapp.deploy()

        const Marketplace = await ethers.getContractFactory('Marketplace')
        marketplace = await Marketplace.deploy()
        await marketplace.deployed()

        const Monuments = await ethers.getContractFactory('Monuments')
        monuments = await Monuments.deploy(tapp.address)
        await monuments.deployed()

        await tapp.mint(_e(4000))
        await tapp.connect(signer2).mint(_e(4000))
        await tapp.connect(signer3).mint(_e(4000))

        await tapp.approve(monuments.address, _e(4000));
        await tapp.connect(signer2).approve(monuments.address, _e(4000));
        await tapp.connect(signer3).approve(monuments.address, _e(4000));

    })
    xdescribe("Active Minting", () => {
        it("mints tokens to msg.sender", async () => {
            await monuments.mint("uri")
            await monuments.mint("uri")

            const ownerof1 = await monuments.ownerOf(1)
            const ownerof2 = await monuments.ownerOf(2)

            const balance = await monuments.balanceOf(signer.address)

            expect(ownerof1).to.be.equal(signer.address)
            expect(ownerof2).to.be.equal(signer.address)

            expect(balance.toString()).to.be.eq("2")

        })
        it("approves an operator for all tokens", async () => {
            await monuments.mint("uri")
            await monuments.mint("uri")

            await monuments.setApprovalForAll(signer2.address, true)

            const isApproved = await monuments.isApprovedForAll(signer.address, signer2.address)

            expect(isApproved).to.be.true

        })
        it("gets token uris", async () => {
            await monuments.mint("uri")
            await monuments.mint("uri")



            const uri1 = await monuments.tokenURI(1)
            const uri2 = await monuments.tokenURI(2)

            expect(uri1).to.be.equal("uri")
            expect(uri2).to.be.equal("uri")

        })
        it("approves an operator for specific token", async () => {
            await monuments.mint("uri")
            await monuments.mint("uri")

            await monuments.approve(signer2.address, 1)
            await monuments.approve(signer3.address, 2)

            const approved1 = await monuments.getApproved(1)
            const approved2 = await monuments.getApproved(2)

            expect(approved1).to.be.equal(signer2.address)
            expect(approved2).to.be.equal(signer3.address)

        })


        it("transfer tokens to specified address", async () => {
            await monuments.mint("uri")
            await monuments.mint("uri")

            await monuments.approve(signer2.address, 1)
            await monuments.approve(signer3.address, 2)



            await monuments.connect(signer2).transferFrom(signer.address, signer2.address, 1)
            await monuments.connect(signer3).transferFrom(signer.address, signer3.address, 2)

            const ownerof1 = await monuments.ownerOf(1)
            const ownerof2 = await monuments.ownerOf(2)

            expect(ownerof1).to.be.equal(signer2.address)
            expect(ownerof2).to.be.equal(signer3.address)

        })



        it('supports required interfaces', async () => {
            const supportsERC721 = await monuments.supportsInterface(ERC721_INTERFACE_ID)
            const supportsERC721Metadata = await monuments.supportsInterface(ERC721_METADATA_INTERFACE_ID)
            const supportsERC165 = await monuments.supportsInterface(ERC165_INTERFACE_ID)
            const supportsFFFF = await monuments.supportsInterface('0xffffffff')

            expect(supportsERC721).to.be.true
            expect(supportsERC721Metadata).to.be.true
            expect(supportsERC165).to.be.true
            expect(supportsFFFF).not.to.be.true
        })
    })
    describe("Lazy Minting", () => {
        it('should add lazy token', async () => {

            const tx1 = await monuments.addLazyToken("uri1", _e(1))
            const tx2 = await monuments.connect(signer2).addLazyToken("uri2", _e(2))

            await tx1.wait(1)
            await tx2.wait(1)

            const lazyTokens = await monuments.getAllLazyTokens()

            expect(lazyTokens[0].id.toString()).to.equal("1")
            expect(lazyTokens[0].uri).to.equal("uri1")
            expect(lazyTokens[0].creator).to.equal(signer.address)
            expect(lazyTokens[0].price.toString()).to.equal(_e(1))
            expect(lazyTokens[0].minted).to.be.false

            expect(lazyTokens[1].id.toString()).to.equal("2")
            expect(lazyTokens[1].uri).to.equal("uri2")
            expect(lazyTokens[1].creator).to.equal(signer2.address)
            expect(lazyTokens[1].price.toString()).to.equal(_e(2))
            expect(lazyTokens[1].minted).to.be.false

        })
        it('should add batch lazy tokens', async () => {

            const tx1 = await monuments.addLazyTokens(["uri1", "uri2"], [_e(1), _e(2)])

            await tx1.wait(1)

            const lazyTokens = await monuments.getAllLazyTokens()

            expect(lazyTokens[0].id.toString()).to.equal("1")
            expect(lazyTokens[0].uri).to.equal("uri1")
            expect(lazyTokens[0].creator).to.equal(signer.address)
            expect(lazyTokens[0].price.toString()).to.equal(_e(1))
            expect(lazyTokens[0].minted).to.be.false

            expect(lazyTokens[1].id.toString()).to.equal("2")
            expect(lazyTokens[1].uri).to.equal("uri2")
            expect(lazyTokens[1].creator).to.equal(signer.address)
            expect(lazyTokens[1].price.toString()).to.equal(_e(2))
            expect(lazyTokens[1].minted).to.be.false

        })
        it('should mint lazy token', async () => {

            const tx1 = await monuments.addLazyTokens(["uri1", "uri2"], [_e(1), _e(2)])

            await tx1.wait(1)



            let lazyTokens = await monuments.getAllLazyTokens()

            const mintPromises = lazyTokens.map((lazyToken) => {
                return monuments.connect(signer2).mintLazyToken(lazyToken.id, lazyToken.uri)
            })

            const txs = (await Promise.all(mintPromises)).map(tx=>tx.wait(1))

            await Promise.all(txs)

            lazyTokens = await monuments.getAllLazyTokens()

            expect(lazyTokens[0].minted).to.be.true
            expect(lazyTokens[1].minted).to.be.true

            const tokens = await monuments.getTokensList()

            expect(tokens[0].creator).to.equal(signer.address)
            expect(tokens[0].owner).to.equal(signer2.address)

            expect(tokens[1].creator).to.equal(signer.address)
            expect(tokens[1].owner).to.equal(signer2.address)

        })
    })
})
