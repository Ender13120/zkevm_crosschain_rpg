import { ethers } from "hardhat";
import { SpiritHeroes } from "../typechain-types";

export async function createRPGClasses(_nftContractAddr: string) {
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];
  console.log("Class creator:", deployer.address);

  const nftContract = (await ethers.getContractAt(
    "SpiritHeroes",
    _nftContractAddr
  )) as SpiritHeroes;

  const classIds: number[] = [];
  for (let i = 1; i <= 6; i++) {
    classIds.push(i);
  }

  const stats = [
    {
      name: "warrior",
      health: 160,
      ATK: 80,
      DEX: 50,
      INT: 20,
      CONST: 70,
      WIS: 40,
    },
    {
      name: "paladin",
      health: 200,
      ATK: 50,
      DEX: 40,
      INT: 40,
      CONST: 65,
      WIS: 55,
    },
    {
      name: "icemage",
      health: 90,
      ATK: 40,
      DEX: 40,
      INT: 120,
      CONST: 40,
      WIS: 80,
    },
    {
      name: "bard",
      health: 100,
      ATK: 50,
      DEX: 60,
      INT: 90,
      CONST: 50,
      WIS: 60,
    },
    {
      name: "burglar",
      health: 100,
      ATK: 60,
      DEX: 80,
      INT: 40,
      CONST: 50,
      WIS: 30,
    },
    {
      name: "archer",
      health: 110,
      ATK: 70,
      DEX: 90,
      INT: 30,
      CONST: 50,
      WIS: 40,
    },
  ];
  await nftContract.createCharacterClasses(classIds, stats);
  console.log("RPG classes created successfully");
}
