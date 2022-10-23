require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");

require('dotenv').config()

const GOERLI_RPC_URL =
  process.env.GOERLI_RPC_URL || "https://eth-goerli.g.alchemy.com";
const key = process.env.PRIVATE_KEY || 0x00;
const etherScanKey = process.env.ETHERSCAN_API_KEY || 0x00;
const coinmarketcapKey = process.env.COIN_MARKET_API_KEY || 0x00;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      blockConfirmations: 1
    },
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [key],
      chainId: 5,
      blockConfirmations: 6
    },
  }
  namedAccounts: {
    deployer: {
      default: 0
    },
    player: {
      default: 1
    }

  }
};
