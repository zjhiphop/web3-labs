const { task } = require('hardhat/config')

task("block-number", "Prints the number of blocks").setAction(
    async (taskArgs, hre) => {
        const blockNumber = await hre.ethers.provider.getBlockNumber()
        console.log("Block number: " + blockNumber)
    }
)