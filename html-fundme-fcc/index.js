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
        } catch (err) {
            console.log(err);
        }



    }
}

// withdraw
$withdrawBtn.onclick = async function withdraw() {

}
