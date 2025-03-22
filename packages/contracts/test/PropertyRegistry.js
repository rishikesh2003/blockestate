const { expect } = require("chai");

describe("PropertyRegistry", function () {
  let registry;
  let owner;
  let buyer;
  let government;

  beforeEach(async function () {
    [owner, buyer, government] = await ethers.getSigners();

    // Deploy contract with government address
    const PropertyRegistry = await ethers.getContractFactory("PropertyRegistry");
    registry = await PropertyRegistry.deploy(government.address);
  });

  it("Should allow adding, listing, and buying properties", async function () {
    // Add property
    await registry
      .connect(owner)
      .addProperty("House", "City A", ethers.parseEther("1"), "docHash123");
    const property = await registry.getProperty(1);
    expect(property.name).to.equal("House");
    expect(property.owner).to.equal(owner.address);

    // Verify property with government account
    await registry.connect(government).verifyProperty(1);
    
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

  it("Should allow removing property from sale", async function () {
    // Add property
    await registry
      .connect(owner)
      .addProperty("House", "City A", ethers.parseEther("1"), "docHash123");
    
    // Verify property with government account
    await registry.connect(government).verifyProperty(1);
    
    // List property for sale
    await registry
      .connect(owner)
      .listPropertyForSale(1, ethers.parseEther("1"));
    
    let listedProperty = await registry.getProperty(1);
    expect(listedProperty.isForSale).to.equal(true);
    
    // Remove property from sale
    await registry.connect(owner).removePropertyFromSale(1);
    
    // Check property is no longer for sale
    const unlistedProperty = await registry.getProperty(1);
    expect(unlistedProperty.isForSale).to.equal(false);
  });

  it("Should not allow non-owners to remove property from sale", async function () {
    // Add property
    await registry
      .connect(owner)
      .addProperty("House", "City A", ethers.parseEther("1"), "docHash123");
    
    // Verify property with government account
    await registry.connect(government).verifyProperty(1);
    
    // List property for sale
    await registry
      .connect(owner)
      .listPropertyForSale(1, ethers.parseEther("1"));
    
    // Try to remove property from sale using non-owner account
    await expect(
      registry.connect(buyer).removePropertyFromSale(1)
    ).to.be.revertedWith("Only the owner can remove the property from sale");
  });
});
