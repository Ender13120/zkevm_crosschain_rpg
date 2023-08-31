import { Signer } from "@ethersproject/abstract-signer";
import { ethers, upgrades } from "hardhat";
import hre from "hardhat";

import {
  AdminFacet,
  DiamondCutFacet,
  DiamondInit__factory,
  Diamond__factory,
  OwnershipFacet,
  SpiritHeroes,
} from "../typechain-types";
import { mintNFT } from "./mintTestNfts";

const {
  getSelectors,
  FacetCutAction,
} = require("./libraries/diamond");

// const gasPrice = 35000000000;

export async function deployDiamond() {
  const accounts: Signer[] = await ethers.getSigners();
  const deployer = accounts[0];
  const deployerAddress = await deployer.getAddress();
  console.log("Deployer:", deployerAddress);
  // deploy DiamondCutFacet
  const DiamondCutFacet = await ethers.getContractFactory(
    "DiamondCutFacet"
  );
  const diamondCutFacet = await DiamondCutFacet.deploy();
  await diamondCutFacet.deployed();
  console.log("DiamondCutFacet deployed:", diamondCutFacet.address);

  // deploy Diamond
  const Diamond = (await ethers.getContractFactory(
    "Diamond"
  )) as Diamond__factory;
  const diamond = await Diamond.deploy(
    deployerAddress,
    diamondCutFacet.address
  );
  await diamond.deployed();
  console.log("Diamond deployed:", diamond.address);

  // deploy DiamondInit
  const DiamondInit = (await ethers.getContractFactory(
    "DiamondInit"
  )) as DiamondInit__factory;
  const diamondInit = await DiamondInit.deploy();
  await diamondInit.deployed();
  console.log("DiamondInit deployed:", diamondInit.address);

  // deploy facets
  console.log("");
  console.log("Deploying facets");
  const FacetNames = [
    "AdminFacet",
    "BridgeFacet",
    "OwnershipFacet",
    "TeamFacet",
    "CombatFacet",
  ];
  const cut = [];
  for (const FacetName of FacetNames) {
    const Facet = await ethers.getContractFactory(FacetName);
    const facet = await Facet.deploy();
    await facet.deployed();
    console.log(`${FacetName} deployed: ${facet.address}`);
    cut.push({
      facetAddress: facet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(facet),
    });
  }

  const diamondCut = (await ethers.getContractAt(
    "IDiamondCut",
    diamond.address
  )) as DiamondCutFacet;

  // call to init function
  const functionCall =
    diamondInit.interface.encodeFunctionData("init");
  const tx = await diamondCut.diamondCut(
    cut,
    diamondInit.address,
    functionCall
  );
  console.log("Diamond cut tx: ", tx.hash);
  const receipt = await tx.wait();
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`);
  }
  console.log("Completed diamond cut");

  const ownershipFacet = (await ethers.getContractAt(
    "OwnershipFacet",
    diamond.address
  )) as OwnershipFacet;
  const diamondOwner = await ownershipFacet.owner();
  console.log("Diamond owner is:", diamondOwner);

  if (diamondOwner !== deployerAddress) {
    throw new Error(
      `Diamond owner ${diamondOwner} is not deployer address ${deployerAddress}!`
    );
  }

  console.log("deploying SpiritHeroes");
  const HeroNFTContract = await ethers.getContractFactory(
    "SpiritHeroes"
  );

  const heroNFTContract = (await upgrades.deployProxy(
    HeroNFTContract,
    [diamond.address]
  )) as SpiritHeroes;
  await heroNFTContract.deployed();

  console.log(`Hero NFTs deployed: ${heroNFTContract.address}`);

  const adminFacet = (await ethers.getContractAt(
    "AdminFacet",
    diamond.address
  )) as AdminFacet;

  //our game diamond on the L2 zkevm
  let sisterContract = "0x1B3500645372765af1989A5131E125ab2005cBe4";
  let chainTypeL1 = 0;
  console.log("setting diamond addresses");
  const setAddresses = await adminFacet.setAddresses(
    heroNFTContract.address,
    sisterContract,
    5,
    1442,
    chainTypeL1,
    false
  );
  await setAddresses.wait();

  const setSpells = await adminFacet.setupSpells();

  await setSpells.wait();

  return {
    diamondAddress: diamond.address,
    heroAddress: heroNFTContract.address,
  };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  deployDiamond()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
