const { ethers } = require("hardhat");

const networkConfig = {
    5: {
        name: "Goerli",
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        subscriptionId: 4857,
        callbackGasLimit: "500000",
        interval: "30"
    },
    31337: {
        name: "localhost",
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15", // hardhat doesn't matter this conf,
        callbackGasLimit: "500000",
        interval: "30"
    }
};

const devChains = ["hardhat", "localhost"];

module.exports = {
    devChains,
    networkConfig
}