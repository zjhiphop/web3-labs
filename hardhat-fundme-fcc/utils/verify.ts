import { run } from "hardhat";

export async function verifyContract(contractAddress, args) {
    console.log("Verify contract ");

    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args
        });
    } catch (e) {
        console.log("Verify Erro: ", e);
    }
}
