const { network } = require("hardhat");
const { verifyContract } = require("../utils/verify")

const { networkConfig, developmentChains } = require("../helper-hardhat-conf");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const deployer = await getNamedAccounts()

    const args = []
    const basicNft = await deploy("BasicNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_LEY) {
        log("Verifying...")
        await verifyContract(basicNft.address, args)
    }
}

module.exports.tags = ["all", "basicnft", "main"]
