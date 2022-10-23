const { run } = require("hardhat");

async function verifyContract(contractAddress, args) {
    console.log("Verify contract ");

    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args
        });
    } catch (e) {
        console.log("Verify Error: ", e);
    }
}


module.exports = {
    verifyContract
}