import { ethers } from "hardhat";
import { SpiritHeroes } from "../typechain-types";
import http from "http";

async function acceptOwnershipOnL2() {
  const accounts = await ethers.getSigners();
  const caller = accounts[0];
  const callerAddress = await caller.getAddress();
  console.log("Caller:", callerAddress);

  const ZKEVM_DIAMOND_CONTRACT_ADDRESS =
    process.env.ZKEVM_DIAMOND_CONTRACT_ADDRESS;
  if (!ZKEVM_DIAMOND_CONTRACT_ADDRESS) {
    throw new Error(
      "Please set the ZKEVM_DIAMOND_CONTRACT_ADDRESS in your environment variables."
    );
  }

  const acceptingOwnershipContract = await ethers.getContractAt(
    "BridgeFacet", // Replace with your contract's name
    ZKEVM_DIAMOND_CONTRACT_ADDRESS
  );

  //@TODO add data.
  //l1txHash

  const l1txHash =
    "0x89057d9aa6b5ab2d155877d8767b12a67029de8dad5f1892b6f0ceb372096844";

  // Get the required data for the smart contract function
  const { proof, index, dataPayload } =
    await getProofFromLocalEndpoint(l1txHash);

  const smtProof = proof.merkle_proof;
  const mainnetExitRoot = proof.main_exit_root;
  const rollupExitRoot = proof.rollup_exit_root;

  console.log("my datapayload::", dataPayload);

  //console.log("my proof:", proof);

  const tx = await acceptingOwnershipContract.claimBridged(
    dataPayload,
    smtProof,
    index,
    mainnetExitRoot,
    rollupExitRoot
  );

  const receipt = await tx.wait();

  if (!receipt.status) {
    throw new Error(
      `Broadcasting failed with transaction: ${tx.hash}`
    );
  }
  console.log("Ownership  accepted successfully");
  console.log("tx:", tx);
  console.log("tx hash:", tx.hash);
}

async function getProofFromLocalEndpoint(
  l1TxHash: string
): Promise<{ proof: any; index: number; dataPayload: any }> {
  return new Promise((resolve, reject) => {
    const url = `http://localhost:3000/proof-assistant-polygon/getProof/${l1TxHash}`;

    http
      .get(url, (resp) => {
        let data = "";

        // A chunk of data has been received.
        resp.on("data", (chunk) => {
          data += chunk;
        });

        // The whole response has been received.
        resp.on("end", () => {
          resolve(JSON.parse(data));
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

if (require.main === module) {
  acceptOwnershipOnL2()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
