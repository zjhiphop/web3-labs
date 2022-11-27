const { network } = require("hardhat");
const { verifyContract } = require("../utils/verify")

const { networkConfig, developmentChains } = require("../helper-hardhat-conf");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("----------------------------------------------------")
    arguments = []
    const basicNft = await deploy("BasicNft", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verifyContract(basicNft.address, arguments)
    }

    log("Deployed, ", basicNft)
}

module.exports.tags = ["all", "basicnft", "main"]