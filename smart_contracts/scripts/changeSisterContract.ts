import { ethers } from "hardhat";
import { SpiritHeroes } from "../typechain-types";

export async function callChangeSisterContract(
  currentContractAddress: string,
  newSisterContractAddress: string
) {
  const accounts = await ethers.getSigners();
  const caller = accounts[0];
  const callerAddress = await caller.getAddress();
  console.log("Caller:", callerAddress);

  const adminFacet = await ethers.getContractAt(
    "AdminFacet",
    currentContractAddress
  );
  const tx = await adminFacet.changeSisterContract(
    newSisterContractAddress
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
