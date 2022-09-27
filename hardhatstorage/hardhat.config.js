require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()
require('./task/block-number')

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL
const key = process.env.PRIVATE_KEY
const etherScanKey = process.env.ETHERSCAN_API_KEY
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
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
  }
};
