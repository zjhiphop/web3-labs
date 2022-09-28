const { assert } = require("chai")
const { ethers } = require("hardhat")

describe("SimpleStorage", () => {
    let simpleStorageFac, simpleStorage
    beforeEach(async () => {
        simpleStorageFac = await ethers.getContractFactory("Storage")

        simpleStorage = await simpleStorageFac.deploy()
    })

    it("Should start with number zero", async () => {
        const currentNumber = await simpleStorage.retrieve()
        assert.equal(currentNumber, 0)
    })

    it("Should update when call store", async () => {
        const storeTrans = await simpleStorage.store(5)

        storeTrans.wait(1)

        const currentNumber = await simpleStorage.retrieve()

        assert.equal(currentNumber, 5)
    })

})