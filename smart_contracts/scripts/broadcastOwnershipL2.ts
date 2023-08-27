import { ethers } from "hardhat";
import { SpiritHeroes } from "../typechain-types";

async function callBroadcastOwnershipToL2() {
  const fs = require("fs");

  const accounts = await ethers.getSigners();
  const caller = accounts[0];
  const callerAddress = await caller.getAddress();
  console.log("Caller:", callerAddress);

  const l1Addresses = JSON.parse(
    fs.readFileSync("L1Addresses.json").toString()
  );

  const NFT_CONTRACT_ADDRESS = l1Addresses.heroAddress;

  const nftContract = (await ethers.getContractAt(
    "SpiritHeroes",
    NFT_CONTRACT_ADDRESS
  )) as SpiritHeroes;

  // Fetching all owned tokenIds
  const balance = await nftContract.balanceOf(callerAddress);
  let tokenIds: number[] = [];

  for (let i = 0; i < balance.toNumber(); i++) {
    const tokenId = await nftContract.tokenOfOwnerByIndex(
      callerAddress,
      i
    );
    tokenIds.push(tokenId.toNumber());
  }

  console.log("Owned tokenIds:", tokenIds);

  if (tokenIds.length === 0) {
    console.log("No owned NFTs found for this address.");
    return;
  }

  // Assuming the contract that has the `broadcastOwnershipToL2` function is already deployed and its address is stored in an environment variable.
  const DIAMOND_CONTRACT_ADDRESS = l1Addresses.diamondAddress;
  if (!DIAMOND_CONTRACT_ADDRESS) {
    throw new Error(
      "Please set the BROADCAST_CONTRACT_ADDRESS in your environment variables."
    );
  }

  const broadcastContract = await ethers.getContractAt(
    "BridgeFacet", // Replace with your contract's name
    DIAMOND_CONTRACT_ADDRESS
  );

  const tx = await broadcastContract.broadcastOwnershipToL2(tokenIds);
  const receipt = await tx.wait();

  if (!receipt.status) {
    throw new Error(
      `Broadcasting failed with transaction: ${tx.hash}`
    );
  }
  console.log("Tokens broadcasted successfully");

  fs.writeFileSync(
    "broadcastedOwnershipHash.json",
    JSON.stringify(receipt)
  );
}

if (require.main === module) {
  callBroadcastOwnershipToL2()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
