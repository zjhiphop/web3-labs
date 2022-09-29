import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
import "solidity-coverage";
import "hardhat-deploy";

dotenv.config();
const GOERLI_RPC_URL =
    process.env.GOERLI_RPC_URL || "https://eth-goerli.g.alchemy.com";
const key = process.env.PRIVATE_KEY || 0x00;
const etherScanKey = process.env.ETHERSCAN_API_KEY || 0x00;
const coinmarketcapKey = process.env.COIN_MARKET_API_KEY || 0x00;

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
    solidity: "0.8.17",
    defaultNetwork: "hardhat",
    networks: {
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [key],
            chainId: 5
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337
        }
    },
    etherscan: {
        apiKey: etherScanKey
    },
    gasReporter: {
        enabled: false,
        outputFile: "gas-reporter.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: coinmarketcapKey
    },

    namedAccounts: {
        deployer: {
            default: 0
        },
        user: {
            default: 1
        }
    }
};

export default config;
