import { ethers } from "hardhat";
import { SpiritHeroes } from "../typechain-types";

export async function mintNFT() {
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];
  const deployerAddress = await deployer.getAddress();
  console.log("Minter:", deployerAddress);

  // Assuming the contract address is stored in an environment variable
  const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;

  if (!NFT_CONTRACT_ADDRESS) {
    throw new Error(
      "Please set the NFT_CONTRACT_ADDRESS in your environment variables."
    );
  }

  // Connect to the deployed NFT contract
  const nftContract = (await ethers.getContractAt(
    "SpiritHeroes",
    NFT_CONTRACT_ADDRESS
  )) as SpiritHeroes;

  // Example tokenId, uri and stats for the NFT to be minted
  const tokenId = 1;
  const uri = "https://myapi.com/token/1";
  const stats = {
    name: "HeroName",
    health: 100,
    ATK: 50,
    DEX: 50,
    INT: 50,
    CONST: 50,
    WIS: 50,
  };

  const contractOwner = await nftContract.owner();
  console.log("Contract Owner:", contractOwner);

  const tx = await nftContract.safeMint(
    deployerAddress,
    tokenId,
    uri,
    stats
  );
  const receipt = await tx.wait();

  if (!receipt.status) {
    throw new Error(`Minting failed with transaction: ${tx.hash}`);
  }
  console.log("NFT minted successfully with tokenId:", tokenId);
}

if (require.main === module) {
  mintNFT()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
