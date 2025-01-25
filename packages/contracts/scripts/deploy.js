const governmentAddress = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";
const PropertyRegistry = await ethers.getContractFactory("PropertyRegistry");
const registry = await PropertyRegistry.deploy(governmentAddress);
console.log("PropertyRegistry deployed to:", registry.address);
