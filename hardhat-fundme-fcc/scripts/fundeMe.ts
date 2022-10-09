import { ethers, getNamedAccounts } from "hardhat";

async function main() {
    const { deployer } = await getNamedAccounts();
    const funeMe = await ethers.getContract("FundMe", deployer);
    console.log("Funding Contract");
    const transactionResponse = await funeMe.fund({
        value: ethers.utils.parseEther("1")
    });
    await transactionResponse.wait(1);
    console.log("Funded!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
