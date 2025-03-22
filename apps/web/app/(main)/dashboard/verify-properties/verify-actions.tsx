"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileCheck, FileX } from "lucide-react";
import { toast } from "sonner";
import { ethers } from "ethers";
import { verifyProperty } from "@/lib/blockchain";

// TypeScript declaration for Ethereum provider
declare global {
  interface Window {
    ethereum: any;
  }
}

interface PropertyWithBlockchain extends Record<string, any> {
  id: string;
  blockchainId?: number;
}

interface VerifyActionsProps {
  propertyId: string;
  onStatusChange: () => void;
}

export function VerifyActions({
  propertyId,
  onStatusChange,
}: VerifyActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingOnChain, setIsVerifyingOnChain] = useState(false);

  // Combined verification function
  const handleVerify = async () => {
    try {
      setIsLoading(true);

      // First, get the property details to get the blockchain ID
      const propertyResponse = await fetch(`/api/properties/${propertyId}`);
      if (!propertyResponse.ok) {
        throw new Error("Failed to fetch property details");
      }

      const property: PropertyWithBlockchain = await propertyResponse.json();
      let transactionHash = `manual_verification_${Date.now()}`;

      // If property has blockchain ID, verify on blockchain
      if (property.blockchainId) {
        try {
          setIsVerifyingOnChain(true);
          toast.info("Starting blockchain verification...");

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

          // Call blockchain function to verify property
          toast.info("Please confirm the transaction in your wallet");

          // Use the blockchain ID for the blockchain transaction
          transactionHash = await verifyProperty(signer, property.blockchainId);
          console.log(
            "Property verified on blockchain. Transaction hash:",
            transactionHash
          );
        } catch (chainError: any) {
          // If blockchain verification fails, log and continue with DB update
          console.error("Error during blockchain verification:", chainError);

          // For user rejection, don't continue
          if (chainError.code === 4001) {
            toast.error("Transaction rejected", {
              description: "You declined the transaction in your wallet.",
            });
            return;
          }

          // For other errors, warn but continue with DB verification
          toast.warning(
            "Blockchain verification failed, continuing with database update",
            {
              description:
                chainError instanceof Error
                  ? chainError.message
                  : "Unknown error",
            }
          );
        } finally {
          setIsVerifyingOnChain(false);
        }
      }

      // Update database status via API
      const updateResponse = await fetch(
        `/api/properties/${propertyId}?action=verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transactionHash: transactionHash,
            isVerified: true,
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error("API Response Error:", {
          status: updateResponse.status,
          statusText: updateResponse.statusText,
          body: errorText,
        });

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: "Error parsing response: " + errorText };
        }

        throw new Error(
          errorData.error ||
            `Failed to update database: ${updateResponse.status} ${updateResponse.statusText}`
        );
      }

      toast.success("Property verified successfully", {
        description: property.blockchainId
          ? "The property has been verified on the blockchain and database"
          : "The property has been verified in the database",
      });

      // Refresh the property list
      onStatusChange();
    } catch (error) {
      console.error("Error verifying property:", error);
      toast.error("Verification failed", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reject function
  const handleReject = async () => {
    try {
      setIsLoading(true);

      // Use the main endpoint with action=verify and isVerified=false
      const response = await fetch(
        `/api/properties/${propertyId}?action=verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transactionHash: `manual_rejection_${Date.now()}`,
            isVerified: false,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reject property");
      }

      toast.error("Property Rejected", {
        description: "The property verification has been rejected",
      });

      // Refresh the property list
      onStatusChange();
    } catch (error) {
      console.error("Error rejecting property:", error);
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        className="flex items-center gap-1"
        variant="default"
        size="sm"
        disabled={isLoading || isVerifyingOnChain}
        onClick={handleVerify}
      >
        <FileCheck className="h-4 w-4" />
        Verify
      </Button>
      <Button
        className="flex items-center gap-1"
        variant="destructive"
        size="sm"
        disabled={isLoading || isVerifyingOnChain}
        onClick={handleReject}
      >
        <FileX className="h-4 w-4" />
        Reject
      </Button>
    </div>
  );
}
