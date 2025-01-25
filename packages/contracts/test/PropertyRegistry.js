const { expect } = require("chai");

describe("PropertyRegistry", function () {
  it("Should allow adding, listing, and buying properties", async function () {
    const [owner, buyer] = await ethers.getSigners();

    // Deploy contract
    const PropertyRegistry =
      await ethers.getContractFactory("PropertyRegistry");
    const registry = await PropertyRegistry.deploy();

    // Add property
    await registry
      .connect(owner)
      .addProperty("House", "City A", ethers.parseEther("1"), "docHash123");
    const property = await registry.getProperty(1);
    expect(property.name).to.equal("House");
    expect(property.owner).to.equal(owner.address);

    // List property for sale
    await registry
      .connect(owner)
      .listPropertyForSale(1, ethers.parseEther("1"));
    const updatedProperty = await registry.getProperty(1);
    expect(updatedProperty.isForSale).to.equal(true);

    // Buy property
    await registry
      .connect(buyer)
      .buyProperty(1, { value: ethers.parseEther("1") });
    const boughtProperty = await registry.getProperty(1);
    expect(boughtProperty.owner).to.equal(buyer.address);
  });
});
