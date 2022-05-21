import NextNProgress from "nextjs-progressbar"
import "../styles/index.css"
import { DappProvider } from "../utils/providers"
import Web3Provider from "../utils/web3-context"

function MyApp({ Component, pageProps }) {
  return <Web3Provider>
    <DappProvider>
      <NextNProgress color="#EF6D6D" />
      <Component {...pageProps} />
    </DappProvider>
  </Web3Provider>
}

export default MyApp
