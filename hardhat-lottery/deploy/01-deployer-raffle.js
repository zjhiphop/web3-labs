const { network, ethers } = require("hardhat");
const { networks } = require("../hardhat.config");
const { devChains, networkConfig } = require("../helper-hardhat-conf");
const { verifyContract } = require("../utils/verify");


const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("30")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts()
    let vrfCoordinatorV2Address, subscriptionId
    let chainId = network.config.chainId
    const entranceFee = networkConfig[chainId].entranceFee
    const gasLane = networkConfig[chainId].gasLane

    const callbackGasLimit = networkConfig[chainId].callbackGasLimit
    const interval = networkConfig[chainId].interval
    // args:
    // address vrfCordinatorV2, // Contract
    // uint256 entranceFee,
    // bytes32 gasLane,
    // uint64 subscriptionId,
    // uint32 callbackGasLimit,
    // uint256 interval
    let vrfCoordinatorV2Mock
    if (devChains.includes(network.name)) {
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address

        //create subscription 
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
        const transactionReceipt = await transactionResponse.wait(1)

        subscriptionId = transactionReceipt.events[0].args.subId

        // Fund the subscription
        // normally link token on a real network
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)

    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId

    }

    let args = [
        vrfCoordinatorV2Address,
        entranceFee,
        gasLane,
        subscriptionId,
        callbackGasLimit,
        interval
    ]
    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitForConfirmations: network.config.blockConfirmations || 1
    })

    // verify after deployed
    if (!devChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")

        verifyContract(raffle.address, args)
    } else {
        // https://github.com/PatrickAlphaC/hardhat-smartcontract-lottery-fcc/issues/46
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, raffle.address)
    }

    log("Raffle Deployed successfully")
}

module.exports.tags = ["all", "raffle"]