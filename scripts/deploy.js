/**
 * Deployment script for EventHorizonAccessControl contract
 * Run with: npx hardhat run scripts/deploy.js --network sepolia
 */

const hre = require("hardhat");
const { ethers } = require("hardhat"); // Import ethers

async function main() {
  console.log("Starting EventHorizonAccessControl deployment...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contract with account: ${deployer.address}`);

  // Get contract factory
  const AccessControl = await ethers.getContractFactory("EventHorizonAccessControl");

  // Deploy contract
  const contract = await AccessControl.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`✓ EventHorizonAccessControl deployed to: ${contractAddress}`);

  // Assign test roles
  console.log("\nAssigning test roles...");

  const FOUNDER_ADDR = deployer.address; // Deployer is founder
  const ENGINEER_ADDR = "0x70997970C51812e339D9B73b0245ad59c36d569"; // Example address
  const MARKETING_ADDR = "0x3C44CdDdB6a900c6671B362144b622A5EF2e5D57"; // Example address

  // Assign Engineer role
  try {
    await contract.assignRole(ENGINEER_ADDR, 1); // 1 = ENGINEER
    console.log(`✓ Assigned ENGINEER role to ${ENGINEER_ADDR}`);
  } catch (error) {
    console.log(`Note: Could not assign Engineer role (may need manual assignment): ${error.message}`);
  }

  // Assign Marketing role
  try {
    await contract.assignRole(MARKETING_ADDR, 2); // 2 = MARKETING
    console.log(`✓ Assigned MARKETING role to ${MARKETING_ADDR}`);
  } catch (error) {
    console.log(`Note: Could not assign Marketing role (may need manual assignment): ${error.message}`);
  }

  // Verify roles were assigned
  console.log("\nVerifying assigned roles...");
  const founderRole = await contract.getUserRole(deployer.address);
  console.log(`Founder role: ${founderRole} (0 = FOUNDER)`);

  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    deployerAddress: deployer.address,
    network: "sepolia",
    deploymentTime: new Date().toISOString(),
    roles: {
      founder: deployer.address,
      engineer: ENGINEER_ADDR,
      marketing: MARKETING_ADDR,
    }
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Export for environment variables
  console.log("\n=== Add to .env.local ===");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`NEXT_PUBLIC_NETWORK_ID=11155111`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
