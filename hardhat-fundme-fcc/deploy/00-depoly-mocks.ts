import { network } from "hardhat";
import {
    DECIMALAS,
    devChains,
    INITIAL_ANS,
    networkConfig
} from "../helper-hardhat-config";

export default async function deployFunc({ getNamedAccounts, deployments }) {
    console.log("Deploying...");
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    console.log(chainId);

    if (chainId === 31337) {
        log("Local network detected, deploy mock..");

        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALAS, INITIAL_ANS]
        });

        log("Mock Deployed");
        log("-----------------------------------");
    }
}

export const tags = ["all", "mocks"];
