import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"
import { useMoralis } from "react-moralis"
import Header from "../components/Header"

const supportedChains = [31337, 5]

export default function Home() {
    const { isWeb3Enabled, chainId } = useMoralis()

    return (
        <div className={styles.container}>
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header></Header>
            {isWeb3Enabled ? (
                <div>
                    {supportedChains.includes(chainId).toString() ? (
                        <div class="flex flex-row"></div>
                    ) : (
                        <div>{`Please switch to a supported chainId. The supported Chain Ids are: ${supportedChains}`}</div>
                    )}
                </div>
            ) : (
                <div>Please connect to a wallet</div>
            )}
        </div>
    )
}