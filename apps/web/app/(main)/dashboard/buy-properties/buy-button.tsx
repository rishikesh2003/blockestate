"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { ethers } from "ethers";
import { useUser } from "@clerk/nextjs";
import { buyProperty } from "@/lib/blockchain";

// TypeScript declaration for Ethereum provider
declare global {
  interface Window {
    ethereum: any;
  }
}

interface BuyButtonProps {
  propertyId: number;
  dbPropertyId: string;
  price: string;
}

export function BuyButton({ propertyId, dbPropertyId, price }: BuyButtonProps) {
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

      if (!accounts || accounts.length === 0) {
        throw new Error(
          "No Ethereum accounts found. Please connect your wallet."
        );
      }

      // Create a provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Execute the transaction
      toast.info("Please confirm the transaction in your wallet", {
        description: `You are about to purchase this property for ${price} ETH`,
      });

      const txHash = await buyProperty(signer, propertyId, price);

      // Now update the database
      const response = await fetch(
        `/api/properties/${dbPropertyId}?action=buy`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transactionHash: txHash,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Failed to update database after purchase"
        );
      }

      toast.success("Property purchased successfully", {
        description: "Congratulations! You are now the owner of this property.",
      });

      // Reload page to reflect changes
      window.location.reload();
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
