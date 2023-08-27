import { ethers } from "hardhat";
import { SpiritHeroes } from "../typechain-types";
import http from "http";

async function validateOwnershipOnL2() {
  const fs = require("fs");
  const l2Addresses = JSON.parse(
    fs.readFileSync("L2Addresses.json").toString()
  );

  const accounts = await ethers.getSigners();
  const caller = accounts[0];
  const callerAddress = await caller.getAddress();
  console.log("Caller:", callerAddress);

  const ZKEVM_DIAMOND_CONTRACT_ADDRESS = l2Addresses.diamondAddress;

  const zkevmDiamond = await ethers.getContractAt(
    "TeamFacet",
    ZKEVM_DIAMOND_CONTRACT_ADDRESS
  );

  const tx = await zkevmDiamond.checkOwnershipDetails(1);

  console.log("result:", tx);
}

if (require.main === module) {
  validateOwnershipOnL2()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
