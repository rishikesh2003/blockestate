"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Tag } from "lucide-react";
import { toast } from "sonner";

interface ListForSaleProps {
  propertyId: string;
  isForSale: boolean;
  currentPrice?: string;
  onListingUpdate: () => void;
}

export function ListForSale({
  propertyId,
  isForSale,
  currentPrice,
  onListingUpdate,
}: ListForSaleProps) {
  const [price, setPrice] = useState(currentPrice || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleListingUpdate = async (newListingStatus: boolean) => {
    try {
      setIsLoading(true);

      if (newListingStatus && !price) {
        toast.error("Please enter a price");
        return;
      }

      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isForSale: newListingStatus,
          price: newListingStatus ? price : currentPrice,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update property listing");
      }

      toast.success(
        newListingStatus
          ? "Property listed for sale"
          : "Property removed from sale"
      );

      // Refresh the property list
      onListingUpdate();
    } catch (error) {
      console.error("Error updating property listing:", error);
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
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
          <Button
            className="w-full flex items-center gap-2"
            variant="default"
            disabled={isLoading}
            onClick={() => handleListingUpdate(true)}
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
          onClick={() => handleListingUpdate(false)}
        >
          Remove Listing
        </Button>
      )}
    </div>
  );
}
