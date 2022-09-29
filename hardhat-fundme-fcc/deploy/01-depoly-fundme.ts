import { network } from "hardhat";

async function deployFunc({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    console.log(deployer, chainId);
}

export default deployFunc;
