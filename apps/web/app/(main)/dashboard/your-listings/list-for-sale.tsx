"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Tag, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ethers } from "ethers";
import { listPropertyForSale, removePropertyFromSale } from "@/lib/blockchain";

// TypeScript declaration for Ethereum provider
declare global {
  interface Window {
    ethereum: any;
  }
}

interface ListForSaleProps {
  propertyId: string;
  blockchainId?: number;
  isForSale: boolean;
  currentPrice?: string;
}

export function ListForSale({
  propertyId,
  blockchainId,
  isForSale,
  currentPrice,
}: ListForSaleProps) {
  const [price, setPrice] = useState(currentPrice || "");
  const [isLoading, setIsLoading] = useState(false);

  // Handle removing property from sale with blockchain integration
  const handleRemoveFromSale = async () => {
    try {
      setIsLoading(true);

      // Check if property has a blockchain ID
      if (!blockchainId) {
        // If no blockchain ID, just use the POST method to update DB only
        const response = await fetch(
          `/api/properties/${propertyId}?action=remove-from-sale`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to remove property from sale");
        }

        toast.success("Property removed from sale");
        window.location.reload();
        return;
      }

      toast.info("Starting blockchain transaction...");

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error(
          "No Ethereum accounts found. Please connect your wallet."
        );
      }

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Call blockchain function to remove property from sale
      toast.info("Please confirm the transaction in your wallet");

      // Execute the blockchain transaction
      const txHash = await removePropertyFromSale(signer, blockchainId);
      console.log(
        "Property removed from sale on blockchain with transaction:",
        txHash
      );

      // Now update the database
      const response = await fetch(
        `/api/properties/${propertyId}?action=remove-from-sale`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Failed to update database after removing from sale"
        );
      }

      toast.success("Property removed from sale", {
        description:
          "Your property has been removed from sale on the blockchain and our database.",
      });

      // Refresh the property list
      window.location.reload();
    } catch (error: any) {
      console.error("Error removing property from sale:", error);

      // Handle user rejection of transaction
      if (error.code === 4001) {
        toast.error("Transaction cancelled", {
          description: "You cancelled the transaction in your wallet.",
        });
      } else {
        toast.error("Error removing property from sale", {
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

  const handleListForSale = async () => {
    try {
      setIsLoading(true);

      if (!price) {
        toast.error("Please enter a price");
        return;
      }

      // For listing for sale, use blockchain integration
      // Check if property has a blockchain ID
      if (!blockchainId) {
        toast.error("Property not found on blockchain", {
          description:
            "This property hasn't been registered on the blockchain yet.",
        });
        return;
      }

      // Check if MetaMask is available
      if (!window.ethereum) {
        toast.error("MetaMask not detected", {
          description:
            "Please install MetaMask to list your property for sale on the blockchain.",
        });
        return;
      }

      toast.info("Starting blockchain transaction...");

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error(
          "No Ethereum accounts found. Please connect your wallet."
        );
      }

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Call blockchain function to list property for sale
      toast.info("Please confirm the transaction in your wallet");

      // Execute the blockchain transaction
      const txHash = await listPropertyForSale(signer, blockchainId, price);
      console.log("Property listed on blockchain with transaction:", txHash);

      // Now update the database
      const response = await fetch(
        `/api/properties/${propertyId}?action=list-for-sale`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            price,
            transactionHash: txHash,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Failed to update property listing in database"
        );
      }

      toast.success("Property listed for sale", {
        description:
          "Your property has been listed for sale on the blockchain and our database.",
      });

      // Refresh the property list
      window.location.reload();
    } catch (error: any) {
      console.error("Error listing property for sale:", error);

      // Handle user rejection of transaction
      if (error.code === 4001) {
        toast.error("Transaction cancelled", {
          description: "You cancelled the transaction in your wallet.",
        });
      } else {
        toast.error("Error listing property", {
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
    <div className="space-y-4">
      {!isForSale ? (
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="price">Price (ETH)</Label>
            <div className="relative">
              <CreditCard className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="price"
                placeholder="0.00"
                className="pl-8"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
          {!blockchainId && (
            <div className="flex items-start gap-2 p-2 rounded-md bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
              <p className="text-xs text-amber-800">
                This property hasn&apos;t been registered on the blockchain yet.
                List it first to get a blockchain ID.
              </p>
            </div>
          )}
          <Button
            className="w-full flex items-center gap-2"
            variant="default"
            disabled={isLoading}
            onClick={handleListForSale}
          >
            <Tag className="h-4 w-4" />
            List for Sale
          </Button>
        </div>
      ) : (
        <Button
          className="w-full"
          variant="destructive"
          disabled={isLoading}
          onClick={handleRemoveFromSale}
        >
          Remove Listing
        </Button>
      )}
    </div>
  );
}
