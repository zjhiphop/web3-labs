
const { assert } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { devChains, networkConfig } = require("../../helper-hardhat-conf");

!devChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit test", async function () {
        let raffle, vrfCoordinatorV2Mock;
        const chainId = network.config.chainId

        beforeEach(async function () {
            const { deployer } = await getNamedAccounts()
            await deployments.fixture(["all"])
            raffle = await ethers.getContract("Raffle", deployer)
            vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
        })

        describe("Constructor", async function () {

            it("Initializes the raffle correctly", async function () {
                const raffleState = await raffle.getRaffleState()
                const interval = await raffle.getInterval()

                assert.equal(raffleState.toString(), "0")
                assert.equal(interval.toString(), networkConfig[chainId].interval)
            })

        })
    })