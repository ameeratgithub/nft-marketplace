import { Button, Container, Divider, Grid, Typography } from "@mui/material"
import Image from "next/image"
import Link from "next/link"
import React, { useContext, useState } from "react"
import pic from '../../assets/images/bc-iso.jpg'
import { useWeb3, useWeb3Update } from "../../utils/web3-context"
import ConnectWallet from "../common/ConnectWallet"


const Banner = () => {
    const { signer, provider, address } = useWeb3()

    return <Grid container spacing={2} sx={{ display: 'flex', alignItems: 'center' }}>
        <Grid item md={6} lg={4}>
            <Container sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'start', minHeight: '300px' }}>
                <Typography
                    variant="h4"
                    sx={{ mb: '10px' }}
                >
                    NFT Marketplace
                </Typography>
                <Divider />
                <Typography
                    variant="p"
                    sx={{ mt: '20px', lineHeight: '1.6' }}
                >
                    Explore dynamic collection creation and dynamic NFT minting without code, demonstrating potential of blockchain
                </Typography>
                <Container sx={{ display: 'flex', justifyContent: 'space-between', mt: '30px' }}>
                    {address ? <Link href={`/faucet`} passHref>
                        <Button variant="contained" sx={{ width: '65%' }}>
                            Get Started
                        </Button>
                    </Link> : <ConnectWallet />}

                </Container>
            </Container>
        </Grid>
        <Grid item md={6} lg={8}>
            <Image src={pic} alt="Blockchain, Dapps" />
        </Grid>


    </Grid>
}

export default Banner;