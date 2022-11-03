import { useEffect } from "react"
import { useMoralis } from "react-moralis"

export default function ManualHeader() {
    const { enableWeb3, isWeb3Enabled, isWeb3EnableLoading, account, Moralis, deactivateWeb3 } =
        useMoralis()

    useEffect(() => {
        if (!isWeb3Enabled && !!window && localStorage.getItem("connected")) {
            enableWeb3()
        }
    }, [isWeb3Enabled])

    useEffect(() => {
        Moralis.onAccountChanged((account) => {
            console.log(`Account changed to ${account}`)

            if (!account) {
                localStorage.removeItem("connected")
                deactivateWeb3()
                console.log("Account not found")
            }
        })
    })

    return (
        <nav className="p-5 border-b-2">
            <div className="flex flex-row">
                {account ? (
                    <div className="ml-auto py-2 px-4">Connected to {account}</div>
                ) : (
                    <button
                        onClick={async () => {
                            const res = await enableWeb3()

                            if (res) {
                                localStorage.setItem("connected", "injected")
                            }
                        }}
                        disabled={isWeb3EnableLoading}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded-t ml-auto"
                    >
                        Connect
                    </button>
                )}
            </div>
        </nav>
    )
}
