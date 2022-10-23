const { deployments, network, ethers } = require("hardhat");
const { devChains } = require("../helper-hardhat-conf");

const BASE_FEE = ethers.utils.parseEther('0.25')
const GAS_PRICE_LINK = 1e9 // 1000000000 //link per gas,  calculated value base on the gas price of the chain


// Chainlink nodes pay the gas fees to give us randomness & do external execution

module.exports = async function ({ getNamedAccounts, deployments }) {

    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId;

    if (devChains.includes(network.name)) {
        log("Local network detected: " + network.name)
        // deploy a mock vrfCoordinator
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args: [BASE_FEE, GAS_PRICE_LINK],
            logs: true
        })

        log("Mock deployed!")
    }
}   

module.exports.tags = ["all", "mocks"]