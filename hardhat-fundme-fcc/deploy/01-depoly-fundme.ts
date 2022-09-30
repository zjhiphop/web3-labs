import { verifyContract } from "../utils/verify";
import { network } from "hardhat";
import { devChains, networkConfig } from "../helper-hardhat-config";
import { verify } from "crypto";

async function deployFunc({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    console.log(deployer, chainId);

    // change the address via the chainId
    let ethUsdPriceFeedAddr;

    if (devChains.includes(network.name)) {
        const ethUseAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddr = ethUseAggregator.address;
    } else {
        ethUsdPriceFeedAddr = networkConfig[chainId]?.ethUsdPriceFeed;
    }

    const args = [ethUsdPriceFeedAddr];

    // verifyContract();

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddr],
        log: true,
        withConfirmations: network.config.blockConfirmations || 1
    });

    if (!devChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verifyContract(fundMe.address, args);
    }

    log("Deployed!!");
}

export default deployFunc;
