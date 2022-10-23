const { deployments, network } = require("hardhat");
const { devChains } = require("../helper-hardhat-conf");

module.exports = async function ({ getNamedAccounts, deployments }) {

    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId;

    if (devChains.includes(network.name) {
        log("Local network detected: " + network.name)
        // deploy a mock vrfCoordinator
    }
}   