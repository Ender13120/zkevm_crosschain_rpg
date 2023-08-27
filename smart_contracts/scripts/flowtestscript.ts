import { ethers } from "hardhat";
import { callChangeSisterContract } from "./changeSisterContract";
import { mintNFT } from "./mintTestNfts";
import { createRPGClasses } from "./initClasses";

if (require.main === module) {
  (async () => {
    const fs = require("fs");

    const l1Addresses = JSON.parse(
      fs.readFileSync("L1Addresses.json").toString()
    );
    const l2Addresses = JSON.parse(
      fs.readFileSync("L2Addresses.json").toString()
    );

    await mintNFT(l1Addresses.heroAddress);

    await createRPGClasses(l1Addresses.heroAddress);
  })()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
