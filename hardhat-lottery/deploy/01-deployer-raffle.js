const { network } = require("hardhat");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts()

    // args:
    // address vrfCordinatorV2, // Contract
    // uint256 entranceFee,
    // bytes32 gasLane,
    // uint64 subscriptionId,
    // uint32 callbackGasLimit,
    // uint256 interval



    const raffle = await deploy("Raffle", {
        from: deployer,
        args: [],
        log: true,
        waitForConfirmations; network.config.blockConfirmations || 1
    })
}