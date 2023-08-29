#!/bin/bash

echo "Starting L1 Deployment..."
npx hardhat run scripts/l1deployscript.ts --network goerli 

echo "Starting L2 Deployment..."
npx hardhat run scripts/l2deployscript.ts --network zkevmtestnet

echo "Sleeping for 30 seconds..."
sleep 30

echo "Updating L1..."
npx hardhat run scripts/l1updatescript.ts --network goerli 

echo "Sleeping for 30 seconds..."
sleep 30

echo "Updating L2..."
npx hardhat run scripts/l2updatescript.ts --network zkevmtestnet

echo "Sleeping for 15 seconds..."
sleep 15

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
