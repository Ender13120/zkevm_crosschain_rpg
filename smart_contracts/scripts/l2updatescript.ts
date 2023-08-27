import { ethers } from "hardhat";
import { callChangeSisterContract } from "./changeSisterContract";

if (require.main === module) {
  (async () => {
    const fs = require("fs");

    const l1Addresses = JSON.parse(
      fs.readFileSync("L1Addresses.json").toString()
    );
    const l2Addresses = JSON.parse(
      fs.readFileSync("L2Addresses.json").toString()
    );

    await callChangeSisterContract(
      l2Addresses.diamondAddress,
      l1Addresses.diamondAddress
    );
  })()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
