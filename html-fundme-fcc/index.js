import { ethers } from "ethers"

const $connectBtn = document.getElementById('btn-connect')
const $fundBtn = document.getElementById('btn-fund')
const $withdrawBtn = document.getElementById('btn-withdraw')

// fund
async function fund(ethAmount) {
    console.log("Funding: " + ethAmount);
    if (window.ethereum) {
        // provider / connection to block chain

        // singer / wallet / with some gas

        // contract we interact with 

        // ^ ABI & Address
    }
}

// withdraw
async function withdraw() {

}
