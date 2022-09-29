import { network } from "hardhat";
import { devChains, networkConfig } from "../helper-hardhat-config";

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

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddr],
        log: true
    });

    log("Deployed!!");
}

export default deployFunc;
