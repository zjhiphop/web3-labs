const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { assert, expect } = require("chai");
const { devChains, networkConfig } = require("../../helper-hardhat-conf");

!devChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit test", async function () {
        let raffle, vrfCoordinatorV2Mock, entranceFee, deployer, inverval, player, accounts;
        const chainId = network.config.chainId

        beforeEach(async function () {
            accounts = await ethers.getSigners()
            // deployer = (await getNamedAccounts()).deployer
            deployer = accounts[1]
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

                assert.equal(playerFromContract, deployer.address)
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

            it("Pick a winner, resets the lottery and sends money", async () => {
                const additionalEntrances = 3
                const startingAccountIndex = 2 // deployer = 0
                for (let i = startingAccountIndex; i < startingAccountIndex + additionalEntrances; i++) {
                    const accountConnectedRaffle = raffle.connect(accounts[i])
                    await accountConnectedRaffle.enterRaffle({ value: entranceFee })
                }

                const startingTimestamp = await raffle.getLastTimeStamp()
                console.log(startingTimestamp)
                // performUpkeep (mock being Chainlink keeper)
                // fulfillRandomWords (mock being the Chainlink vrf)
                // wait for fulfillRandomWords called
                await new Promise(async (resolve, reject) => {
                    console.log("Start...")
                    raffle.once("WinnerPicked", async () => {
                        // event listener for WinnerPicked
                        console.log("WinnerPicked event fired!")
                        // assert throws an error if it fails, so we need to wrap
                        // it in a try/catch so that the promise returns event
                        // if it fails.
                        try {
                            // Now lets get the ending values...
                            const recentWinner = await raffle.getRecentWinner()
                            const raffleState = await raffle.getRaffleState()
                            const winnerBalance = await accounts[2].getBalance()
                            const endingTimeStamp = await raffle.getLastTimeStamp()
                            await expect(raffle.getPlayer(0)).to.be.reverted
                            console.log(accounts[0].address)
                            console.log(accounts[1].address)
                            console.log(accounts[2].address)
                            console.log(accounts[3].address)
                            console.log(accounts[4].address)
                            // Comparisons to check if our ending values are correct:
                            assert.equal(recentWinner.toString(), accounts[2].address)
                            assert.equal(raffleState, 0)
                            assert.equal(
                                winnerBalance.toString(),
                                startingBalance // startingBalance + ( (raffleEntranceFee * additionalEntrances) + raffleEntranceFee )
                                    .add(
                                        entranceFee
                                            .mul(additionalEntrances)
                                            .add(entranceFee)
                                    )
                                    .toString()
                            )
                            assert(endingTimeStamp > startingTimestamp)
                            resolve() // if try passes, resolves the promise
                        } catch (e) {
                            reject(e) // if try fails, rejects the promise
                        }
                    })

                    console.log("Before performUpkeep")

                    const tx = await raffle.performUpkeep("0x")

                    console.log("Wait performUpkeep")
                    const txReceipt = await tx.wait(1)

                    console.log("Wait Balance")
                    const startingBalance = await accounts[2].getBalance()

                    console.log("Wait fulfillRandomWords", startingBalance)
                    await vrfCoordinatorV2Mock.fulfillRandomWords(
                        txReceipt.events[1].args.requestId,
                        raffle.address
                    )

                    console.log("fulfillRandomWords finished")
                })

            })
        })
    })