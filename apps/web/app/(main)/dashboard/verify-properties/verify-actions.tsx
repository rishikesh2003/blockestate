"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileCheck, FileX } from "lucide-react";
import { toast } from "sonner";

interface VerifyActionsProps {
  propertyId: string;
  onStatusChange: () => void;
}

export function VerifyActions({
  propertyId,
  onStatusChange,
}: VerifyActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (isVerified: boolean) => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isVerified }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update verification status");
      }

      toast[isVerified ? "success" : "error"](
        isVerified ? "Property Verified" : "Property Rejected",
        {
          description: isVerified
            ? "The property has been verified successfully"
            : "The property verification has been rejected",
        }
      );

      // Refresh the property list
      onStatusChange();
    } catch (error) {
      console.error("Error updating verification status:", error);
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        className="flex items-center gap-1"
        variant="default"
        size="sm"
        disabled={isLoading}
        onClick={() => handleVerify(true)}
      >
        <FileCheck className="h-4 w-4" />
        Verify
      </Button>
      <Button
        className="flex items-center gap-1"
        variant="destructive"
        size="sm"
        disabled={isLoading}
        onClick={() => handleVerify(false)}
      >
        <FileX className="h-4 w-4" />
        Reject
      </Button>
    </div>
  );
}
