import { ethers } from "hardhat";
import { SpiritHeroes } from "../typechain-types";

async function callChangeSisterContract() {
  const accounts = await ethers.getSigners();
  const caller = accounts[0];
  const callerAddress = await caller.getAddress();
  console.log("Caller:", callerAddress);

  // Assuming the contract that has the `broadcastOwnershipToL2` function is already deployed and its address is stored in an environment variable.
  const DIAMOND_CONTRACT_ADDRESS =
    process.env.ZKEVM_DIAMOND_CONTRACT_ADDRESS;

  const NEW_SISTER_CONTRACT_ADDRESS =
    "0xa89d4C96Bbe581FFc6EA7F1C4337414f8F3Cc824";

  if (!DIAMOND_CONTRACT_ADDRESS) {
    throw new Error(
      "Please set the BROADCAST_CONTRACT_ADDRESS in your environment variables."
    );
  }

  const adminFacet = await ethers.getContractAt(
    "AdminFacet", // Replace with your contract's name
    DIAMOND_CONTRACT_ADDRESS
  );

  const tx = await adminFacet.changeSisterContract(
    NEW_SISTER_CONTRACT_ADDRESS
  );
  const receipt = await tx.wait();

  if (!receipt.status) {
    throw new Error(
      `Changing sister contract failed with transaction: ${tx.hash}`
    );
  }
  console.log("Sister contract changed successfully");
  console.log("tx:", tx);
}

if (require.main === module) {
  callChangeSisterContract()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
