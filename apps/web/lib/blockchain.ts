import { ethers } from "ethers";
import { createHash } from "crypto";

// Smart contract ABI and address
const contractABI = [
  "function addProperty(string memory name, string memory location, uint256 price, string memory documentHash) public",
  "function listPropertyForSale(uint256 propertyId, uint256 price) public",
  "function buyProperty(uint256 propertyId) public payable",
  "function verifyProperty(uint256 propertyId) public",
  "function getProperty(uint256 propertyId) public view returns (tuple(uint256 id, string name, string location, uint256 price, address owner, string documentHash, bool isForSale, bool isVerified))",
];

const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x5fbdb2315678afecb367f032d93f642f64180aa3";

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
  // This assumes the PropertyAdded event is the first event in the logs
  if (receipt && receipt.logs && receipt.logs.length > 0) {
    // Simple approach: assuming the first log contains the property ID
    // In a production environment, you would need to decode the logs properly
    return 1; // Placeholder for actual property ID extraction
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
  await tx.wait();

  return true;
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
  await tx.wait();

  return true;
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
