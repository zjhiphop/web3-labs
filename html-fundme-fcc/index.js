import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constant.js"

const $connectBtn = document.getElementById('btn-connect')
const $fundBtn = document.getElementById('btn-fund')
const $withdrawBtn = document.getElementById('btn-withdraw')

// fund
$fundBtn.onclick = async function fund() {
    const ethAmount = "2"
    console.log("Funding: " + ethAmount);
    if (window.ethereum) {
        // provider / connection to block chain

        // singer / wallet / with some gas

        // contract we interact with 
        // ^ ABI & Address
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const singer = provider.getSigner()
        console.log(singer);
        const contract = new ethers.Contract(contractAddress, abi, singer)
        try {

            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount)
            })

            // listen for tx to be mined
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done")
        } catch (err) {
            console.log(err);
        }
    }
}

// transaction mine
function listenForTransactionMine(transactionResponse, provider) {
    console.log("Mine transaction: " + transactionResponse.hash);

    return new Promise((resolve, reject) => {

        // listen for transaction to finish
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log("Mine transaction finished: " + transactionReceipt.confirmations);
            resolve()
        })
    })

}


// withdraw
$withdrawBtn.onclick = async function withdraw() {

}
