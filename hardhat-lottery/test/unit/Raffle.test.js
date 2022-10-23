const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { assert, expect } = require("chai");
const { devChains, networkConfig } = require("../../helper-hardhat-conf");

!devChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit test", async function () {
        let raffle, vrfCoordinatorV2Mock, entranceFee, deployer;
        const chainId = network.config.chainId

        beforeEach(async function () {
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(["all"])
            raffle = await ethers.getContract("Raffle", deployer)
            vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            entranceFee = await raffle.getEntranceFee()
        })

        describe("Constructor", async function () {

            it("Initializes the raffle correctly", async function () {
                const raffleState = await raffle.getRaffleState()
                const interval = await raffle.getInterval()

                assert.equal(raffleState.toString(), "0")
                assert.equal(interval.toString(), networkConfig[chainId].interval)
            })

        })

        describe("Enter Raffle", async function () {

            it("Reverts when you don't pay", async function () {
                await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(
                    raffle,
                    "Raffle_NotEnoughETHEntered"
                );
            })

            it("Records players when enterRaffle", async function () {
                await raffle.enterRaffle({ value: entranceFee })

                const playerFromContract = await raffle.getPlayer(0)

                assert.equal(playerFromContract, deployer)
            })
        })
    })