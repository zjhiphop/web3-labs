import { ethers, getNamedAccounts, network } from "hardhat";
import { devChains } from "../../helper-hardhat-config";

devChains.includes(network.name)
    ? describe.skip
    : describe("FundMe Staging", async function() {
          let fundMe, deployer;
          const sendValue = ethers.utils.parseEther("1");

          beforeEach(async function() {
              deployer = (await getNamedAccounts()).deployer;

              fundMe = await ethers.getContract("FundMe", deployer);
          });

          it("allow people to fund withdraw", async function() {
              await fundMe.fund({ value: sendValue });
              await fundMe.withdraw();

              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              );

              assert.equal(endingBalance.toString(), 0);
          });
      });
