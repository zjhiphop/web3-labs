import { assert, expect } from "chai";
import { deployments, ethers, getNamedAccounts } from "hardhat";
import { inputFile } from "hardhat/internal/core/params/argumentTypes";

describe("FundMe", async function() {
    let fundMe;
    let deployer;
    let mockV3Aggregator;
    let sendValue = ethers.utils.parseEther("1.0");

    beforeEach(async () => {
        // deploy fund contract
        // using hardhat deploy

        // const accounts = await ethers.getSigners()
        // const account = accounts[0]

        deployer = (await getNamedAccounts()).deployer;
        // TODO: tags not works
        // await deployments.fixture(["all"]);
        await deployments.fixture();
        console.log("before each", deployer);
        // https://github.com/wighawag/hardhat-deploy-ethers/issues/1
        fundMe = await ethers.getContract("FundMe", deployer);

        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        );
    });

    describe("Constractor", async function() {
        it("Should set the aggregator addresses correctly", async function() {
            const response = await fundMe.priceFeed();

            assert.equal(response, mockV3Aggregator.address);
        });
    });

    describe("FundMe", async function() {
        it("It should failes if dont' send enough eth", async function() {
            await expect(fundMe.fund()).to.be.revertedWith(
                "Didn't send  enough"
            );
        });

        it("Updated the amount funded data structure", async function() {
            await fundMe.fund({ value: sendValue });

            const response = await fundMe.addressToAmountFunded(deployer);
            assert.equal(response.toString(), sendValue.toString());
        });

        it("add funder to array of funders", async function() {
            await fundMe.fund({ value: sendValue });

            const funder = await fundMe.funders(0);

            assert.equal(funder, deployer);
        });
    });

    describe(
        "Withdrawals",
        await function() {
            beforeEach(async function() {
                await fundMe.fund({ value: sendValue });
            });

            it("Withdrawals ETH from a single funder", async function() {
                // Arrange
                const startingFundBalance = await fundMe.provider.getBalance(
                    fundMe.address
                );

                const startingDeployBalance = await fundMe.provider.getBalance(
                    deployer
                );

                // ACT
                const transactionResponse = await fundMe.withdraw();
                const transactionRecipet = await transactionResponse.wait(1);
                const { gasUsed, effectiveGasPrice } = transactionRecipet;
                const gasCost = gasUsed * effectiveGasPrice;

                const endingFundMeBalance = await fundMe.provider.getBalance(
                    fundMe.address
                );
                const endingDeployBalance = await fundMe.provider.getBalance(
                    deployer
                );

                // Assert
                assert.equal(endingFundMeBalance, 0);
                assert.equal(
                    startingFundBalance.add(startingDeployBalance).toString(),
                    endingDeployBalance.add(gasCost).toString()
                );
            });
        }
    );
});
