

const { ethers } = require("hardhat")

async function enterRaffle() {
    const accounts = await ethers.getSigners()

    const raffle = await ethers.getContract("Raffle", accounts[1])
    const entranceFee = await raffle.getEntranceFee()
    await raffle.enterRaffle({ value: entranceFee + 1 })
    console.log("Entered!")
}

enterRaffle()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })