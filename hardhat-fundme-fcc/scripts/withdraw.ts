import { ethers, getNamedAccounts } from "hardhat";

async function main() {
    const { deployer } = await getNamedAccounts();
    const funeMe = await ethers.getContract("FundMe", deployer);

    console.log("Withdraw Contract");

    const transactionResponse = await funeMe.withdraw();

    await transactionResponse.wait(1);
    console.log("Withdraw finished!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
