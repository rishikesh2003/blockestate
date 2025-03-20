"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { ethers } from "ethers";
import { useUser } from "@clerk/nextjs";

// TypeScript declaration for Ethereum provider
declare global {
  interface Window {
    ethereum: any;
  }
}

// Smart contract ABI (Application Binary Interface)
// This is a simplified ABI for a property transfer contract
const contractABI = [
  "function transferProperty(address to, uint256 propertyId) payable",
  "event PropertyTransferred(uint256 indexed propertyId, address indexed from, address indexed to, uint256 amount)",
];

interface BuyButtonProps {
  propertyId: string;
  price: string;
  sellerAddress: string; // The current owner's Ethereum address
  contractAddress: string; // The address of the deployed smart contract
  onSuccess: () => void;
}

export function BuyButton({
  propertyId,
  price,
  sellerAddress,
  contractAddress,
  onSuccess,
}: BuyButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

  const handleBuyProperty = async () => {
    try {
      setIsLoading(true);

      // Check if browser has Ethereum provider (MetaMask)
      if (!window.ethereum) {
        throw new Error(
          "No Ethereum wallet detected. Please install MetaMask."
        );
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const buyerAddress = accounts[0];

      // Create a provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Create contract instance
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      // Convert price from ETH to Wei
      const priceInWei = ethers.parseEther(price);

      // Execute the transaction
      toast.info("Please confirm the transaction in your wallet");

      const tx = await contract.transferProperty(buyerAddress, propertyId, {
        value: priceInWei,
        gasLimit: 300000, // Set an appropriate gas limit
      });

      // Wait for transaction to be mined
      toast.loading("Processing transaction...");
      const receipt = await tx.wait();

      // Get transaction hash
      const transactionHash = receipt.hash;

      // Record the transaction in our database
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId,
          amount: price,
          transactionHash,
          buyerAddress,
          sellerAddress,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Failed to record transaction in database"
        );
      }

      toast.success("Property purchased successfully", {
        description: "The ownership has been transferred to your account",
      });

      onSuccess();
    } catch (error: any) {
      console.error("Error purchasing property:", error);

      // Handle different error types
      if (error.code === 4001) {
        // User rejected transaction
        toast.error("Transaction rejected", {
          description: "You declined the transaction in your wallet.",
        });
      } else if (error.code === -32603) {
        // Internal error (likely insufficient funds)
        toast.error("Transaction failed", {
          description: "You may have insufficient funds for this purchase.",
        });
      } else {
        toast.error("Purchase failed", {
          description:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="w-full flex items-center gap-2"
      variant="default"
      disabled={isLoading}
      onClick={handleBuyProperty}
    >
      <ShoppingCart className="h-4 w-4" />
      {isLoading ? "Processing..." : `Buy Now (ETH ${price})`}
    </Button>
  );
}
