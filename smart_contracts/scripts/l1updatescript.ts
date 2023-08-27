import { ethers } from "hardhat";
import { callChangeSisterContract } from "./changeSisterContract";

if (require.main === module) {
  (async () => {
    const fs = require("fs");

    // Read the contract addresses from the saved files
    const l1Addresses = JSON.parse(
      fs.readFileSync("L1Addresses.json").toString()
    );
    const l2Addresses = JSON.parse(
      fs.readFileSync("L2Addresses.json").toString()
    );

    await callChangeSisterContract(
      l1Addresses.diamondAddress,
      l2Addresses.diamondAddress
    );
  })()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
