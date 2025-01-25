// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PropertyRegistry {
    struct Property {
        uint256 id;
        string name;
        string location;
        uint256 price;
        address owner;
        string documentHash;
        bool isForSale;
        bool isVerified;
    }

    uint256 public propertyCount;
    mapping(uint256 => Property) public properties;
    address public government;

    event PropertyAdded(uint256 id, string name, address owner);
    event PropertyListedForSale(uint256 id, uint256 price);
    event OwnershipTransferred(uint256 id, address previousOwner, address newOwner);
    event PropertyBought(uint256 id, address buyer);
    event PropertyVerified(uint256 id, address verifiedBy);

    // Constructor to set the government address
    constructor(address _government) {
        government = _government;
    }

    // Add a new property
    function addProperty(
        string memory name,
        string memory location,
        uint256 price,
        string memory documentHash
    ) public {
        propertyCount++;
        properties[propertyCount] = Property(
            propertyCount,
            name,
            location,
            price,
            msg.sender,
            documentHash,
            false,
            false // Initially, the property is not verified
        );
        emit PropertyAdded(propertyCount, name, msg.sender);
    }

    // List a property for sale
    function listPropertyForSale(uint256 propertyId, uint256 price) public {
        Property storage property = properties[propertyId];
        require(property.owner == msg.sender, "Only the owner can list the property for sale");
        require(property.isVerified, "Property must be verified before being listed for sale"); // New check
        property.isForSale = true;
        property.price = price;
        emit PropertyListedForSale(propertyId, price);
    }

    // Buy a property
    function buyProperty(uint256 propertyId) public payable {
        Property storage property = properties[propertyId];
        require(property.isForSale, "Property is not for sale");
        require(msg.value == property.price, "Incorrect payment amount");

        address previousOwner = property.owner;
        property.owner = msg.sender;
        property.isForSale = false;

        payable(previousOwner).transfer(msg.value);

        emit PropertyBought(propertyId, msg.sender);
        emit OwnershipTransferred(propertyId, previousOwner, msg.sender);
    }

    // Verify a property (only government can call)
    function verifyProperty(uint256 propertyId) public {
        require(msg.sender == government, "Only the government can verify properties");
        Property storage property = properties[propertyId];
        property.isVerified = true;
        emit PropertyVerified(propertyId, msg.sender);
    }

    // Get property details
    function getProperty(uint256 propertyId) public view returns (Property memory) {
        return properties[propertyId];
    }
}
