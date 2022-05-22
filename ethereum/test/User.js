const ERC721_INTERFACE_ID = '0x80ac58cd'
const ERC721_METADATA_INTERFACE_ID = '0x5b5e139f'
const ERC165_INTERFACE_ID = '0x01ffc9a7'


const { ethers } = require('hardhat')
const { expect } = require('chai')

const _e = (amount) => {
    return ethers.utils.parseEther(amount.toString())
}

describe.only("User", () => {
    let monuments, monuments2, signer, signer2, signer3, tapp, user

    beforeEach(async () => {
        [signer, signer2, signer3] = await ethers.getSigners()

        const [Tapp, User, Monuments] = await Promise.all([
            ethers.getContractFactory('Tapp'),
            ethers.getContractFactory('User'),
            ethers.getContractFactory('Monuments')
        ])

        const [_tapp, _user] = await Promise.all([
            Tapp.deploy(),
            User.deploy()
        ])

        await Promise.all([
            _tapp.deployed(),
            _user.deployed()
        ])
        tapp = _tapp
        user = _user

        monuments = await Monuments.deploy(tapp.address, user.address)
        monuments2 = await Monuments.connect(signer2).deploy(tapp.address, user.address)

        await Promise.all([
            monuments.deployed(),
            monuments2.deployed()
        ])

        await Promise.all([
            tapp.mint(_e(4000)),
            tapp.connect(signer2).mint(_e(4000)),
            tapp.connect(signer3).mint(_e(4000)),
        ])

        await Promise.all([
            tapp.approve(monuments.address, _e(4000)),
            tapp.connect(signer2).approve(monuments.address, _e(4000)),
            tapp.connect(signer3).approve(monuments.address, _e(4000))
        ])

        const [txu1, txu2] = await Promise.all([
            user.add(signer.address),
            user.add(signer2.address)
        ])

        await Promise.all([
            txu1.wait(1),
            txu2.wait(1),
        ])

        await Promise.all([
            monuments.mint("uri"),
            monuments.mint("uri"),
            monuments2.connect(signer2).mint("uri"),
            monuments2.connect(signer2).mint("uri"),
        ])


    })
    describe("Success", () => {
        it('Register user in collection', async () => {
            const totalUsers = await user.userCount()
            const id1 = await user.users(signer2.address)
            const id2 = await user.users(signer.address)

            expect(totalUsers.toString()).to.equal("2")

            expect(id1.toString()).to.equal("2")
            expect(id2.toString()).to.equal("1")
        })
        it("adds name to user profile", async () => {
            const [tx1, tx2] = await Promise.all([
                user.addName(1, "Signer 1"),
                user.connect(signer2).addName(2, "Signer 2")
            ])

            await Promise.all([
                tx1.wait(1),
                tx2.wait(1),
            ])

            const [profile1, profile2] = await Promise.all([
                user.profiles(1),
                user.profiles(2),
            ])

            expect(profile1.name).to.equal('Signer 1')
            expect(profile2.name).to.equal('Signer 2')
        })
        it("adds picture to user profile", async () => {
            const [tx1, tx2] = await Promise.all([
                user.addPicture(1, "Picture 1"),
                user.connect(signer2).addPicture(2, "Picture 2")
            ])

            await Promise.all([
                tx1.wait(1),
                tx2.wait(1),
            ])

            const [profile1, profile2] = await Promise.all([
                user.profiles(1),
                user.profiles(2),
            ])

            expect(profile1.picture).to.equal('Picture 1')
            expect(profile2.picture).to.equal('Picture 2')
        })
        it("adds cover to user profile", async () => {
            const [tx1, tx2] = await Promise.all([
                user.addCover(1, "Cover 1"),
                user.connect(signer2).addCover(2, "Cover 2")
            ])

            await Promise.all([
                tx1.wait(1),
                tx2.wait(1),
            ])

            const [profile1, profile2] = await Promise.all([
                user.profiles(1),
                user.profiles(2),
            ])

            expect(profile1.cover).to.equal('Cover 1')
            expect(profile2.cover).to.equal('Cover 2')
        })
        it("gets all nfts for a user", async () => {
            const user1Collections =  await user.getAllTokens(1)
            const user2Collections =  await user.getAllTokens(2)

            expect(user1Collections[0].collectionAddress).to.equal(monuments.address)

            expect(user2Collections[0].collectionAddress).to.equal(monuments2.address)

            expect(user1Collections[0].tokens[0].toString()).to.equal("1")
            expect(user1Collections[0].tokens[1].toString()).to.equal("2")
            
            expect(user2Collections[0].tokens[0].toString()).to.equal("1")
            expect(user2Collections[0].tokens[1].toString()).to.equal("2")

            const c1ownerOf1 = await monuments.ownerOf(1)
            const c1ownerOf2 = await monuments.ownerOf(2)
            
            const c2ownerOf1 = await monuments2.ownerOf(1)
            const c2ownerOf2 = await monuments2.ownerOf(2)

            expect(c1ownerOf1).to.equal(signer.address)
            expect(c1ownerOf2).to.equal(signer.address)
            
            expect(c2ownerOf1).to.equal(signer2.address)
            expect(c2ownerOf2).to.equal(signer2.address)
        })
        it("tracks transfers of the nfts", async () => {
            
            const user1Collections =  await user.getAllTokens(1)
            const user2Collections =  await user.getAllTokens(2)

            expect(user1Collections[0].collectionAddress).to.equal(monuments.address)

            expect(user2Collections[0].collectionAddress).to.equal(monuments2.address)

            expect(user1Collections[0].tokens[0].toString()).to.equal("1")
            expect(user1Collections[0].tokens[1].toString()).to.equal("2")
            
            expect(user2Collections[0].tokens[0].toString()).to.equal("1")
            expect(user2Collections[0].tokens[1].toString()).to.equal("2")

            const c1ownerOf1 = await monuments.ownerOf(1)
            const c1ownerOf2 = await monuments.ownerOf(2)
            
            const c2ownerOf1 = await monuments2.ownerOf(1)
            const c2ownerOf2 = await monuments2.ownerOf(2)

            expect(c1ownerOf1).to.equal(signer.address)
            expect(c1ownerOf2).to.equal(signer.address)
            
            expect(c2ownerOf1).to.equal(signer2.address)
            expect(c2ownerOf2).to.equal(signer2.address)
        })
    })
    xdescribe("Failure", () => {
    })
})
