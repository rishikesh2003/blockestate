async function main() {
  // Get deployer's signer

  // Define user1 and user2 using their specific addresses
  const user1 = await ethers.getSigner(
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  );

  // Attach to the deployed PropertyRegistry contract
  const propertyRegistry = await ethers.getContractAt(
    "PropertyRegistry",
    "0x5fbdb2315678afecb367f032d93f642f64180aa3",
  );

  const property = await propertyRegistry.getProperty(4);
  console.log("Property:", property);
  console.log("Property successfully retrieved!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
