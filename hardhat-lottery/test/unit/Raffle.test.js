const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { assert, expect } = require("chai");
const { devChains, networkConfig } = require("../../helper-hardhat-conf");

!devChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit test", async function () {
        let raffle, vrfCoordinatorV2Mock, entranceFee, deployer, inverval;
        const chainId = network.config.chainId

        beforeEach(async function () {
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(["all"])
            raffle = await ethers.getContract("Raffle", deployer)
            vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            entranceFee = await raffle.getEntranceFee()
            interval = await raffle.getInterval()
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

            it("Emits event on enter", async function () {
                await expect(raffle.enterRaffle({ value: entranceFee }))
                    .to.emit(raffle, 'RaffleEnter')
            })

            it("Doesn't allow entrance when raffle is calculating", async function () {
                await raffle.enterRaffle({ value: entranceFee })
                // time machine to simulate time shift
                await network.provider.send('evm_increaseTime', [interval.toNumber() + 1])
                await network.provider.send('evm_mine', [])

                // pretend to be a chain keeper
                await raffle.performUpkeep([])
                await expect(raffle.enterRaffle({ value: entranceFee })).to.be.revertedWithCustomError(
                    raffle,
                    "Raffle_NotOpen"
                )
            })
        })
    })