const hre = require("hardhat");

async function main() {
  const PropertyRegistry =
    await hre.ethers.getContractFactory("PropertyRegistry");
  const registry = await PropertyRegistry.deploy();

  await registry.deployed();

  console.log("PropertyRegistry deployed to:", registry.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
