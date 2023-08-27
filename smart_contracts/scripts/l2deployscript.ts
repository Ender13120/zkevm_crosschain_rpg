import { Signer } from "@ethersproject/abstract-signer";
import { ethers, upgrades } from "hardhat";
import { deployDiamond } from "./diamondDeploy";

if (require.main === module) {
  (async () => {
    const l2Addresses = await deployDiamond();
    console.log("L2 Addresses: ", l2Addresses);

    const fs = require("fs");
    fs.writeFileSync("L2Addresses.json", JSON.stringify(l2Addresses));
  })()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
