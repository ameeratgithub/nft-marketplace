import { useWeb3Update } from "../../utils/web3-context"
import { Button, Stack, Typography } from "@mui/material"

export default function ConnectWallet({ withWrapper, fullButton }) {
    const connect = useWeb3Update()

    const button = <Button variant="contained" sx={{ width: fullButton ? '100%' : '65%' }} onClick={connect}>
        Connect Wallet
    </Button>

    return withWrapper ? <Stack>
        <Typography variant="h5" sx={{ mb: '20px' }}>
            Please connect wallet to continue
        </Typography>
        {button}
    </Stack> : <>{button}</>
}