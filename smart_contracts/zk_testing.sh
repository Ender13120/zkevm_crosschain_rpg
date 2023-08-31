#!/bin/bash


echo "Running Flow Test Script..."
npx hardhat run scripts/flowtestscript.ts --network goerli


echo "Broadcasting ownership to L2..."
npx hardhat run scripts/broadcastOwnershipL2.ts --network goerli


sleep 600
echo "Accepting ownership on L2..."
npx hardhat run scripts/acceptOwnershipL2.ts --network zkevmtestnet


sleep 90
echo "Validating ownership on L2..."
npx hardhat run scripts/checkOwnershipL2.ts --network zkevmtestnet



echo "All done!"
