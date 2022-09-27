// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { run, network } = require("hardhat");
const hre = require("hardhat");
const { networks } = require("../hardhat.config");

async function main() {
    const simpleStorageFa = await hre.ethers.getContractFactory("Storage");

    console.log("Deploying contract...")

    const simpleStorage = await simpleStorageFa.deploy()

    await simpleStorage.deployed()

    console.log("Deployed contract to add to storage" + simpleStorage.address);

    if (network.config.chainId === 5 && process.env.ETHERSCAN_API_KEY) {
        await simpleStorage.deployTransaction.wait(6)
        await verifyContract(simpleStorage.address, [])
    }

    const currentNumber = await simpleStorage.retrieve()
    console.log("currentNumber: ", currentNumber)

    const transactionStorage = await simpleStorage.store(5)
    await transactionStorage.wait(1)

    const updatedValue = await simpleStorage.retrieve()
    console.log("updatedValue: ", updatedValue)
}

// use ether scan api to verify contract 
async function verifyContract(contractAddress, args) {
    console.log('Verify contract ')

    try {

        await run('verify:verify', {
            address: contractAddress,
            constructorArguments: args
        })
    } catch (e) {
        console.log("Verify Erro: ", error)
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
