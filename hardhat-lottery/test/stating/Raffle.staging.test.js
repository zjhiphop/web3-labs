const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { assert, expect } = require("chai");
const { devChains, networkConfig } = require("../../helper-hardhat-conf");

devChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit test", async function () {
        let raffle, vrfCoordinatorV2Mock, entranceFee, deployer, inverval, player, accounts;
        const chainId = network.config.chainId

        beforeEach(async function () {
            accounts = await ethers.getSigners()
            // deployer = (await getNamedAccounts()).deployer
            deployer = accounts[1]
            raffle = await ethers.getContract("Raffle", deployer)
            entranceFee = await raffle.getEntranceFee()
        })

        describe("fullfill Random words", async function () {
            it('works with live chain link keepers and chianlink vrf', async function () {

                const startingTimestamp = raffle.getLatestTimeStamp()
                const accounts = await ethers.getSigners()

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
                            const raffleState = await accounts[0]].getRaffleState()
                            const endingTimeStamp = await raffle.getLatestTimeStamp()
                            const winnerEndingBalance = recentWinner.getBalance()

                            await expect(raffle.getPlayer(0)).to.be.reverted;
                            assert.equal(raffleState, 0)
                            assert.equal(winnerEndingBalance.toString(),
                                winnerStartBalance.add(entranceFee).toString()
                            )
                            assert(endingTimeStamp > startingTimestamp)
                            resolve()
                        } catch (e) {
                            reject()
                        }
                    })

                    const tx = await raffle.enterRaffle({ value: entranceFee })
                    await tx.wait(1)

                    const winnerStartBalance = await accounts[0].getBalance()
                })
            })
        })
    })