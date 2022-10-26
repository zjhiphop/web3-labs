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

        describe("Check Up Keepers", function () {
            it("returns false if user haven't sent any ETH", async function () {
                await network.provider.send('evm_increaseTime', [interval.toNumber() + 1])
                await network.provider.send('evm_mine', [])

                const { upKeepNeeded } = await raffle.callStatic.checkUpkeep([])

                assert(!upKeepNeeded)
            })

            it("Returns false if raffle is not open", async function () {
                await raffle.enterRaffle({ value: entranceFee })

                await network.provider.send('evm_increaseTime', [interval.toNumber() + 1])
                await network.provider.send('evm_mine', [])

                await raffle.performUpkeep([]) // 0x is transform to empty bytes automated
                const raffleState = await raffle.getRaffleState()
                const { upKeepNeeded } = await raffle.checkUpkeep([])

                assert.equal(raffleState.toString(), "2")
                assert(!upKeepNeeded)
            })

            it("Reverts when check up keep is false", async function () {
                await expect(raffle.performUpkeep([])).to.be.revertedWithCustomError(raffle, "Raffle_UpKeepNotNeeded")
            })

            it("Updates the raffle state, emits and event and calls the vrf coordinator", async () => {
                await raffle.enterRaffle({ value: entranceFee })

                await network.provider.send('evm_increaseTime', [interval.toNumber() + 1])
                await network.provider.send('evm_mine', [])

                const txResponse = await raffle.performUpkeep([])
                const txReceipt = await txResponse.wait(1)
                const requestId = txReceipt.events[1].args
                const raffleState = await raffle.getRaffleState()

                assert(requestId > 0)
                assert(raffleState == 2)
            })

        })
        // https://vscode.dev/github/zjhiphop/web3-labs/blob/408309fba78c509a1f9629e68bddd2f7eee4254c/hardhat-lottery/node_modules/.pnpm/@chainlink+contracts@0.5.1_ethers@5.7.2/node_modules/@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol#L88
        describe("fullfill random words", async () => {
            beforeEach(async () => {
                await raffle.enterRaffle({ value: entranceFee })

                await network.provider.send('evm_increaseTime', [interval.toNumber() + 1])
                await network.provider.send('evm_mine', [])
            })

            it("Can only be called after perfrom upkeep", async () => {
                await expect(vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address))
                    .to.be.revertedWith("nonexistent request")

                await expect(vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address))
                    .to.be.revertedWith("nonexistent request")

            })
        })
    })