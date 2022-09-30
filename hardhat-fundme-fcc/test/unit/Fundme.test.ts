import { assert } from "chai";
import { deployments, ethers, getNamedAccounts } from "hardhat";

describe("FundMe", async function() {
    let fundMe;
    let deployer;
    let mockV3Aggregator;

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
});
