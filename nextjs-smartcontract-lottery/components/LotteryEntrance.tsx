import { ethers } from "ethers"
import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useNotification } from "web3uikit"
import { abi, contractAddresses } from "../constant/"

export default function LotteryEntrance() {
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    const chainId: string = chainIdHex ? parseInt(chainIdHex).toString() : "31337"

    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    // Hooks
    const [entranceFee, setEntranceFee] = useState(ethers.utils.parseEther("0.01"))
    const [numberOfPlayers, setNumberOfPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    const dispatch = useNotification()

    const {
        runContractFunction: enterRaffle,
        data: enterTxResponse,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        msgValue: entranceFee,
        params: {},
    })

    /* View Functions */

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, // specify the networkId
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUIValues() {
        if (!raffleAddress) return
        try {
            const numPlayersFromCall = await getNumOfPlayers()
            const recentWinnerFromCall = await getRecentWinner()
            const entranceFeeFromCall = await getEntranceFee()
            entranceFeeFromCall && setEntranceFee(entranceFeeFromCall)
            entranceFeeFromCall && setNumberOfPlayers(numPlayersFromCall)
            recentWinnerFromCall && setRecentWinner(recentWinnerFromCall)
        } catch (e) {
            console.log("updateUIValues exception:", e, raffleAddress)
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues()
        }
    }, [isWeb3Enabled])

    // notification
    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction finished successfully",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        })
    }

    const handleSuccess = async (tx) => {
        try {
            await tx.wait(1)
            updateUIValues()
            handleNewNotification(tx)
        } catch (e) {
            console.log(e)
        }
    }

    return (
        <div className="p-5">
            <h1 className="py-5 px-5 font-bold">Lottery</h1>

            {raffleAddress ? (
                <>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async () => {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (e) => console.log(e),
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            "Enter Raffle"
                        )}
                    </button>
                    <div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
                    <div>The current number of players is: {numberOfPlayers}</div>
                    <div>The most previous winner was: {recentWinner}</div>
                </>
            ) : (
                <div>
                    <div>Current ChainId: {chainId}</div>
                    Please connect to a supported chain!
                </div>
            )}
        </div>
    )
}
