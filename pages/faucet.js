
import { Button, Chip, Container, Divider, TextField, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { getLimit, getUserBalance, mint } from "../apis/tapp"
import ConnectWallet from "../components/common/ConnectWallet"
import Link from 'next/link'
import Layout from "../components/layout"
import { _e, _w } from "../utils/ethers"
import { useWeb3 } from "../utils/web3-context"
import { useDappProvider, useUpdatedDappProvider } from "../utils/providers"
import { LoadingButton } from "@mui/lab"

export default ({ }) => {
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)

    const { signer, address } = useWeb3()
    const { tapp: { balance, limit } } = useDappProvider()
    const { loadTappData } = useUpdatedDappProvider()


    const _mint = async () => {
        if (Number(amount) > limit || Number(amount) <= 0) return
        setLoading(true)
        try {
            const tx = await mint(_w(amount), signer)
            await tx.wait(1)
        } catch (err) { }
        setLoading(false)
        loadTappData()
    }
    return <Layout>
        { !address && <ConnectWallet withWrapper={true}/>}
        { address &&<Container sx={{ display: 'flex', mt: '80px' }}>
            <Container sx={{ width: '40%' }}>
                <Typography variant="h5" sx={{ mb: '10px' }}>Current Balance</Typography>
                <Chip label={` ${balance} Tapps `} sx={{ mb: '10px', fontSize: '15px', fontWeight: 'bold' }} />
                <Divider sx={{ mt: '10px', mb: '20px' }} />
                <Typography variant="p" sx={{ mb: '20px' }} >You can mint {limit} more tapps</Typography>
                <Link href={`/collections`} passHref>
                    <Button variant="contained" sx={{ width: '100%', mt: '33px' }} color="success">
                        Explore Collections
                    </Button>
                </Link>
            </Container>
            <Container sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" sx={{ mb: '10px' }}>Mint your Tapps</Typography>
                <Typography variant="p" sx={{ mb: '30px' }}>Tapps can be used to take part in NFT minting, purchasing and other activities</Typography>
                <TextField
                    error={Number(amount) > limit}
                    helperText={Number(amount) > limit && `You can't mint more than ${limit} Tapps`}
                    label="Number of tapps to mint"
                    type="number"
                    value={amount}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    onChange={e => setAmount(e.target.value)}
                />
                <LoadingButton loading={loading} variant="contained"
                    sx={{ mt: '20px' }} onClick={_mint}>
                    Mint
                </LoadingButton>
            </Container>

        </Container>}
    </Layout>
}

export async function getServerSideProps() {
    return {
        props: {
        }
    }
}