import { ethers } from "ethers";
import { createHash } from "crypto";

// Smart contract ABI and address
const contractABI = [
  "function addProperty(string memory name, string memory location, uint256 price, string memory documentHash) public",
  "function listPropertyForSale(uint256 propertyId, uint256 price) public",
  "function removePropertyFromSale(uint256 propertyId) public",
  "function buyProperty(uint256 propertyId) public payable",
  "function verifyProperty(uint256 propertyId) public",
  "function getProperty(uint256 propertyId) public view returns (tuple(uint256 id, string name, string location, uint256 price, address owner, string documentHash, bool isForSale, bool isVerified))",
];

const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";

// Create MD5 hash of document
export const createDocumentHash = (document: string): string => {
  return createHash("md5").update(document).digest("hex");
};

// Setup provider and contract instance
export const getContract = async (signer: ethers.JsonRpcSigner) => {
  return new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
};

// Get a signer from the provider
export const getSigner = async (provider: ethers.BrowserProvider) => {
  return provider.getSigner();
};

// Add a property to the blockchain
export const addProperty = async (
  signer: ethers.JsonRpcSigner,
  name: string,
  location: string,
  price: string,
  documentHash: string
) => {
  const contract = await getContract(signer);
  const priceInWei = ethers.parseEther(price);

  const tx = await contract.addProperty(
    name,
    location,
    priceInWei,
    documentHash
  );
  const receipt = await tx.wait();

  // Parse logs to find PropertyAdded event and extract propertyId
  // The PropertyAdded event emits: event PropertyAdded(uint256 id, string name, address owner);
  if (receipt && receipt.logs && receipt.logs.length > 0) {
    try {
      // First approach: Use interface to parse logs
      const eventInterface = new ethers.Interface([
        "event PropertyAdded(uint256 id, string name, address owner)",
      ]);

      for (const log of receipt.logs) {
        try {
          const parsedLog = eventInterface.parseLog({
            topics: log.topics,
            data: log.data,
          });

          if (parsedLog && parsedLog.name === "PropertyAdded") {
            const propertyId = parsedLog.args[0]; // First argument is id
            return Number(propertyId);
          }
        } catch (e) {
          // This log wasn't a PropertyAdded event, continue to next log
          continue;
        }
      }

      // Second approach: Query property count (should match the latest property ID)
      const propertyCount = await contract.propertyCount;
      return Number(propertyCount);
    } catch (err) {
      console.error("Error getting property ID:", err);

      // Last resort fallback if all else fails
      console.error("Using last resort fallback");
      return 1;
    }
  }

  throw new Error("Failed to add property");
};

// List a property for sale
export const listPropertyForSale = async (
  signer: ethers.JsonRpcSigner,
  propertyId: number,
  price: string
) => {
  const contract = await getContract(signer);
  const priceInWei = ethers.parseEther(price);

  const tx = await contract.listPropertyForSale(propertyId, priceInWei);
  const receipt = await tx.wait();

  return receipt.hash;
};

// Buy a property
export const buyProperty = async (
  signer: ethers.JsonRpcSigner,
  propertyId: number,
  price: string
) => {
  const contract = await getContract(signer);
  const priceInWei = ethers.parseEther(price);

  const tx = await contract.buyProperty(propertyId, { value: priceInWei });
  const receipt = await tx.wait();

  return receipt.hash;
};

// Verify a property (government only)
export const verifyProperty = async (
  signer: ethers.JsonRpcSigner,
  propertyId: number
) => {
  const contract = await getContract(signer);

  const tx = await contract.verifyProperty(propertyId);
  const receipt = await tx.wait();

  return receipt.hash;
};

// Get property details from blockchain
export const getProperty = async (
  provider: ethers.Provider,
  propertyId: number
) => {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

  const property = await contract.getProperty(propertyId);

  return {
    id: Number(property.id),
    name: property.name,
    location: property.location,
    price: ethers.formatEther(property.price),
    owner: property.owner,
    documentHash: property.documentHash,
    isForSale: property.isForSale,
    isVerified: property.isVerified,
  };
};

// Remove property from sale
export const removePropertyFromSale = async (
  signer: ethers.JsonRpcSigner,
  propertyId: number
) => {
  const contract = await getContract(signer);

  const tx = await contract.removePropertyFromSale(propertyId);
  const receipt = await tx.wait();

  return receipt.hash;
};
