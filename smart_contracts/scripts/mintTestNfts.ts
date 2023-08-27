import { ethers } from "hardhat";
import { SpiritHeroes } from "../typechain-types";

export async function mintNFT(_nftContractAddr: string) {
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];
  const deployerAddress = await deployer.getAddress();
  console.log("Minter:", deployerAddress);

  // Connect to the deployed NFT contract
  const nftContract = (await ethers.getContractAt(
    "SpiritHeroes",
    _nftContractAddr
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

  const tx = await nftContract.safeMint(deployerAddress, uri, stats);
  const receipt = await tx.wait();

  if (!receipt.status) {
    throw new Error(`Minting failed with transaction: ${tx.hash}`);
  }
  console.log("NFT minted successfully with tokenId:", tokenId);
}
