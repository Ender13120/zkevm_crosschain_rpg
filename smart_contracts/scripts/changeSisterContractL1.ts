import { ethers } from "hardhat";
import { SpiritHeroes } from "../typechain-types";

async function callChangeSisterContract() {
  const accounts = await ethers.getSigners();
  const caller = accounts[0];
  const callerAddress = await caller.getAddress();
  console.log("Caller:", callerAddress);

  // Assuming the contract that has the `broadcastOwnershipToL2` function is already deployed and its address is stored in an environment variable.
  const DIAMOND_CONTRACT_ADDRESS =
    process.env.DIAMOND_CONTRACT_ADDRESS;

  const NEW_SISTER_CONTRACT_ADDRESS =
    "0xd78804aa5856A635B3489f2b74DA7738462dDC82";

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
