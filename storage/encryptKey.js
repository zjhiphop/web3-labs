
const ethers = require('ethers');
const fs = require('fs-extra');
require('dotenv').config()

async function main() {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY)
    const encryptedKey = await wallet.encrypt(process.env.PRIVATE_KEY_PASSWORD, process.env.PRIVATE_KEY)

    console.log(encryptedKey)
    fs.writeFileSync("./.encryptedKey.json", encryptedKey)
}


main().then(data => {
    console.log(data)
    process.exit(0)
})
    .catch(e => {
        process.exit(1)
        console.log(e)
    })