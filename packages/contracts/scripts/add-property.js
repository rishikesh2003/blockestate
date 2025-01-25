async function main() {
  // Get deployer's signer
  const [deployer] = await ethers.getSigners();

  // Define user1 and user2 using their specific addresses
  const user1 = await ethers.getSigner(
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  );
  const user2 = await ethers.getSigner(
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  );

  // Attach to the deployed PropertyRegistry contract
  const propertyRegistry = await ethers.getContractAt(
    "PropertyRegistry",
    "0x5fbdb2315678afecb367f032d93f642f64180aa3",
  );

  // Add properties for user1
  await propertyRegistry.connect(user1).addProperty(
    "Land A - User 1",
    "Location 1",
    ethers.parseEther("5"), // Price in ETH
    "hash-of-doc-A-user1",
  );

  await propertyRegistry.connect(user1).addProperty(
    "Land B - User 1",
    "Location 2",
    ethers.parseEther("8"), // Price in ETH
    "hash-of-doc-B-user1",
  );

  // Add properties for user2
  await propertyRegistry.connect(user2).addProperty(
    "Land A - User 2",
    "Location 3",
    ethers.parseEther("10"), // Price in ETH
    "hash-of-doc-A-user2",
  );

  await propertyRegistry.connect(user2).addProperty(
    "Land B - User 2",
    "Location 4",
    ethers.parseEther("12"), // Price in ETH
    "hash-of-doc-B-user2",
  );

  console.log("Properties successfully added for user1 and user2!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
