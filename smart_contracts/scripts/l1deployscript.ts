import { Signer } from "@ethersproject/abstract-signer";
import { ethers, upgrades } from "hardhat";
import { deployDiamond } from "./diamondDeploy";

if (require.main === module) {
  (async () => {
    const l1Addresses = await deployDiamond();
    console.log("L1 Addresses: ", l1Addresses);
    const fs = require("fs");
    fs.writeFileSync("L1Addresses.json", JSON.stringify(l1Addresses));
  })()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
